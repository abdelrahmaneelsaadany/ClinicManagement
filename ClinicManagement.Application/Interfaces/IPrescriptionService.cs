using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;

namespace ClinicManagement.Application.Interfaces
{
    public interface IPrescriptionService
    {
        Task<Result<PrescriptionDto>> GetByIdAsync(Guid prescriptionId);
        Task<Result<IEnumerable<PrescriptionDto>>> GetPrescriptionByDoctorIdAsync(Guid doctorId);
        Task<Result<IEnumerable<PrescriptionDto>>> GetPrescriptionByAppointmentIdAsync(Guid appointmentId);
        Task<Result<IEnumerable<PrescriptionDto>>> GetPrescriptionByPatientIdAsync(Guid patientId);
    }
}
