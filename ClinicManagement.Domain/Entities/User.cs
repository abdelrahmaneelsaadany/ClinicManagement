using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Domain.Entities
{
    public class User : BaseEntity
    {
        public string PasswordHash { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string Address { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        // Navigate : 

        public Patient? Patient { get; set; }
        public Doctor? Doctor { get; set; }
        public Admin? Admin { get; set; }

    }

}
