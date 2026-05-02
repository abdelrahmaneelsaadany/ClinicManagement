using ClinicManagement.Domain.Entities;

namespace ClinicManagement.Domain.Interfaces
{
    public interface IPrescriptionRepository : IGenericRepository<Prescription>
    {
        Task<Prescription?> GetByIdWithUserDeatils(Guid Id);
        public Task<IEnumerable<Prescription>> GetPrescriptionByDoctorIdAsync(Guid doctorId);
        public Task<IEnumerable<Prescription>> GetPrescriptionByAppointmentIdAsync(Guid appointmentId);
        public Task<IEnumerable<Prescription>> GetPrescriptionByPatientIdAsync(Guid patientId);

    }
}
