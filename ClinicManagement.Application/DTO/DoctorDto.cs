using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record DoctorDto(
        Guid UserId,
        Specialization Specialization,
        int? YearsExperience,
        bool IsAvailable,
        string Email,
        string FirstName,
        string LastName,
        string Country,
        string Address,
        UserRole Role,
        string PhoneNumber,
        string ClinicAddress,
        decimal ConsultationFee
        );
}
