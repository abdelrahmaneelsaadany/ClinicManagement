namespace ClinicManagement.Application.DTO
{
    public record CreateAppointmentReqDto(
                Guid PatientId,
                Guid DoctorId,
                DateTime AppointmentDt,
                string? Notes
        );


}
