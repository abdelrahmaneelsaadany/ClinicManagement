using System.Net;
using System.Text.Json;

namespace ClinicManagement.Api.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;

        public ExceptionMiddleware(RequestDelegate requestDelegate, ILogger<ExceptionMiddleware> logger)
        {
            _next = requestDelegate;
            _logger = logger;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next.Invoke(context);
            }
            catch (Exception ex)
            {
                _logger.LogError($"{ex}  UnHandled Exeption With Massege : {ex.Message}");
                await HandleExceptionAsync(context, ex);
            }
        }
        private static Task HandleExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = ex switch
            {
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                KeyNotFoundException => (int)HttpStatusCode.NotFound,
                ArgumentException => (int)HttpStatusCode.BadRequest,
                _ => (int)HttpStatusCode.InternalServerError,
            };

            var response = new
            {
                StatusCode = context.Response.StatusCode,
                Error = context.Response.StatusCode == 500 ? "An internal server error occurred"
                : ex.Message
            };

            return context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
