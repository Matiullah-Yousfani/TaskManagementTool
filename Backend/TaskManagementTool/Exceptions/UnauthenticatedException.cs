namespace TaskManagementTool.Exceptions;

public class UnauthenticatedException : ApiException
{
    public UnauthenticatedException(string message = "Authentication is required.")
        : base(StatusCodes.Status401Unauthorized, message)
    {
    }
}
