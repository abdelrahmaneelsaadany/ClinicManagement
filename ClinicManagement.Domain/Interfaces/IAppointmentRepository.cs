using ClinicManagement.Domain.Entities;

namespace ClinicManagement.Domain.Interfaces
{
    public interface IAppointmentRepository : IGenericRepository<Appointment>
    {
        Task<Appointment?> GetByIdWithUserDetails(Guid Id);
        Task<IEnumerable<Appointment>> GetAppointmentByPateintId(Guid pateintId);
        Task<IEnumerable<Appointment>> GetAppointmentByDoctorId(Guid doctorId);
        Task<bool> HasConflictAsync(Guid doctorId, DateTime dt);

    }
}
