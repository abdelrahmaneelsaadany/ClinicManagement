using ClinicManagement.Application.Interfaces;

namespace ClinicManagement.Infrastructure.Identity
{
    public class PasswordHasher : IPasswordhasher
    {
        public string HashPassword(string password)
            => BCrypt.Net.BCrypt.HashPassword(password);

        public bool VerifyPassword(string password, string HashedPassword)
            => BCrypt.Net.BCrypt.Verify(password, HashedPassword);

    }
}
