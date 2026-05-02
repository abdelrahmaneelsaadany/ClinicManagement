using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Data
{
    public static class DbSeeder
    {
        public static async Task SeedAdminAsync(ApplicationDBContext context)
        {
            if (await context.Users.AnyAsync(x => x.Role == UserRole.Admin))
                return;

            var passwordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123");

            var user = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "System",
                LastName = "Admin",
                Email = "admin@clinic.com",
                PasswordHash = passwordHash,
                Role = UserRole.Admin,
                Country = "Egypt",
                Address = "Cairo"
            };

            var admin = new Admin
            {
                Id = Guid.NewGuid(),
                UserId = user.Id
            };

            await context.Users.AddAsync(user);
            await context.Admins.AddAsync(admin);

            await context.SaveChangesAsync();
        }
    }
}