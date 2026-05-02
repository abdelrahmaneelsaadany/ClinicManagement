namespace ClinicManagement.Application.DTO
{
    public record PrescriptionDto(
        Guid AppointmentId,
        Guid PatientId,
        Guid DoctorId,
        string PatientName,
        string DoctorName,
        string MedicationName,
        string? Frequency,
        int? DurationDays,
        string? Notes,
        DateTime DateDescriped
        );


}
