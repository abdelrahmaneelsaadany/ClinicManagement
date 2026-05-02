using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class AppointmentRepository : GenericRepository<Appointment>, IAppointmentRepository
    {
        public AppointmentRepository(ApplicationDBContext dBContext) : base(dBContext) { }

        public async Task<Appointment?> GetByIdWithUserDetails(Guid Id)
        {
            return await _dbSet
               .Include(x => x.Patinet)
               .ThenInclude(x => x.User)
               .Include(x => x.Doctor)
               .ThenInclude(x => x.User)
               .FirstOrDefaultAsync(x => x.Id == Id);

        }
        public async Task<IEnumerable<Appointment>> GetAppointmentByDoctorId(Guid doctorId)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(x => x.Doctor.UserId == doctorId)
                .Include(x => x.Doctor)
                .ThenInclude(x => x.User)
                .Include(x => x.Patinet)
                .ThenInclude(x => x.User)
                .Include(x => x.Prescriptions)
                .ToListAsync();
        }

        public async Task<IEnumerable<Appointment>> GetAppointmentByPateintId(Guid pateintId)
        {
            return await _dbSet
                .AsNoTracking()
                .Where(x => x.Patinet.UserId == pateintId)
                .Include(x => x.Doctor)
                .ThenInclude(x => x.User)
                .Include(x => x.Patinet)
                .ThenInclude(x => x.User)
                .Include(x => x.Prescriptions)
                .ToListAsync();
        }
        public async Task<bool> HasConflictAsync(Guid doctorId, DateTime dt)
        {
            return await _dbSet
                .AnyAsync(
                a => a.Doctor.UserId == doctorId &&
                a.AppointmentDt == dt &&
                a.Status == Status.Scheduled);
        }

    }
}
