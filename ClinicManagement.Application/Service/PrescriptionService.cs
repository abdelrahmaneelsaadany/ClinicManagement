using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;

namespace ClinicManagement.Application.Service
{
    public class PrescriptionService : IPrescriptionService
    {
        private readonly IUnitOfWork _unitOfWork;
        public PrescriptionService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PrescriptionDto>> GetByIdAsync(Guid prescriptionId)
        {
            var prescription = await _unitOfWork.Prescriptions.GetByIdWithUserDeatils(prescriptionId);

            if (prescription == null)
                return Result<PrescriptionDto>.NotFound("This PrescriptionId Not Found");
            return Result<PrescriptionDto>.Success(MapPrescription(prescription));
        }

        public async Task<Result<IEnumerable<PrescriptionDto>>> GetPrescriptionByAppointmentIdAsync(Guid appointmentId)
        {
            var prescriptions = await _unitOfWork.Prescriptions.GetPrescriptionByAppointmentIdAsync(appointmentId);
            if (!prescriptions.Any())
                return Result<IEnumerable<PrescriptionDto>>.NotFound("This appointment No Prescriptions For It");

            return Result<IEnumerable<PrescriptionDto>>.Success(prescriptions.Select(MapPrescription));
        }

        public async Task<Result<IEnumerable<PrescriptionDto>>> GetPrescriptionByDoctorIdAsync(Guid doctorId)
        {
            var prescriptions = await _unitOfWork.Prescriptions.GetPrescriptionByDoctorIdAsync(doctorId);
            if (!prescriptions.Any())
                return Result<IEnumerable<PrescriptionDto>>.NotFound("This Doctor No Prescriptions For him");

            return Result<IEnumerable<PrescriptionDto>>.Success(prescriptions.Select(MapPrescription));
        }

        public async Task<Result<IEnumerable<PrescriptionDto>>> GetPrescriptionByPatientIdAsync(Guid patientId)
        {
            var prescriptions = await _unitOfWork.Prescriptions.GetPrescriptionByPatientIdAsync(patientId);
            if (!prescriptions.Any())
                return Result<IEnumerable<PrescriptionDto>>.NotFound("This Patient No Prescriptions For him");

            return Result<IEnumerable<PrescriptionDto>>.Success(prescriptions.Select(MapPrescription));
        }



        private static PrescriptionDto MapPrescription(Prescription prescription)
        {
            return new PrescriptionDto(
                prescription.AppointmentId,
                prescription.PatientId,
                prescription.DoctorId,
                prescription.Patient.User.FirstName,
                prescription.Doctor.User.LastName,
                prescription.MedicationName,
                prescription.Frequency,
                prescription.DurationDays,
                prescription.Notes,
                prescription.DatePrescribed
                );
        }
    }
}
