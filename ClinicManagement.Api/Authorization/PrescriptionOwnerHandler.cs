using ClinicManagement.Application.DTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ClinicManagement.Api.Authorization
{
    public class PrescriptionOwnerHandler : AuthorizationHandler<PrescriptionOwnerRequirement, PrescriptionDto>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            PrescriptionOwnerRequirement requirement,
            PrescriptionDto resource)
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == resource.DoctorId.ToString() || context.User.IsInRole("Admin"))
                context.Succeed(requirement);

            return Task.CompletedTask;
        }
    }
}
