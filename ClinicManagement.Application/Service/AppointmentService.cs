using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;
using ClinicManagement.Domain.Interfaces;

namespace ClinicManagement.Application.Service
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IUnitOfWork _unitOfWork;
        public AppointmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public async Task<Result<AppointmentDto>> BookAsync(CreateAppointmentReqDto req)
        {
            var pateint = await _unitOfWork.Patients.GetByUserIdAsync(req.PatientId);
            var doctor = await _unitOfWork.Doctors.GetByUserIdAsync(req.DoctorId);

            if (doctor == null)
                return Result<AppointmentDto>.NotFound("Doctor Not Found");

            if (!doctor.IsAvailable)
                return Result<AppointmentDto>.Failure("Doctor not available");

            if (req.AppointmentDt < DateTime.UtcNow)
                return Result<AppointmentDto>.Failure("Invalid date");

            if (await _unitOfWork.Appointments.HasConflictAsync(req.DoctorId, req.AppointmentDt))
                return Result<AppointmentDto>.Failure("Conflict Time");

            var schedules = await _unitOfWork.Schedules.GetBydoctorId(req.DoctorId);
            if (!schedules.Any())
                return Result<AppointmentDto>.NotFound("No Schedules For This Doctor");

            var validSchedule = schedules.FirstOrDefault(
                x => x.WeekDay == req.AppointmentDt.DayOfWeek && x.IsActive);

            if (validSchedule == null)
                return Result<AppointmentDto>.Failure("Doctor Is Not available in This Day");

            var time = TimeOnly.FromDateTime(req.AppointmentDt);

            if (time <= validSchedule.StartTime || time >= validSchedule.EndTime)
                return Result<AppointmentDto>.Failure("Outside working hours");

            if (pateint == null)
                return Result<AppointmentDto>.NotFound("Patient Not Found");


            var appointment = new Appointment
            {
                PatientId = pateint.Id,
                DoctorId = doctor.Id,
                AppointmentDt = req.AppointmentDt,
                Notes = req.Notes,
            };


            await _unitOfWork.Appointments.AddAsync(appointment);
            await _unitOfWork.SaveChangesAsync();

            var response = new AppointmentDto(
                appointment.Id,
                pateint.UserId,
                pateint.User.FirstName,
                doctor.UserId,
                doctor.User.FirstName,
                doctor.Specialization,
                appointment.AppointmentDt,
                appointment.Status,
                appointment.Notes
            );

            return Result<AppointmentDto>.Success(response, 201);
        }

        public async Task<Result<bool>> CancelAppointmentAsync(Guid Id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(Id);
            if (appointment == null)
                return Result<bool>.NotFound("appointment Not Found");

            if (appointment.Status == Status.Completed)
                return Result<bool>.Failure("Can't Cancel Completed Appointment");
            appointment.Status = Status.Cancelled;
            //await _unitOfWork.Appointments.UpdateAsync(appointment);
            await _unitOfWork.SaveChangesAsync();
            return Result<bool>.Success(true);
        }

        public async Task<Result<AppointmentDto>> CompleteAppointmentAsync(Guid Id, CompleteAppointmentStatus status)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdWithUserDetails(Id);
            if (appointment == null)
                return Result<AppointmentDto>.NotFound("appointment Not Found");

            if (appointment.Status == Status.Completed)
                return Result<AppointmentDto>.Failure("Can't Cancel Completed Appointment");

            if (status.Prescriptions.Any())
                foreach (var p in status.Prescriptions)
                    await _unitOfWork.Prescriptions.AddAsync(new Prescription
                    {
                        AppointmentId = Id,
                        PatientId = appointment.PatientId,
                        DoctorId = appointment.DoctorId,
                        MedicationName = p.MedicationName,
                        Frequency = p.Frequency,
                        DurationDays = p.DurationDays,
                        Notes = p.Notes
                    });

            if (appointment.Status != Status.Scheduled)
                return Result<AppointmentDto>.Failure("Invalid status");
            appointment.Status = status.Status;

            //await _unitOfWork.Appointments.UpdateAsync(appointment); ممكن نستغني عنو لأنو التعديل هيتحفظ مباشره اسرع واحسن 
            await _unitOfWork.SaveChangesAsync();
            return Result<AppointmentDto>.Success(MapAppointment(appointment));

        }

        public async Task<Result<IEnumerable<AppointmentDto>>> GetAppointmentByDoctorIdAsync(Guid doctorId)
        {
            var appointments = await _unitOfWork.Appointments.GetAppointmentByDoctorId(doctorId);
            if (!appointments.Any())
                return Result<IEnumerable<AppointmentDto>>.NotFound("No Appointments");

            return Result<IEnumerable<AppointmentDto>>.Success(appointments.Select(MapAppointment));

        }

        public async Task<Result<AppointmentDto>> GetAppointmentByIdAsync(Guid id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdWithUserDetails(id);
            if (appointment == null)
                return Result<AppointmentDto>.NotFound("appointment Not Found");

            return Result<AppointmentDto>.Success(MapAppointment(appointment));
        }

        public async Task<Result<IEnumerable<AppointmentDto>>> GetAppointmentByPateintIdAsync(Guid pateintId)
        {
            var appointments = await _unitOfWork.Appointments.GetAppointmentByPateintId(pateintId);
            if (!appointments.Any())
                return Result<IEnumerable<AppointmentDto>>.NotFound("No Appointments");

            return Result<IEnumerable<AppointmentDto>>.Success(appointments.Select(MapAppointment));
        }

        public async Task<Result<AppointmentDto>> RescheduleAppointmentAysnc(Guid Id, RescheduleAppointmentRequest req)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdWithUserDetails(Id);
            if (appointment == null)
                return Result<AppointmentDto>.NotFound("appointment Not Found");

            if (await _unitOfWork.Appointments.HasConflictAsync(appointment.DoctorId, req.NewDateTime))
                return Result<AppointmentDto>.Failure("Conflict Time");

            if (appointment.Status == Status.Completed)
                return Result<AppointmentDto>.Failure("Can't Reschedule Complted Appointment");

            if (appointment.Status == Status.Cancelled)
                return Result<AppointmentDto>.Failure("Can't Reschedule Cancelled Appointment");

            if (req.NewDateTime < DateTime.UtcNow)
                return Result<AppointmentDto>.Failure("Invalid Date");

            var doctor = await _unitOfWork.Doctors.GetByIdAsync(appointment.DoctorId);
            if (doctor == null || !doctor.IsAvailable)
                return Result<AppointmentDto>.Failure("Doctor Is Not Available");

            var time = TimeOnly.FromDateTime(req.NewDateTime);
            var schedules = await _unitOfWork.Schedules.GetBydoctorId(doctor.UserId);
            var validSchedule = schedules.FirstOrDefault(s =>
            s.WeekDay == req.NewDateTime.DayOfWeek &&
            s.IsActive && time >= s.StartTime && time < s.EndTime);

            if (validSchedule == null)
                return Result<AppointmentDto>.Failure("Doctor Is Not available in This Time");

            appointment.AppointmentDt = req.NewDateTime;
            //await _unitOfWork.Appointments.UpdateAsync(appointment);
            await _unitOfWork.SaveChangesAsync();

            return Result<AppointmentDto>.Success(MapAppointment(appointment), 201);
        }
        public async Task<Result<bool>> DeleteAppointmentAsync(Guid Id)
        {
            var appointment = await _unitOfWork.Appointments.GetByIdAsync(Id);
            if (appointment == null)
                return Result<bool>.NotFound("appointment Not Found");
            await _unitOfWork.Appointments.DeleteAsync(Id);
            await _unitOfWork.SaveChangesAsync();
            return Result<bool>.Success(true);
        }




        private static AppointmentDto MapAppointment(Appointment dto)
        {
            return new AppointmentDto(
                  dto.Id,
                  dto.Patinet.UserId,
                  dto.Patinet.User.FirstName,
                  dto.Doctor.UserId,
                  dto.Doctor.User.FirstName,
                  dto.Doctor.Specialization,
                  dto.AppointmentDt,
                  dto.Status,
                  dto.Notes
                );
        }
    }
}
