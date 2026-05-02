using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class DoctorRepository : GenericRepository<Doctor>, IDoctorRepository
    {
        public DoctorRepository(ApplicationDBContext dbContext) : base(dbContext) { }

        public async Task<Doctor?> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .Include(u => u.User)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }
        public async Task<IEnumerable<Doctor>> GetBySpecializationAsync(Specialization specialization)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(d => d.User)
                .Where(d => d.Specialization == specialization)
                .ToListAsync();
        }
        public async Task<IEnumerable<Doctor>> GetAvailableDcotors()
        {
            return await _dbSet
                .AsNoTracking()
                .Include(d => d.User)
                .Where(d => d.IsAvailable)
                .ToListAsync();
        }
        public async Task<Doctor?> GetByIdWithUserAsync(Guid id)
        {
            return await _dbSet
                .Include(d => d.User)
                .FirstOrDefaultAsync(d => d.Id == id);
        }
    }
}
