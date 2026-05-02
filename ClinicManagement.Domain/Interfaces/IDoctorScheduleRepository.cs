using ClinicManagement.Domain.Entities;

namespace ClinicManagement.Domain.Interfaces
{
    public interface IDoctorScheduleRepository : IGenericRepository<DoctorSchedule>
    {
        Task<IEnumerable<DoctorSchedule?>> GetByDayOfWeek(DayOfWeek day);
        Task<IEnumerable<DoctorSchedule?>> GetBydoctorId(Guid doctorId);
        Task<IEnumerable<DoctorSchedule?>> GetActiveSlots();
        Task<DoctorSchedule?> GetByIdWithDoctorAsync(Guid id);
    }
}
