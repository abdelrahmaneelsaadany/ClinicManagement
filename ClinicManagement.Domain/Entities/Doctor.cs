using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Domain.Entities
{
    public class Doctor : BaseEntity
    {
        // Forign Keyyyyyyyyyyyyyy Not Primary Key Stupet
        public Guid UserId { get; set; }
        public Specialization Specialization { get; set; }
        public int? YearsExperience { get; set; }
        public bool IsAvailable { get; set; }

        // Navigate 
        public User User { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
        public ICollection<DoctorSchedule> Schedules { get; set; } = new List<DoctorSchedule>();
    }
}
