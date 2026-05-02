using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;

namespace ClinicManagement.Application.Interfaces
{
    public interface IAppointmentService
    {
        Task<Result<AppointmentDto>> GetAppointmentByIdAsync(Guid id);
        Task<Result<IEnumerable<AppointmentDto>>> GetAppointmentByPateintIdAsync(Guid pateintId);
        Task<Result<IEnumerable<AppointmentDto>>> GetAppointmentByDoctorIdAsync(Guid doctorId);
        Task<Result<AppointmentDto>> BookAsync(CreateAppointmentReqDto req);
        Task<Result<AppointmentDto>> RescheduleAppointmentAysnc(Guid Id, RescheduleAppointmentRequest req);
        Task<Result<bool>> CancelAppointmentAsync(Guid Id);
        Task<Result<AppointmentDto>> CompleteAppointmentAsync(Guid Id, CompleteAppointmentStatus status);
        Task<Result<bool>> DeleteAppointmentAsync(Guid Id);
    }
}
