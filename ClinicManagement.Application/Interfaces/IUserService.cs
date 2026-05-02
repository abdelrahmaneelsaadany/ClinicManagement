using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;

namespace ClinicManagement.Application.Interfaces
{
    public interface IUserService
    {
        Task<Result<UserResponseDto>> GetByEmailAsync(string email);
        Task<Result<UserResponseDto>> GetByUserId(Guid userId);
        Task<Result<IEnumerable<UserResponseDto>>> GetAllUsersAsync();
    }
}
