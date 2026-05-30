using TaskManagementTool.Exceptions;
using TaskManagementTool.Models.Models;
using TaskManagementTool.Services;

namespace TaskManagementTool.Authorization;

public static class TaskAccess
{
    /// <summary>Admin sees all; employees see only tasks assigned to them.</summary>
    public static void EnsureCurrentUserCanAccess(TaskItem task, ICurrentUserService currentUser)
    {
        if (currentUser.IsAdmin)
            return;

        if (currentUser.UserId == task.AssignedToUserId)
            return;

        throw new ForbiddenAccessException();
    }

    public static void EnsureAdmin(ICurrentUserService currentUser)
    {
        if (!currentUser.IsAdmin)
            throw new ForbiddenAccessException("Administrator access is required.");
    }

    /// <summary>Assignee may update status; admin may update status on any task.</summary>
    public static void EnsureCanUpdateStatus(TaskItem task, ICurrentUserService currentUser)
    {
        if (currentUser.IsAdmin)
            return;

        if (currentUser.UserId == task.AssignedToUserId)
            return;

        throw new ForbiddenAccessException("Only the assigned employee can update task status.");
    }
}
