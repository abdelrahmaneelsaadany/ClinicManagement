using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Domain.Common;

namespace ClinicManagement.Application.Interfaces
{
    public interface IUserService
    {
        Task<Result<UserResponseDto>> GetByEmailAsync(string email);
        Task<Result<UserResponseDto>> GetByUserId(Guid userId);
        Task<Result<PagedResult<UserResponseDto>>> GetAllUsersAsync(int page, int pageSize);
    }
}
