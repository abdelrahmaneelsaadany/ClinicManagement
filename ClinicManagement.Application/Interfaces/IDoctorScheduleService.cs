using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;

namespace ClinicManagement.Application.Interfaces
{
    public interface IDoctorScheduleService
    {
        Task<Result<DoctorScheduleResponse>> AddAsync(DoctorScheduleReq req);
        Task<Result<IEnumerable<DoctorScheduleResponse>>> GetScheulesByDoctorIdAsync(Guid doctorId);
        Task<Result<IEnumerable<DoctorScheduleResponse>>> GetShedulesByDayOfweekAsync(DayOfWeek dayOfWeek);
        Task<Result<IEnumerable<DoctorScheduleResponse>>> GetSchedulesByActiveAsync();
        Task<Result<DoctorScheduleResponse>> EditActiveSlotsAsync(Guid Id, bool active);
    }
}
