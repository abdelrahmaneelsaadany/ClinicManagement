using ClinicManagement.Api.Controllers;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class DoctorController : BaseController
{
    private readonly IDoctorService _doctorService;

    public DoctorController(IDoctorService doctorService)
    {
        _doctorService = doctorService;
    }

    [Authorize(Roles = "Admin,Doctor")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        if (!IsAdmin && id != CurrentUserId)
            return Forbid();
        return ToResponse(await _doctorService.GetDoctorByUserIdAsync(id));
    }

    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("specialization")]
    public async Task<IActionResult> GetBySpecialization([FromQuery] Specialization specialization)
        => ToResponse(await _doctorService.GetBySpecializationAsync(specialization));

    [Authorize(Roles = "Admin,Patient")]
    [HttpGet("available")] // api/doctor/available/
    public async Task<IActionResult> GetAvailable()
        => ToResponse(await _doctorService.GetAvailableDcotorsAsync());

    [Authorize(Roles = "Admin,Doctor")]
    [HttpPut("availability")]
    public async Task<IActionResult> SetAvailability([FromQuery] bool available)
    {
        return ToResponse(await _doctorService.SetAvailabilityAsync(CurrentUserId, available));
    }
}