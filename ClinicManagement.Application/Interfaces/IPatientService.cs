using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;

namespace ClinicManagement.Application.Interfaces
{
    public interface IPatientService
    {
        Task<Result<PatientDto>> GetPateintByUserIdAsync(Guid userId);
    }
}
