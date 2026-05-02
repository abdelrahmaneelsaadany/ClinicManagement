using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;

namespace ClinicManagement.Application.Service
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UserService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<IEnumerable<UserResponseDto>>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            if (!users.Any())
                return Result<IEnumerable<UserResponseDto>>.NotFound("No Users Found");

            return Result<IEnumerable<UserResponseDto>>.Success(users.Select(MapUser));
        }

        public async Task<Result<UserResponseDto>> GetByEmailAsync(string email)
        {
            var user = await _unitOfWork.Users.GetUserByEmailAsync(email);
            if (user == null)
                return Result<UserResponseDto>.NotFound("There Is No User With This Email");

            return Result<UserResponseDto>.Success(MapUser(user));
        }

        public async Task<Result<UserResponseDto>> GetByUserId(Guid userId)
        {
            var user = await _unitOfWork.Users.GetByUserIdAsync(userId);
            if (user == null)
                return Result<UserResponseDto>.NotFound("There Is No User With This Id");

            return Result<UserResponseDto>.Success(MapUser(user));
        }


        private static UserResponseDto MapUser(User user)
        {
            return new UserResponseDto(
                user.Id,
                user.Email,
                user.FirstName,
                user.LastName,
                user.Country,
                user.Role,
                user.Address
                );
        }
    }
}
