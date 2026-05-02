namespace ClinicManagement.Application.Interfaces
{

    public interface IPasswordhasher
    {
        string HashPassword(string password);
        bool VerifyPassword(string password, string HashedPassword);
    }
}


