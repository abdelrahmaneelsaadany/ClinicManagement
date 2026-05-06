using ClinicManagement.Api.Authorization;
using ClinicManagement.Api.Middleware;
using ClinicManagement.Application.Interfaces;
using ClinicManagement.Application.Service;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using ClinicManagement.Infrastructure.Identity;
using ClinicManagement.Infrastructure.Repsitories;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
namespace ClinicManagement.Api
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            //── Repositories ──────────────────────────────────────────────────────────────────
            builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

            //── Service ──────────────────────────────────────────────────────────────────
            builder.Services.AddScoped<IAuthService, AuthService>();
            builder.Services.AddScoped<IPatientService, PatientService>();
            builder.Services.AddScoped<IDoctorService, DoctorService>();
            builder.Services.AddScoped<IAppointmentService, AppointmentService>();
            builder.Services.AddScoped<IPrescriptionService, PrescriptionService>();
            builder.Services.AddScoped<IDoctorScheduleService, DoctorScheduleService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IJwtService, JwtService>();
            builder.Services.AddScoped<IPasswordhasher, PasswordHasher>();
            // ── Database ──────────────────────────────────────────────────────────────────
            builder.Services.AddDbContext<ApplicationDBContext>(opt =>
                opt.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection"),
                    sql => sql.EnableRetryOnFailure(3)
                )
            );
            var key = builder.Configuration["Jwt:Secret"] ?? throw new Exception("JWT Secret missing");
            builder.Services
                .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey =
                            new SymmetricSecurityKey(
                                Encoding.UTF8.GetBytes(
                                    key))
                    };
                });
            //── Add Policy ──────────────────────────────────────────────────────────────────
            builder.Services.AddScoped<IAuthorizationHandler, AppointmentOwnerHandler>();
            builder.Services.AddScoped<IAuthorizationHandler, ScheduleOwnerRequirementHandler>();

            builder.Services.AddAuthorization();
            //── Fulent Vaidation Register ──────────────────────────────────────────────────────────────────
            var applicationAssembly = typeof(AppointmentService).Assembly;
            builder.Services.AddValidatorsFromAssembly(applicationAssembly);
            builder.Services.AddFluentValidationAutoValidation();
            //── Convert Fluent Valdiation Response  From Keystral ToResponse() ===> Format ──────────────────────────────────────────────────────────────────
            builder.Services.Configure<ApiBehaviorOptions>(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState
                        .Where(x => x.Value?.Errors.Count > 0)
                        .SelectMany(x => x.Value.Errors)
                        .Select(x => x.ErrorMessage)
                        .ToList();

                    var response = new
                    {
                        succeeded = false,
                        statusCode = 400,
                        error = "Validation Failed",
                        errors = errors
                    };

                    return new BadRequestObjectResult(response);
                };
            });
            //── Convert Enums To String in Api ──────────────────────────────────────────────────────────────────
            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });


            //── Allow Front-End ──────────────────────────────────────────────────────────────────
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Dev", policy =>
                {
                    policy.AllowAnyOrigin()
                          .AllowAnyHeader()
                           .AllowAnyMethod();
                });
            });

            var app = builder.Build();
            using (var scope = app.Services.CreateScope())
            {
                try
                {
                    var db = scope.ServiceProvider.GetRequiredService<ApplicationDBContext>();
                    db.Database.Migrate();
                }
                catch (Exception ex)
                {
                    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "Migration failed");

                }
            }
            app.UseCors("Dev");
            // ── Configure the HTTP request pipeline ──────────────────────────────────────────────────────────────────
            app.UseSwagger();
            app.UseSwaggerUI();
            //app.UseHttpsRedirection();

            app.UseMiddleware<ExceptionMiddleware>();
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.Run();
        }
    }
}
