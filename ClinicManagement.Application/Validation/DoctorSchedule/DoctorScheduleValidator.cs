using ClinicManagement.Application.DTO;
using FluentValidation;

namespace ClinicManagement.Application.Validation.DoctorSchedule
{
    public class DoctorScheduleValidator : AbstractValidator<DoctorScheduleReq>
    {
        public DoctorScheduleValidator()
        {
            RuleFor(x => x.DoctorUserId).NotEmpty().WithMessage("DoctorID Is Required");
            RuleFor(x => x.StartTime).NotEmpty().WithMessage("Start Time is required");
            RuleFor(x => x.EndTime).NotEmpty().WithMessage("End Time is required");
            RuleFor(x => x.SlotDurationMinutes).NotEmpty().WithMessage("Slots Duration is required").InclusiveBetween(15, 60);
            RuleFor(x => x.EndTime).GreaterThan(x => x.StartTime).WithMessage("End Time Must be after Start Time");
        }
    }
}
