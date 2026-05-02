namespace ClinicManagement.Domain.Entities
{
    public class Prescription : BaseEntity
    {
        public Guid AppointmentId { get; set; }
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public string MedicationName { get; set; } = string.Empty;
        public string? Frequency { get; set; }
        public int? DurationDays { get; set; }
        public string? Notes { get; set; }
        public DateTime DatePrescribed { get; set; } = DateTime.UtcNow;

        // Navigation
        public Appointment Appointment { get; set; } = null!;
        public Patient Patient { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
    }
}
