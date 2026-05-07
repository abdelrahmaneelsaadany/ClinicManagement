using ClinicManagement.Api.Authorization;
using ClinicManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PrescriptionController : BaseController
    {
        private readonly IPrescriptionService _prescriptionService;
        private readonly IAuthorizationService _authorizationService;

        public PrescriptionController(IPrescriptionService prescriptionService, IAuthorizationService authorizationService)
        {
            _prescriptionService = prescriptionService;
            _authorizationService = authorizationService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("{prescriptionId}")]
        public async Task<IActionResult> GetById(Guid prescriptionId)
            => ToResponse(await _prescriptionService.GetByIdAsync(prescriptionId));

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("doctor")]
        public async Task<IActionResult> GetByDoctorId()
            => ToResponse(await _prescriptionService.GetPrescriptionByDoctorIdAsync(CurrentUserId));

        [Authorize(Roles = "Admin,Patient")]
        [HttpGet("patient")]
        public async Task<IActionResult> GetByPatientId()
            => ToResponse(await _prescriptionService.GetPrescriptionByPatientIdAsync(CurrentUserId));

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("appointment/{appointmentId}")]
        public async Task<IActionResult> GetbyAppointmentId(Guid appointmentId)
        {
            var prescription = await _prescriptionService.GetPrescriptionByAppointmentIdAsync(appointmentId);

            var authResult = await _authorizationService.AuthorizeAsync(User, prescription.Data, new PrescriptionOwnerRequirement());
            if (!authResult.Succeeded)
                return Forbid();

            return ToResponse(prescription);

        }
    }
}
