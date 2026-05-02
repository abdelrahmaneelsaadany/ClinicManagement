using ClinicManagement.Domain.Entities;

namespace ClinicManagement.Domain.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByUserIdAsync(Guid userId);
        Task<User?> GetUserByEmailAsync(string email);
        Task<User?> GetByRefreshTokenAsync(string token);
        Task<bool> EmailExist(string email);

    }
}
