using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;
using ClinicManagement.Domain.Interfaces;

namespace ClinicManagement.Application.Service
{
    public class DoctorService : IDoctorService
    {
        private readonly IUnitOfWork _unitOfWork;
        public DoctorService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<DoctorDto>> GetDoctorByUserIdAsync(Guid userId)
        {
            var doctor = await _unitOfWork.Doctors.GetByUserIdAsync(userId);
            return doctor == null ? Result<DoctorDto>.NotFound() : Result<DoctorDto>.Success(MapDoctor(doctor));
        }

        public async Task<Result<IEnumerable<DoctorSummaryDto>>> GetBySpecializationAsync(Specialization specialization)
        {
            var doctors = await _unitOfWork.Doctors.GetBySpecializationAsync(specialization);
            if (!doctors.Any())
                return Result<IEnumerable<DoctorSummaryDto>>.NotFound();

            return Result<IEnumerable<DoctorSummaryDto>>.Success(doctors.Select(MapSummary));

        }

        public async Task<Result<IEnumerable<DoctorSummaryDto>>> GetAvailableDcotorsAsync()
        {
            var availables = await _unitOfWork.Doctors.GetAvailableDcotors();
            if (!availables.Any())
                return Result<IEnumerable<DoctorSummaryDto>>.NotFound();

            return Result<IEnumerable<DoctorSummaryDto>>.Success(availables.Select(MapSummary));
        }

        public async Task<Result<bool>> SetAvailabilityAsync(Guid doctorId, bool available)
        {
            var doctor = await _unitOfWork.Doctors.GetByUserIdAsync(doctorId);
            if (doctor == null)
            {
                return Result<bool>.NotFound();
            }
            doctor.IsAvailable = available;
            await _unitOfWork.SaveChangesAsync();
            return Result<bool>.Success(available);
        }



        private static DoctorDto MapDoctor(Doctor doctor) =>
            new DoctorDto(
                doctor.UserId,
                doctor.Specialization,
                doctor.YearsExperience,
                doctor.IsAvailable,
                doctor.User.Email,
                doctor.User.FirstName,
                doctor.User.LastName,
                doctor.User.Address,
                doctor.User.Country,
                doctor.User.Role,
                doctor.PhoneNumber,
                doctor.ClinicAddress,
                doctor.ConsultationFee
                );
        private static DoctorSummaryDto MapSummary(Doctor d)
        {
            return new DoctorSummaryDto(
                d.UserId,
                d.User.FirstName,
                d.User.LastName,
                d.Specialization,
                d.YearsExperience,
                d.IsAvailable,
                d.PhoneNumber,
                d.ClinicAddress,
                d.ConsultationFee
            );
        }

    }
}
