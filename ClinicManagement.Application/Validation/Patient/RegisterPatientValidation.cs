using ClinicManagement.Application.DTO;
using FluentValidation;

namespace ClinicManagement.Application.Validation.Patient
{
    public class RegisterPatientValidation : AbstractValidator<RegisterPatinetDto>
    {

        public RegisterPatientValidation()
        {
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required")
                .EmailAddress().WithMessage("Invalid Email Format")
                .MaximumLength(255);

            RuleFor(x => x.FirstName)
                .NotEmpty()
                .WithMessage("First Name is required")
                .MaximumLength(255);

            RuleFor(x => x.LastName)
                .NotEmpty()
                .WithMessage("Last Name is required")
                .MaximumLength(255);

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required")
                .MinimumLength(8).WithMessage("Password must be at least 8 chars")
                .Matches("[A-Z]").WithMessage("Must contain uppercase")
                .Matches("[a-z]").WithMessage("Must contain lowercase")
                .Matches("[0-9]").WithMessage("Must contain number");


        }
    }
}
