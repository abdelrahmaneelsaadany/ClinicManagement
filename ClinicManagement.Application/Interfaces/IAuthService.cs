using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;

namespace ClinicManagement.Application.Interfaces
{
    public interface IAuthService
    {
        Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto req);
        Task<Result<LoginResponseDto>> RegisterPatientAsync(RegisterPatinetDto patient);
        Task<Result<LoginResponseDto>> RegisterDoctorAsync(RegisterDoctorDto doctor);
        Task<Result<LoginResponseDto>> RefreshTokenAsync(RefreshToken refresh);
    }
}
