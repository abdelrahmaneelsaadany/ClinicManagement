using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class PrescriptionRepository : GenericRepository<Prescription>, IPrescriptionRepository
    {
        public PrescriptionRepository(ApplicationDBContext dBContext) : base(dBContext) { }

        public async Task<IEnumerable<Prescription>> GetPrescriptionByAppointmentIdAsync(Guid appointmentId)
        {
            return await _dbSet
             .AsNoTracking()
             .Where(p => p.AppointmentId == appointmentId)
             .Include(x => x.Doctor)
             .ThenInclude(x => x.User)
             .Include(x => x.Patient)
             .ThenInclude(x => x.User)
             .Include(x => x.Appointment)
             .ToListAsync();
        }

        public async Task<IEnumerable<Prescription>> GetPrescriptionByDoctorIdAsync(Guid doctorId)
        {
            return await _dbSet
             .AsNoTracking()
             .Where(x => x.Doctor.UserId == doctorId)
             .Include(x => x.Doctor)
             .ThenInclude(x => x.User)
             .Include(x => x.Patient)
             .ThenInclude(x => x.User)
             .Include(x => x.Appointment)
             .ToListAsync();
        }

        public async Task<IEnumerable<Prescription>> GetPrescriptionByPatientIdAsync(Guid patientId)
        {
            return await _dbSet
             .AsNoTracking()
             .Where(x => x.Patient.UserId == patientId)
             .Include(x => x.Doctor)
             .ThenInclude(x => x.User)
             .Include(x => x.Patient)
             .ThenInclude(x => x.User)
             .Include(x => x.Appointment)
             .ToListAsync();
        }

        public async Task<Prescription?> GetByIdWithUserDeatils(Guid Id)
            => await _dbSet
                    .AsNoTracking()
                    .Include(x => x.Doctor)
                    .ThenInclude(x => x.User)
                    .Include(x => x.Patient)
                    .ThenInclude(x => x.User)
                    .FirstOrDefaultAsync(x => x.Id == Id);


    }
}
