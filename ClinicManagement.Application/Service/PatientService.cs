using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Interfaces;

namespace ClinicManagement.Application.Service
{
    public class PatientService : IPatientService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PatientService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<Result<PatientDto>> GetPateintByUserIdAsync(Guid userId)
        {
            var patient = await _unitOfWork.Patients.GetByUserIdAsync(userId);
            if (patient is null)
                return Result<PatientDto>.NotFound();

            return Result<PatientDto>.Success(MapPatient(patient));
        }



        private static PatientDto MapPatient(Patient patient)
        {
            return new PatientDto
            {
                UserId = patient.UserId,
                Email = patient.User.Email,
                FirstName = patient.User.FirstName,
                LastName = patient.User.LastName,
                Address = patient.User.Address,
                Gender = patient.Gender,
                Country = patient.User.Country,
                Role = patient.User.Role,
                PhoneNumber = patient.PhoneNumber,
                DateOfbirth = patient.DateOfBirth,
                MedicalHistory = patient.MedicalHistory,
            };
        }
    }
}
