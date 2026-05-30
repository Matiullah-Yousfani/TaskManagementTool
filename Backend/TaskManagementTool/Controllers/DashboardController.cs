using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagementTool.DataAccess.Repositories.IRepositories;
using TaskManagementTool.Extensions;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Services;

namespace TaskManagementTool.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize]
public sealed class DashboardController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<DashboardController> _logger;

    public DashboardController(
        IUnitOfWork unitOfWork,
        ICurrentUserService currentUser,
        ILogger<DashboardController> logger)
    {
        _unitOfWork = unitOfWork;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet("task-counts")]
    public async Task<ActionResult<DashboardCountsDto>> GetTaskCounts(
        CancellationToken cancellationToken)
    {
        var userId = _currentUser.RequireUserId();
        var restrict = !_currentUser.IsAdmin;

        var (pending, inProgress, completed) =
            await _unitOfWork.TaskRepository.GetStatusCountsAsync(userId, restrict, cancellationToken);

        _logger.LogInformation(
            "Dashboard counts requested by {UserId} (admin: {IsAdmin})",
            userId,
            _currentUser.IsAdmin);

        return Ok(new DashboardCountsDto
        {
            Pending = pending,
            InProgress = inProgress,
            Completed = completed
        });
    }
}
