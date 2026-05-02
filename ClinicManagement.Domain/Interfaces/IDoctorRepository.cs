using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Domain.Interfaces
{
    public interface IDoctorRepository : IGenericRepository<Doctor>
    {
        Task<Doctor?> GetByUserIdAsync(Guid userId);
        Task<IEnumerable<Doctor>> GetBySpecializationAsync(Specialization specialization);
        Task<IEnumerable<Doctor>> GetAvailableDcotors();
        Task<Doctor?> GetByIdWithUserAsync(Guid id);
    }
}
