using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record RegisterDoctorDto(
         string Email,
         string FirstName,
         string Password,
         string LastName,
         string Country,
         UserRole Role,
         string Address,
         Specialization Specialization,
         int YearsExperience
        );


}
