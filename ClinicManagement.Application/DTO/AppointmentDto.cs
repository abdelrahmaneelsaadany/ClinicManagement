using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record AppointmentDto(
                Guid AppointmentId,
                Guid PatientId,
                string PatientName,
                Guid DoctorId,
                string DoctorName,
                Specialization DoctorSpecialization,
                DateTime AppointmentDt,
                Status Status,
                string? Notes,
                PaymentStatus PaymentStatus
        );



}
