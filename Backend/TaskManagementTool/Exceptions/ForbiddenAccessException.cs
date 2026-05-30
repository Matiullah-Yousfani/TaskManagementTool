namespace TaskManagementTool.Exceptions;

public class ForbiddenAccessException : ApiException
{
    public ForbiddenAccessException(string message = "You do not have access to this resource.")
        : base(StatusCodes.Status403Forbidden, message)
    {
    }
}
