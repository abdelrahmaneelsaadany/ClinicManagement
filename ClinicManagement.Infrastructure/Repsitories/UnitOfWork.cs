using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDBContext _context;
        public IUserRepository Users { get; }
        public IAppointmentRepository Appointments { get; } // زي اكنك بتحقن ال Service ب ال Reepository يعني هي هي بس مسمي مخلتف 

        public IPatientRepository Patients { get; }

        public IDoctorRepository Doctors { get; }

        public IDoctorScheduleRepository Schedules { get; }

        public IPrescriptionRepository Prescriptions { get; }

        public UnitOfWork(ApplicationDBContext context)
        {
            _context = context;
            Users = new UserRepository(_context); // عشان اقدر استفيد من ال Custom repo ال انا عاملو وكدا كدا هو عنده الفانكشنز بتاعة الجيناريك
            Patients = new PatientRepository(_context);
            Doctors = new DoctorRepository(_context);
            Schedules = new DoctorScheduleRepository(_context);
            Appointments = new AppointmentRepository(_context);
            Prescriptions = new PrescriptionRepository(_context);
        }
        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
