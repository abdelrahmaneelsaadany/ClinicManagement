using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class PatientRepository : GenericRepository<Patient>, IPatientRepository
    {
        public PatientRepository(ApplicationDBContext context) : base(context) { }

        public async Task<Patient?> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet
                .AsNoTracking()
                .Include(u => u.User)
                .FirstOrDefaultAsync(u => u.UserId == userId);
        }
    }
}
