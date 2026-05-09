using ClinicManagement.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ClinicManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : BaseController
    {
        private readonly IUserService _userService;
        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int Page, [FromQuery] int PageSize)
            => ToResponse(await _userService.GetAllUsersAsync(Page, PageSize));

        [Authorize(Roles = "Admin,Doctor,Patient")]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id) => ToResponse(await _userService.GetByUserId(id));
        [Authorize(Roles = "Admin")]
        [HttpGet("by-email")]
        public async Task<IActionResult> GetByEmail([FromQuery] string email) => ToResponse(await _userService.GetByEmailAsync(email));
    }
}
