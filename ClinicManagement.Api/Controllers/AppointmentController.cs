using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : BaseController
    {
        private readonly IAppointmentService _appointmentService;

        public AppointmentController(IAppointmentService appointmentService)
        {
            _appointmentService = appointmentService;
        }

        [Authorize(Roles = "Admin")]

        [HttpGet("{Id}")]
        public async Task<IActionResult> GetById(Guid Id)
        {
            return ToResponse(await _appointmentService.GetAppointmentByIdAsync(Id));
        }

        [Authorize(Roles = "Patient,Admin")]
        [HttpGet("patientId")]
        public async Task<IActionResult> GetByPatientId()
        {
            return ToResponse(await _appointmentService.GetAppointmentByPateintIdAsync(CurrentUserId));
        }

        [Authorize(Roles = "Doctor,Admin")]
        [HttpGet("doctorId")]
        public async Task<IActionResult> GetByDoctorId()
        {
            return ToResponse(await _appointmentService.GetAppointmentByDoctorIdAsync(CurrentUserId));
        }


        [Authorize(Roles = "Patient")]
        [HttpPost]
        public async Task<IActionResult> Book([FromBody] CreateAppointmentReqDto dto)
        {
            if (dto.PatientId != CurrentUserId && !IsAdmin)
                return Forbid();

            return ToResponse(await _appointmentService.BookAsync(dto));
        }


        [Authorize(Roles = "Patient")]
        [HttpPut("reschedule/{Id}")]
        public async Task<IActionResult> RescheduleAppointment(Guid Id, [FromBody] RescheduleAppointmentRequest request)
        {
            var PatientAppointment = await _appointmentService.GetAppointmentByIdAsync(Id);
            if (PatientAppointment?.Data?.PatientId != CurrentUserId)
                return Forbid();
            return ToResponse(await _appointmentService.RescheduleAppointmentAysnc(Id, request));
        }
        [Authorize(Roles = "Patient,Doctor")]
        [HttpPut("cancel/{Id}")]
        public async Task<IActionResult> CancelAppointment(Guid Id)
        {
            var PatientAppointment = await _appointmentService.GetAppointmentByIdAsync(Id);

            if (PatientAppointment?.Data?.PatientId != CurrentUserId)
                return Forbid();

            return ToResponse(await _appointmentService.CancelAppointmentAsync(Id));
        }

        [Authorize(Roles = "Doctor,Admin")]
        [HttpPut("complete/{Id}")]
        public async Task<IActionResult> CompleteAppointment(Guid Id, [FromBody] CompleteAppointmentStatus status)
        {
            var appointment = await _appointmentService.GetAppointmentByIdAsync(Id);

            if (!appointment.Succeeded)
                return ToResponse(appointment);

            if (!IsAdmin && appointment?.Data?.DoctorId != CurrentUserId)
                return Forbid();

            return ToResponse(await _appointmentService.CompleteAppointmentAsync(Id, status));
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{Id}")]
        public async Task<IActionResult> DeleteAppointment(Guid Id)
        {
            return ToResponse(await _appointmentService.DeleteAppointmentAsync(Id));
        }
    }
}
