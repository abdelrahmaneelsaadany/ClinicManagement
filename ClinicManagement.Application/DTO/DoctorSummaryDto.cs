using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record DoctorSummaryDto(
        Guid UserId,
        string FirstName,
        string LastName,
        Specialization Specialization,
        int? YearsExperience,
        bool IsAvailable
    );
}
