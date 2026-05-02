using ClinicManagement.Application.DTO;
using FluentValidation;

namespace ClinicManagement.Application.Validation.Appointment
{
    public class AppointmentRequestValidator : AbstractValidator<CreateAppointmentReqDto>
    {
        public AppointmentRequestValidator()
        {
            RuleFor(x => x.PatientId).
                NotEmpty().WithMessage("Patient Id Is Required");

            RuleFor(x => x.DoctorId)
                .NotEmpty().WithMessage("Doctor Id Is Required");

            RuleFor(x => x.Notes)
                .MaximumLength(255);
            When(x => !string.IsNullOrWhiteSpace(x.Notes), () =>
            {
                RuleFor(x => x.Notes)
                    .MinimumLength(8);
            });

            RuleFor(x => x.AppointmentDt)
                .NotEmpty().WithMessage("Appointment Date Is Required");


        }
    }
}
