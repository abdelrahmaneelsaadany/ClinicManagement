namespace ClinicManagement.Application.Common
{
    public class Result<T>
    {
        public bool Succeeded { get; private set; }
        public T? Data { get; private set; }
        public string? Error { get; private set; }
        public int StatusCode { get; private set; }


        // لما ترجع اوبجيكت منها هينادي ع ال كونستراكتور الفاضيييي "new()"
        public static Result<T> Success(T data, int StatusCode = 200)
            => new() { Succeeded = true, Data = data, StatusCode = StatusCode };
        public static Result<T> Failure(string error, int statusCode = 400)
             => new() { Succeeded = false, Error = error, StatusCode = statusCode };

        public static Result<T> NotFound(string message = "Resource not found")
            => new() { Succeeded = false, Error = message, StatusCode = 404 };

        public static Result<T> Unauthorized(string message = "Unauthorized")
            => new() { Succeeded = false, Error = message, StatusCode = 401 };

        public static Result<T> Forbidden(string message = "Forbidden")
            => new() { Succeeded = false, Error = message, StatusCode = 403 };
    }
}
