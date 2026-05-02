using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record LoginResponseDto(
         string? AccessToken,
         string? RefreshToken,
         Guid UserId,
         string FullName,
         UserRole Role
        );



}
