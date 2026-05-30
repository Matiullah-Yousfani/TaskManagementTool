using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManagementTool.Authorization;
using TaskManagementTool.DataAccess.Repositories.IRepositories;
using TaskManagementTool.Exceptions;
using TaskManagementTool.Extensions;
using TaskManagementTool.Hubs;
using TaskManagementTool.Mapping;
using TaskManagementTool.Models.Common;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Models;
using TaskManagementTool.Services;

namespace TaskManagementTool.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public sealed class TasksController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITaskNotifier _taskNotifier;
    private readonly ILogger<TasksController> _logger;

    public TasksController(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        UserManager<ApplicationUser> userManager,
        ITaskNotifier taskNotifier,
        ILogger<TasksController> logger)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _userManager = userManager;
        _taskNotifier = taskNotifier;
        _logger = logger;
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<TaskResponseDto>> Create(
        [FromBody] CreateTaskDto dto,
        CancellationToken cancellationToken)
    {
        var adminId = _currentUser.RequireUserId();

        await ValidateCategoryIdAsync(dto.CategoryId, cancellationToken);

        if (string.IsNullOrWhiteSpace(dto.AssignedToUserId))
            throw new BadRequestException("Assignee is required when creating a task.");

        var assigneeId = dto.AssignedToUserId.Trim();
        await EnsureUserExistsAsync(assigneeId, cancellationToken);

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Status = dto.Status,
            Priority = dto.Priority,
            DueDate = dto.DueDate,
            CategoryId = dto.CategoryId,
            CreatedByUserId = adminId,
            AssignedToUserId = assigneeId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.TaskRepository.AddAsync(task, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation(
            "Task {TaskId} created by admin {AdminId}, assigned to {AssignedToUserId}",
            task.Id,
            adminId,
            assigneeId);

        var created = await _unitOfWork.TaskRepository.GetByIdAsync(task.Id, cancellationToken);
        var response = EntityDtoMapper.ToTaskResponseDto(created!);
        await _taskNotifier.NotifyTaskCreatedAsync(response);

        return CreatedAtAction(nameof(GetById), new { id = task.Id }, response);
    }

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<TaskResponseDto>>> Search(
        [FromQuery] TaskQueryParametersDto parameters,
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.RequireUserId();
        var restrict = !_currentUser.IsAdmin;

        var (items, total) = await _unitOfWork.TaskRepository.SearchAsync(
            userId,
            restrict,
            parameters,
            cancellationToken);

        return Ok(new PagedResultDto<TaskResponseDto>
        {
            Items = items.Select(EntityDtoMapper.ToTaskResponseDto).ToList(),
            Page = parameters.Page < 1 ? 1 : parameters.Page,
            PageSize = parameters.PageSize,
            TotalCount = total
        });
    }

    [HttpGet("my-tasks")]
    public async Task<ActionResult<IReadOnlyList<TaskResponseDto>>> GetMyAssignedTasks(
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.RequireUserId();
        var list = await _unitOfWork.TaskRepository.GetAssignedToUserAsync(userId, cancellationToken);
        return Ok(list.Select(EntityDtoMapper.ToTaskResponseDto).ToList());
    }

    [HttpGet("export")]
    public async Task<ActionResult<IReadOnlyList<TaskExportDto>>> Export(
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.RequireUserId();
        var filter = _currentUser.IsAdmin ? null : userId;

        var tasks = await _unitOfWork.TaskRepository.GetAllForExportAsync(filter, cancellationToken);
        var export = tasks.Select(t => new TaskExportDto
        {
            Title = t.Title,
            Description = t.Description,
            Status = t.Status,
            Priority = t.Priority,
            DueDate = t.DueDate,
            CategoryName = t.Category?.Name,
            AssignedToEmail = t.AssignedToUser?.Email
        }).ToList();

        return Ok(export);
    }

    [HttpPost("import")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<TaskImportResultDto>> Import(
        [FromBody] TaskImportDto dto,
        CancellationToken cancellationToken)
    {
        var adminId = _currentUser.RequireUserId();
        var result = new TaskImportResultDto();

        foreach (var row in dto.Tasks)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(row.Title))
                {
                    result.Skipped++;
                    result.Errors.Add("Skipped row with empty title.");
                    continue;
                }

                if (string.IsNullOrWhiteSpace(row.AssignedToEmail))
                {
                    result.Skipped++;
                    result.Errors.Add($"Skipped '{row.Title}': assignee email is required.");
                    continue;
                }

                var assignee = await _userManager.FindByEmailAsync(row.AssignedToEmail.Trim());
                if (assignee == null)
                {
                    result.Skipped++;
                    result.Errors.Add($"Skipped '{row.Title}': user '{row.AssignedToEmail}' not found.");
                    continue;
                }

                Guid? categoryId = null;
                if (!string.IsNullOrWhiteSpace(row.CategoryName))
                {
                    var categories = await _unitOfWork.CategoryRepository.GetAllAsync(cancellationToken);
                    var cat = categories.FirstOrDefault(c =>
                        c.Name.Equals(row.CategoryName.Trim(), StringComparison.OrdinalIgnoreCase));
                    if (cat == null)
                    {
                        result.Skipped++;
                        result.Errors.Add($"Skipped '{row.Title}': category '{row.CategoryName}' not found.");
                        continue;
                    }
                    categoryId = cat.Id;
                }

                var task = new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = row.Title.Trim(),
                    Description = row.Description?.Trim() ?? string.Empty,
                    Status = row.Status,
                    Priority = row.Priority,
                    DueDate = row.DueDate,
                    CategoryId = categoryId,
                    CreatedByUserId = adminId,
                    AssignedToUserId = assignee.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.TaskRepository.AddAsync(task, cancellationToken);
                result.Imported++;
            }
            catch (Exception ex)
            {
                result.Skipped++;
                result.Errors.Add($"Skipped '{row.Title}': {ex.Message}");
            }
        }

        await _unitOfWork.SaveAsync(cancellationToken);
        _logger.LogInformation("Imported {Count} tasks by admin {AdminId}", result.Imported, adminId);

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TaskResponseDto>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.TaskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
            throw new NotFoundException("Task was not found.");

        TaskAccess.EnsureCurrentUserCanAccess(task, _currentUser);

        return Ok(EntityDtoMapper.ToTaskResponseDto(task));
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<TaskResponseDto>> Update(
        Guid id,
        [FromBody] UpdateTaskDto dto,
        CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.TaskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
            throw new NotFoundException("Task was not found.");

        await ValidateCategoryIdAsync(dto.CategoryId, cancellationToken);

        if (!string.IsNullOrWhiteSpace(dto.AssignedToUserId))
        {
            var next = dto.AssignedToUserId.Trim();
            await EnsureUserExistsAsync(next, cancellationToken);
            task.AssignedToUserId = next;
        }

        task.Title = dto.Title.Trim();
        task.Description = dto.Description.Trim();
        task.Status = dto.Status;
        task.Priority = dto.Priority;
        task.DueDate = dto.DueDate;
        task.CategoryId = dto.CategoryId;
        task.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation("Task {TaskId} updated by admin", id);

        var refreshed = await _unitOfWork.TaskRepository.GetByIdAsync(id, cancellationToken);
        var response = EntityDtoMapper.ToTaskResponseDto(refreshed!);
        await _taskNotifier.NotifyTaskUpdatedAsync(response);

        return Ok(response);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult<TaskResponseDto>> UpdateStatus(
        Guid id,
        [FromBody] UpdateTaskStatusDto dto,
        CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.TaskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
            throw new NotFoundException("Task was not found.");

        TaskAccess.EnsureCanUpdateStatus(task, _currentUser);

        task.Status = dto.Status;
        task.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation(
            "Task {TaskId} status changed to {Status} by {UserId}",
            id,
            dto.Status,
            _currentUser.UserId);

        var refreshed = await _unitOfWork.TaskRepository.GetByIdAsync(id, cancellationToken);
        var response = EntityDtoMapper.ToTaskResponseDto(refreshed!);
        await _taskNotifier.NotifyTaskStatusChangedAsync(response);

        return Ok(response);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var task = await _unitOfWork.TaskRepository.GetByIdAsync(id, cancellationToken);
        if (task == null)
            throw new NotFoundException("Task was not found.");

        var assigneeId = task.AssignedToUserId;

        await _unitOfWork.TaskRepository.DeleteAsync(task, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation("Task {TaskId} soft-deleted by admin", id);
        await _taskNotifier.NotifyTaskDeletedAsync(id, assigneeId);

        return NoContent();
    }

    private async Task EnsureUserExistsAsync(string userId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("The specified user account was not found.");
    }

    private async Task ValidateCategoryIdAsync(Guid? categoryId, CancellationToken cancellationToken)
    {
        if (!categoryId.HasValue)
            return;

        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(
            categoryId.Value,
            cancellationToken);

        if (category == null)
            throw new NotFoundException("Category was not found.");
    }
}
