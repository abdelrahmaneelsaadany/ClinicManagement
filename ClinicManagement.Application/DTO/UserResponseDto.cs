using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record UserResponseDto(
             Guid UserId,
             string Email,
             string FirstName,
             string LastName,
             string Country,
             UserRole Role,
             string Address
        );


}
