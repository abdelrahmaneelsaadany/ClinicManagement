using ClinicManagement.Application.Common;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ClinicManagement.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public abstract class BaseController : ControllerBase
    {

        protected Guid CurrentUserId { get => GetCurrentUserId(); }
        protected string CurrentUserRole => User.FindFirst(ClaimTypes.Role)!.Value;

        protected bool IsAdmin => CurrentUserRole == "Admin";
        protected IActionResult ToResponse<T>(Result<T> result)
        {
            if (result.Succeeded)
                return result.StatusCode == 201 ? StatusCode(201, result) : Ok(result);

            return result.StatusCode switch
            {
                400 => BadRequest(new { error = result }),
                401 => Unauthorized(new { result }),
                403 => StatusCode(403, new { result }),
                404 => NotFound(new { result }),
                _ => StatusCode(500, new { error = result })  //  Any Exeption UnHandled 
            };
        }

        protected Guid GetCurrentUserId()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
                throw new UnauthorizedAccessException("NotAllowed");
            return Guid.Parse(userId);
        }
    }
}
