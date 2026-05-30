using TaskManagementTool.Exceptions;
using TaskManagementTool.Services;

namespace TaskManagementTool.Extensions;

public static class CurrentUserExtensions
{
    public static string RequireUserId(this ICurrentUserService currentUser)
    {
        return currentUser.UserId
            ?? throw new UnauthenticatedException();
    }
}
