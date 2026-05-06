using ClinicManagement.Application.DTO;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ClinicManagement.Api.Authorization
{
    public class AppointmentOwnerHandler : AuthorizationHandler<AppointmentOwnerRequirement, AppointmentDto>
    {
        protected override Task HandleRequirementAsync(
            AuthorizationHandlerContext context,
            AppointmentOwnerRequirement requirement, // ده ال المفروض يتحقق 
            AppointmentDto resource // ده ال بيتبعت من الكنترولر 
            )
        {
            var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (resource.PatientId.ToString() == userId || resource.DoctorId.ToString() == userId
                || context.User.IsInRole("Admin"))
            {
                context.Succeed(requirement);
            }

            return Task.CompletedTask;
        }
    }
}
