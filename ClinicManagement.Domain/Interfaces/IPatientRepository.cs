using ClinicManagement.Domain.Entities;

namespace ClinicManagement.Domain.Interfaces
{
    public interface IPatientRepository : IGenericRepository<Patient>
    {
        Task<Patient?> GetByUserIdAsync(Guid userId);
    }
}
