using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Enums;
using TaskManagementTool.Models.Models;

namespace TaskManagementTool.DataAccess.Repositories.IRepositories;

public interface ITaskRepository
{
    Task AddAsync(TaskItem task, CancellationToken cancellationToken = default);

    Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TaskItem>> GetAssignedToUserAsync(
        string userId,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<TaskItem>> GetAllForExportAsync(
        string? assignedToUserIdFilter,
        CancellationToken cancellationToken = default);

    Task<(IReadOnlyList<TaskItem> Items, int TotalCount)> SearchAsync(
        string? userIdFilter,
        bool restrictToUser,
        TaskQueryParametersDto parameters,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default);

    Task<(int Pending, int InProgress, int Completed)> GetStatusCountsAsync(
        string? userIdFilter,
        bool restrictToUser,
        CancellationToken cancellationToken = default);

    Task ClearCategoryForTasksAsync(Guid categoryId, CancellationToken cancellationToken = default);
}
