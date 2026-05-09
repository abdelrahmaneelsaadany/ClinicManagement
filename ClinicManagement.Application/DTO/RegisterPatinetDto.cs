using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record RegisterPatinetDto(
         string Email,
         string PhoneNumber,
         DateTime DateOfBirth,
         string MedicalHistory,
         string Password,
         string FirstName,
         string LastName,
         string Country,
         UserRole Role,
         string Address,
         Gender Gender
        );


}
