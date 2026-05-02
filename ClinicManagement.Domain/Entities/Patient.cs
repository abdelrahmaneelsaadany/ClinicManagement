using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Domain.Entities
{
    public class Patient : BaseEntity
    {
        // Forign Keyyyyyyyyyyyyyy Not Primary Key Stupet
        public Guid UserId { get; set; }
        public Gender Gender { get; set; }

        // Naviagte 
        public User User { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
