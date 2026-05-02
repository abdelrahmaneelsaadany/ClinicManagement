namespace ClinicManagement.Domain.Entities
{
    public class Admin : BaseEntity
    {
        // Forign Keyyyyyyyyyyyyyy Not Primary Key Stupet
        public Guid UserId { get; set; }

        // Naviagte 
        public User User { get; set; } = null!;

    }
}
