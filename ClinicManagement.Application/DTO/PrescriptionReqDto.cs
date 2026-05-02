namespace ClinicManagement.Application.DTO
{
    public record PrescriptionReqDto(
        string MedicationName,
        string? Dosage,
        string? Frequency,
        int? DurationDays,
        string? Notes
    );


}
