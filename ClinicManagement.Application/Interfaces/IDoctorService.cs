using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.Interfaces
{
    public interface IDoctorService
    {
        Task<Result<DoctorDto>> GetDoctorByUserIdAsync(Guid userId);
        Task<Result<IEnumerable<DoctorSummaryDto>>> GetBySpecializationAsync(Specialization specialization); // Summry For Smplicity 
        Task<Result<IEnumerable<DoctorSummaryDto>>> GetAvailableDcotorsAsync(); // Summry For Smplicity 
        Task<Result<bool>> SetAvailabilityAsync(Guid doctorId, bool available);
    }
}
