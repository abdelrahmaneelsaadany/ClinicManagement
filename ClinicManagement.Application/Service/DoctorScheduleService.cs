using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;

namespace ClinicManagement.Application.Service
{
    public class DoctorScheduleService : IDoctorScheduleService
    {
        private readonly IUnitOfWork _unitOfWork;
        public DoctorScheduleService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<DoctorScheduleResponse>> AddAsync(DoctorScheduleReq req)
        {
            if (req == null)
                return Result<DoctorScheduleResponse>.Failure("Invalud Schedule");

            var doctor = await _unitOfWork.Doctors.GetByUserIdAsync(req.DoctorUserId);

            if (doctor is null)
                return Result<DoctorScheduleResponse>.Failure("Invalud DoctorId");

            if (req.SlotDurationMinutes > 60)
                return Result<DoctorScheduleResponse>.Failure("Maximum Duration Is 60");

            if (req.EndTime < req.StartTime)
                return Result<DoctorScheduleResponse>.Failure("Invalud Schedule");

            var schedule = new DoctorSchedule
            {
                DoctorId = doctor.Id,
                WeekDay = req.WeekDay,
                StartTime = req.StartTime,
                EndTime = req.EndTime,
                SlotDurationMinutes = req.SlotDurationMinutes,
                IsActive = req.isActive,
            };
            await _unitOfWork.Schedules.AddAsync(schedule);
            await _unitOfWork.SaveChangesAsync();

            var response = new DoctorScheduleResponse(
                    schedule.Id,
                    doctor.UserId,
                    $"{doctor.User.FirstName} {doctor.User.LastName}",
                    schedule.WeekDay,
                    schedule.StartTime,
                    schedule.EndTime,
                    schedule.SlotDurationMinutes,
                    schedule.IsActive
                );

            return Result<DoctorScheduleResponse>.Success(response, 201);
        }
        public async Task<Result<IEnumerable<DoctorScheduleResponse>>> GetSchedulesByActiveAsync()
        {
            var schedules = await _unitOfWork.Schedules.GetActiveSlots();
            if (!schedules.Any())
                return Result<IEnumerable<DoctorScheduleResponse>>.NotFound("No Active Schedules");

            return Result<IEnumerable<DoctorScheduleResponse>>.Success(schedules.Select(MapSchedule));
        }

        public async Task<Result<IEnumerable<DoctorScheduleResponse>>> GetScheulesByDoctorIdAsync(Guid doctorId)
        {
            var schedules = await _unitOfWork.Schedules.GetBydoctorId(doctorId);
            if (!schedules.Any())
                return Result<IEnumerable<DoctorScheduleResponse>>.NotFound("No Schedules For This Doctor");

            return Result<IEnumerable<DoctorScheduleResponse>>.Success(schedules.Select(MapSchedule));
        }

        public async Task<Result<IEnumerable<DoctorScheduleResponse>>> GetShedulesByDayOfweekAsync(DayOfWeek dayOfWeek)
        {
            var schedules = await _unitOfWork.Schedules.GetByDayOfWeek(dayOfWeek);
            if (!schedules.Any())
                return Result<IEnumerable<DoctorScheduleResponse>>.NotFound("No Schedules For This Day");

            return Result<IEnumerable<DoctorScheduleResponse>>.Success(schedules.Select(MapSchedule));
        }

        public async Task<Result<DoctorScheduleResponse>> EditActiveSlotsAsync(Guid Id, bool active)
        {
            var schedule = await _unitOfWork.Schedules.GetByIdWithDoctorAsync(Id);
            if (schedule == null)
                return Result<DoctorScheduleResponse>.NotFound("No Schedules For This Id");

            schedule.IsActive = active;
            await _unitOfWork.SaveChangesAsync();

            var doctor = await _unitOfWork.Doctors.GetByIdWithUserAsync(schedule.DoctorId);
            if (doctor == null)
                return Result<DoctorScheduleResponse>.NotFound("Invalid DoctorId");
            var response = new DoctorScheduleResponse(
                    schedule.Id,
                    doctor.UserId,
                    $"{doctor.User.FirstName} {doctor.User.LastName}",
                    schedule.WeekDay,
                    schedule.StartTime,
                    schedule.EndTime,
                    schedule.SlotDurationMinutes,
                    schedule.IsActive
                );

            return Result<DoctorScheduleResponse>.Success(response, 201);

        }
        private static DoctorScheduleResponse MapSchedule(DoctorSchedule schedule)
        {
            return new DoctorScheduleResponse(
                schedule.Id,
                schedule.Doctor.UserId,
                $"{schedule.Doctor.User.FirstName} {schedule.Doctor.User.LastName}",
                schedule.WeekDay,
                schedule.StartTime,
                schedule.EndTime,
                schedule.SlotDurationMinutes,
                schedule.IsActive
                );
        }

    }
}
