using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDBContext dBContext) : base(dBContext) { } // عشان اعرف استفيد من الفانكشنز ال ف الجيناريك 
        public async Task<User?> GetUserByEmailAsync(string email) => await _dbSet.FirstOrDefaultAsync(x => x.Email == email);
        public async Task<User?> GetByRefreshTokenAsync(string token) => await _dbSet.FirstOrDefaultAsync(x => x.RefreshToken == token);
        public async Task<bool> EmailExist(string email) => await _dbSet.AnyAsync(x => x.Email == email);
        public async Task<User?> GetByUserIdAsync(Guid userId) => await _dbSet.FirstOrDefaultAsync(x => x.Id == userId);

    }
}
