using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : BaseController
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }


        [HttpPost("auth/register/patient")]
        public async Task<IActionResult> RegisterPatient([FromBody] RegisterPatinetDto req)
            => ToResponse(await _authService.RegisterPatientAsync(req));

        [Authorize(Roles = "Admin")]
        [HttpPost("auth/register/doctor")]
        public async Task<IActionResult> RegisterDoctor([FromBody] RegisterDoctorDto req)
            => ToResponse(await _authService.RegisterDoctorAsync(req));

        [HttpPost("auth/login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto req)
            => ToResponse(await _authService.LoginAsync(req));

        [HttpPost("auth/refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshToken req)
            => ToResponse(await _authService.RefreshTokenAsync(req));
    }
}
