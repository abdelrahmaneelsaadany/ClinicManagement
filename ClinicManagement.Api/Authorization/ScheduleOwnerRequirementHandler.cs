using ClinicManagement.Application.DTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ClinicManagement.Api.Authorization
{
    public class ScheduleOwnerRequirementHandler : AuthorizationHandler<ScheduleOwnerRequirement, DoctorScheduleResponse>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            ScheduleOwnerRequirement requirement,
            DoctorScheduleResponse resource)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (resource.DoctorId.ToString() == userId || context.User.IsInRole("Admin"))
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
