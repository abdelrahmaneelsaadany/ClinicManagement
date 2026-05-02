using ClinicManagement.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Data
{
    public class ApplicationDBContext : DbContext
    {

        public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Doctor> Doctors => Set<Doctor>();
        public DbSet<Patient> Patients => Set<Patient>();
        public DbSet<Appointment> Appointments => Set<Appointment>();
        public DbSet<Admin> Admins => Set<Admin>();
        public DbSet<DoctorSchedule> Schedules => Set<DoctorSchedule>();

        public DbSet<Prescription> Prescriptions => Set<Prescription>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(e =>
                {
                    e.Property(u => u.Email).HasMaxLength(120).IsRequired();
                    e.HasIndex(u => u.Email).IsUnique();
                    e.Property(p => p.PasswordHash).HasMaxLength(255).IsRequired();
                    e.Property(r => r.Role).HasConversion<string>();
                });
            modelBuilder.Entity<Doctor>(doctor =>
                {
                    doctor.HasOne(d => d.User)
                    .WithOne(a => a.Doctor)
                    .HasForeignKey<Doctor>(u => u.UserId)
                    .OnDelete(DeleteBehavior.Cascade);
                    doctor.Property(sp => sp.Specialization).HasConversion<string>();
                });

            modelBuilder.Entity<Patient>(pateint =>
            {
                pateint.HasOne(d => d.User)
                .WithOne(p => p.Patient)
                .HasForeignKey<Patient>(u => u.UserId)
                .OnDelete(DeleteBehavior.Cascade);
                pateint.Property(g => g.Gender).HasConversion<string>();
            });

            modelBuilder.Entity<Admin>(admin =>
            admin.HasOne(d => d.User)
            .WithOne(a => a.Admin)
            .HasForeignKey<Admin>(u => u.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            );

            modelBuilder.Entity<Appointment>(at =>
            {
                at.HasOne(p => p.Patinet)
                .WithMany(a => a.Appointments)
                .HasForeignKey(u => u.PatientId)
                .OnDelete(DeleteBehavior.NoAction);
                at.HasOne(a => a.Doctor)
                .WithMany(e => e.Appointments)
                .HasForeignKey(u => u.DoctorId)
                .OnDelete(DeleteBehavior.NoAction);
                at.Property(s => s.Status).HasConversion<string>();
                at.HasIndex(at => at.PatientId);
                at.HasIndex(at => at.DoctorId);
            });

            modelBuilder.Entity<Prescription>(p =>
            {
                p.HasOne(x => x.Patient)
                 .WithMany()
                 .HasForeignKey(x => x.PatientId)
                 .OnDelete(DeleteBehavior.NoAction);

                p.HasOne(x => x.Doctor)
                 .WithMany()
                 .HasForeignKey(x => x.DoctorId)
                 .OnDelete(DeleteBehavior.NoAction);

                p.HasOne(x => x.Appointment)
                 .WithMany(a => a.Prescriptions)
                 .HasForeignKey(x => x.AppointmentId)
                 .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<DoctorSchedule>(ds =>
            {
                ds.HasOne(d => d.Doctor)
                  .WithMany(d => d.Schedules)
                  .HasForeignKey(d => d.DoctorId)
                  .OnDelete(DeleteBehavior.Cascade);

                ds.Property(ds => ds.WeekDay).HasConversion<string>();
            });
        }
    }
}
