using Microsoft.EntityFrameworkCore;
using TaskManagementTool.DataAccess.Repositories.IRepositories;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Enums;
using TaskManagementTool.Models.Models;

namespace TaskManagementTool.DataAccess.Repositories;

public class TaskRepository : ITaskRepository
{
    private readonly ApplicationDbContext _db;

    public TaskRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await _db.Tasks.AddAsync(task, cancellationToken);
    }

    public async Task<TaskItem?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _db.Tasks
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedToUser)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<TaskItem>> GetAssignedToUserAsync(
        string userId,
        CancellationToken cancellationToken = default)
    {
        return await _db.Tasks
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedToUser)
            .Where(t => t.AssignedToUserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TaskItem>> GetAllForExportAsync(
        string? assignedToUserIdFilter,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Tasks
            .Include(t => t.Category)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        if (!string.IsNullOrEmpty(assignedToUserIdFilter))
            query = query.Where(t => t.AssignedToUserId == assignedToUserIdFilter);

        return await query
            .OrderByDescending(t => t.Priority)
            .ThenByDescending(t => t.CreatedAt)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyList<TaskItem> Items, int TotalCount)> SearchAsync(
        string? userIdFilter,
        bool restrictToUser,
        TaskQueryParametersDto parameters,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Tasks
            .Include(t => t.Category)
            .Include(t => t.CreatedBy)
            .Include(t => t.AssignedToUser)
            .AsQueryable();

        if (restrictToUser && !string.IsNullOrEmpty(userIdFilter))
            query = query.Where(t => t.AssignedToUserId == userIdFilter);

        if (parameters.Status.HasValue)
            query = query.Where(t => t.Status == parameters.Status.Value);

        if (parameters.Priority.HasValue)
            query = query.Where(t => t.Priority == parameters.Priority.Value);

        if (parameters.CategoryId.HasValue)
            query = query.Where(t => t.CategoryId == parameters.CategoryId.Value);

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var term = parameters.Search.Trim();
            query = query.Where(t => t.Title.Contains(term));
        }

        var total = await query.CountAsync(cancellationToken);

        var page = parameters.Page < 1 ? 1 : parameters.Page;
        var items = await query
            .OrderByDescending(t => t.Priority)
            .ThenByDescending(t => t.CreatedAt)
            .Skip((page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        task.IsDeleted = true;
        task.DeletedAt = DateTime.UtcNow;
        return Task.CompletedTask;
    }

    public async Task<(int Pending, int InProgress, int Completed)> GetStatusCountsAsync(
        string? userIdFilter,
        bool restrictToUser,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Tasks.AsQueryable();
        if (restrictToUser && !string.IsNullOrEmpty(userIdFilter))
            query = query.Where(t => t.AssignedToUserId == userIdFilter);

        var pending = await query.CountAsync(t => t.Status == TaskItemStatus.Pending, cancellationToken);
        var inProgress = await query.CountAsync(t => t.Status == TaskItemStatus.InProgress, cancellationToken);
        var completed = await query.CountAsync(t => t.Status == TaskItemStatus.Completed, cancellationToken);

        return (pending, inProgress, completed);
    }

    public async Task ClearCategoryForTasksAsync(Guid categoryId, CancellationToken cancellationToken = default)
    {
        await _db.Tasks
            .Where(t => t.CategoryId == categoryId)
            .ExecuteUpdateAsync(
                s => s.SetProperty(t => t.CategoryId, (Guid?)null)
                    .SetProperty(t => t.UpdatedAt, DateTime.UtcNow),
                cancellationToken);
    }
}
