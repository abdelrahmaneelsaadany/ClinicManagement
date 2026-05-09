using ClinicManagement.Application.Common;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Entities;
using ClinicManagement.Domain.Enums;
using ClinicManagement.Domain.Interfaces;
namespace ClinicManagement.Application.Service
{
    public class AuthService : IAuthService
    {
        private readonly IJwtService _jwtService;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPasswordhasher _passwordHasher;
        public AuthService(IJwtService jwtService, IUnitOfWork unitOfWork, IPasswordhasher passwordHasher)
        {
            _jwtService = jwtService;
            _unitOfWork = unitOfWork;
            _passwordHasher = passwordHasher;
        }

        public async Task<Result<LoginResponseDto>> LoginAsync(LoginRequestDto req)
        {
            var user = await _unitOfWork.Users.GetUserByEmailAsync(req.Email);
            if (user == null || !_passwordHasher.VerifyPassword(req.Password, user.PasswordHash))
                return Result<LoginResponseDto>.Unauthorized("Invalid email or password");

            var accessTokne = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var RefreshToken = _jwtService.RefreshToken();

            // Save In DB
            user.RefreshToken = RefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(1);

            await _unitOfWork.SaveChangesAsync(); // To Save Refresh Token 
            return Result<LoginResponseDto>.Success(BuildResponse(user, accessTokne, RefreshToken));

        }

        public async Task<Result<LoginResponseDto>> RegisterDoctorAsync(RegisterDoctorDto doctor)
        {
            if (await _unitOfWork.Users.EmailExist(doctor.Email))
                return Result<LoginResponseDto>.Failure("Email Is Already Exist");

            var user = new User
            {
                Email = doctor.Email,
                PasswordHash = _passwordHasher.HashPassword(doctor.Password),
                FirstName = doctor.FirstName,
                LastName = doctor.LastName,
                Address = doctor.Address,
                Role = UserRole.Doctor,
                Country = doctor.Country,
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.Doctors.AddAsync(new Doctor
            {
                UserId = user.Id,
                Specialization = doctor.Specialization,
                ConsultationFee = doctor.ConsultationFee,
                ClinicAddress = doctor.ClinicAddress,
                PhoneNumber = doctor.PhoneNumber,
                YearsExperience = doctor.YearsExperience,
                IsAvailable = true,
            });


            var accessTokne = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var RefreshToken = _jwtService.RefreshToken();

            // Save In DB
            user.RefreshToken = RefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(1);

            await _unitOfWork.SaveChangesAsync();
            return Result<LoginResponseDto>.Success(BuildResponse(user, accessTokne, RefreshToken), 201);
        }

        public async Task<Result<LoginResponseDto>> RegisterPatientAsync(RegisterPatinetDto patient)
        {
            if (await _unitOfWork.Users.EmailExist(patient.Email))
                return Result<LoginResponseDto>.Failure($"{patient.Email} was registered");
            var user = new User
            {
                Email = patient.Email,
                PasswordHash = _passwordHasher.HashPassword(patient.Password),
                FirstName = patient.FirstName,
                LastName = patient.LastName,
                Address = patient.Address,
                Country = patient.Country,
                Role = UserRole.Patient,
            };

            await _unitOfWork.Users.AddAsync(user);
            await _unitOfWork.Patients.AddAsync(new Patient
            {
                UserId = user.Id,
                Gender = patient.Gender,
                PhoneNumber = patient.PhoneNumber,
                DateOfBirth = patient.DateOfBirth,
                MedicalHistory = patient.MedicalHistory,
            });

            var accessTokne = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var RefreshToken = _jwtService.RefreshToken();

            // Save In DB
            user.RefreshToken = RefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(1);

            await _unitOfWork.SaveChangesAsync();
            return Result<LoginResponseDto>.Success(BuildResponse(user, accessTokne, RefreshToken), 201);
        }

        public async Task<Result<LoginResponseDto>> RefreshTokenAsync(RefreshToken refresh)
        {
            var user = await _unitOfWork.Users.GetByRefreshTokenAsync(refresh.token);
            if (user == null)
                return Result<LoginResponseDto>.Unauthorized("Invalid Refresh Token");
            if (user.RefreshTokenExpiry < DateTime.UtcNow)
                return Result<LoginResponseDto>.Failure("Expired Token");
            if (user.RefreshToken == null)
                return Result<LoginResponseDto>.Unauthorized("Invalid Refresh Token");

            // Rotate by new Access Token 
            var accessTokne = _jwtService.GenerateToken(user.Id, user.Email, user.Role.ToString());
            var refreshToken = _jwtService.RefreshToken();

            // Save In DB
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(1);

            await _unitOfWork.SaveChangesAsync();

            return Result<LoginResponseDto>.Success(BuildResponse(user, accessTokne, refreshToken), 201);
        }

        private LoginResponseDto BuildResponse(User user, string accessToken, string RefreshToken)
        {

            return new LoginResponseDto(
                accessToken,
                RefreshToken,
                user.Id,
                $"{user.FirstName} {user.LastName}",
                user.Role
                );
        }
    }
}
