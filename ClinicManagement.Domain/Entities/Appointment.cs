using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Domain.Entities
{
    public class Appointment : BaseEntity
    {
        public Guid PatientId { get; set; }
        public Guid DoctorId { get; set; }
        public Status Status { get; set; } = Status.Scheduled;
        public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;
        public DateTime AppointmentDt { get; set; }
        public string? Notes { get; set; }


        public Patient Patinet { get; set; } = null!;
        public Doctor Doctor { get; set; } = null!;
        public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();

    }
}
