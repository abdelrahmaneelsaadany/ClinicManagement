using ClinicManagement.Domain.Enums;

namespace ClinicManagement.Application.DTO
{
    public record PatientDto
    {
        public Guid UserId { get; set; }
        public Gender Gender { get; set; }
        public string Email { get; set; } = null!;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string Address { get; set; } = string.Empty;

    }
}
