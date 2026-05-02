namespace ClinicManagement.Domain.Interfaces
{
    public interface IUnitOfWork
    {
        IUserRepository Users { get; }
        IAppointmentRepository Appointments { get; }
        IPatientRepository Patients { get; }
        IDoctorRepository Doctors { get; }
        IDoctorScheduleRepository Schedules { get; }
        IPrescriptionRepository Prescriptions { get; }
        Task<int> SaveChangesAsync();

    }
}
