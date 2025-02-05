using AutoCount.Authentication;

namespace AutoCountAPI.Services.Interface
{
    public interface ILoginService
    {
        UserSession AutoCountLogin();
    }
}
