using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using TaskManagementTool.Models.DTO_s;

namespace TaskManagementTool.Hubs;

[Authorize]
public class TaskHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!string.IsNullOrEmpty(userId))
            await Groups.AddToGroupAsync(Context.ConnectionId, UserGroup(userId));

        if (Context.User?.IsInRole("Admin") == true)
            await Groups.AddToGroupAsync(Context.ConnectionId, AdminGroup);

        await base.OnConnectedAsync();
    }

    public static string UserGroup(string userId) => $"user_{userId}";

    public const string AdminGroup = "admins";
}

public interface ITaskNotifier
{
    Task NotifyTaskCreatedAsync(TaskResponseDto task);

    Task NotifyTaskUpdatedAsync(TaskResponseDto task);

    Task NotifyTaskStatusChangedAsync(TaskResponseDto task);

    Task NotifyTaskDeletedAsync(Guid taskId, string assignedToUserId);
}

public sealed class TaskNotifier : ITaskNotifier
{
    private readonly IHubContext<TaskHub> _hub;

    public TaskNotifier(IHubContext<TaskHub> hub)
    {
        _hub = hub;
    }

    public async Task NotifyTaskCreatedAsync(TaskResponseDto task)
    {
        await _hub.Clients.Group(TaskHub.UserGroup(task.AssignedToUserId))
            .SendAsync("TaskCreated", task);
        await _hub.Clients.Group(TaskHub.AdminGroup).SendAsync("TaskCreated", task);
    }

    public async Task NotifyTaskUpdatedAsync(TaskResponseDto task)
    {
        await _hub.Clients.Group(TaskHub.UserGroup(task.AssignedToUserId))
            .SendAsync("TaskUpdated", task);
        await _hub.Clients.Group(TaskHub.AdminGroup).SendAsync("TaskUpdated", task);
    }

    public async Task NotifyTaskStatusChangedAsync(TaskResponseDto task)
    {
        await _hub.Clients.Group(TaskHub.UserGroup(task.AssignedToUserId))
            .SendAsync("TaskStatusChanged", task);
        await _hub.Clients.Group(TaskHub.AdminGroup).SendAsync("TaskStatusChanged", task);
    }

    public async Task NotifyTaskDeletedAsync(Guid taskId, string assignedToUserId)
    {
        await _hub.Clients.Group(TaskHub.UserGroup(assignedToUserId))
            .SendAsync("TaskDeleted", taskId);
        await _hub.Clients.Group(TaskHub.AdminGroup).SendAsync("TaskDeleted", taskId);
    }
}
