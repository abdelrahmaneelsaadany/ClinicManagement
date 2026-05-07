using ClinicManagement.Api.Authorization;
using ClinicManagement.Application.DTO;
using ClinicManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorScheduleController : BaseController
    {
        private readonly IDoctorScheduleService _doctorSchedule;
        private readonly IAuthorizationService _authorizationService;
        public DoctorScheduleController(IDoctorScheduleService doctorSchedule, IAuthorizationService authorizationService)
        {
            _doctorSchedule = doctorSchedule;
            _authorizationService = authorizationService;
        }

        [Authorize(Roles = "Admin,Doctor")]
        [HttpGet("doctor")]
        public async Task<IActionResult> GetByDoctorId()
        {
            return ToResponse(await _doctorSchedule.GetScheulesByDoctorIdAsync(CurrentUserId));
        }
        [Authorize(Roles = "Patient,Admin")]
        [HttpGet("active")]
        public async Task<IActionResult> GetActive()
            => ToResponse(await _doctorSchedule.GetSchedulesByActiveAsync());

        [Authorize(Roles = "Patient,Admin")]
        [HttpGet("day")]
        public async Task<IActionResult> GetByDay([FromQuery] DayOfWeek dayOfWeek)
            => ToResponse(await _doctorSchedule.GetShedulesByDayOfweekAsync(dayOfWeek));

        [Authorize(Roles = "Admin,Doctor")]
        [HttpPost]
        public async Task<IActionResult> CreateSchedule([FromBody] DoctorScheduleReq req)
            => ToResponse(await _doctorSchedule.AddAsync(req));

        [Authorize(Roles = "Admin,Doctor")]
        [HttpPut("toggle-active/{Id}")]
        public async Task<IActionResult> ToggleActive(Guid Id, [FromQuery] bool active)
        {
            var schedule = await _doctorSchedule.GetByIdAsync(Id);
            if (!schedule.Succeeded)
                return ToResponse(schedule);
            var authResult = await _authorizationService.AuthorizeAsync(User, schedule.Data, new ScheduleOwnerRequirement());
            if (!authResult.Succeeded)
                return Forbid();
            return ToResponse(await _doctorSchedule.EditActiveSlotsAsync(Id, active));
        }
    }
}
