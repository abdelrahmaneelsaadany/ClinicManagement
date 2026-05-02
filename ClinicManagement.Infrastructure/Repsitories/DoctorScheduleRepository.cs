using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class DoctorScheduleRepository : GenericRepository<DoctorSchedule>, IDoctorScheduleRepository
    {
        public DoctorScheduleRepository(ApplicationDBContext dBContext) : base(dBContext) { } // For Generic Repo  عشان تكتسب نفس الفانكشنز يعني 

        public async Task<IEnumerable<DoctorSchedule?>> GetActiveSlots()
            => await _dbSet
            .Where(x => x.IsActive == true)
            .Include(x => x.Doctor)
            .ThenInclude(x => x.User)
            .ToListAsync();

        public async Task<IEnumerable<DoctorSchedule?>> GetByDayOfWeek(DayOfWeek day)
            => await _dbSet
            .Where(x => x.WeekDay == day)
            .Include(x => x.Doctor)
            .ThenInclude(x => x.User)
            .ToListAsync();

        public async Task<IEnumerable<DoctorSchedule?>> GetBydoctorId(Guid doctorId)
           => await _dbSet
            .Where(x => x.Doctor.UserId == doctorId)
            .Include(x => x.Doctor)
            .ThenInclude(x => x.User)
            .ToListAsync();
        public async Task<DoctorSchedule?> GetByIdWithDoctorAsync(Guid id)
        {
            return await _dbSet
                .Include(s => s.Doctor)
                .ThenInclude(d => d.User)
                .FirstOrDefaultAsync(s => s.Id == id);
        }


    }
}
