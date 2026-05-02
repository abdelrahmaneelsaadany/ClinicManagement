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

        public PrescriptionController(IPrescriptionService prescriptionService)
        {
            _prescriptionService = prescriptionService;
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
            => ToResponse(await _prescriptionService.GetPrescriptionByAppointmentIdAsync(appointmentId));
    }
}
