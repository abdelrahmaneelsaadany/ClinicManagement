using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Domain.Entities
{
    public class Patient : BaseEntity
    {
        // Forign Keyyyyyyyyyyyyyy Not Primary Key Stupet
        public Guid UserId { get; set; }
        public Gender Gender { get; set; }
        public string PhoneNumber { get; set; } = null!;
        public DateTime DateOfBirth { get; set; }
        public string MedicalHistory { get; set; } = null!;

        // Naviagte 
        public User User { get; set; } = null!;
        public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    }
}
