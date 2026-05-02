using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record CompleteAppointmentStatus(
           List<PrescriptionReqDto> Prescriptions,
           Status Status = Status.Completed
        );


}
