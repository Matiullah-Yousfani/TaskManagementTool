using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskManagementTool.Exceptions;
using TaskManagementTool.Extensions;
using TaskManagementTool.Models.Common;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Models;
using TaskManagementTool.Services;

namespace TaskManagementTool.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public sealed class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUser;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUser,
        ILogger<UsersController> logger)
    {
        _userManager = userManager;
        _currentUser = currentUser;
        _logger = logger;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<IReadOnlyList<UserSummaryDto>>> GetAllUsers()
    {
        var users = await _userManager.Users
            .OrderBy(u => u.UserName)
            .Select(u => new UserSummaryDto
            {
                Id = u.Id,
                UserName = u.UserName ?? string.Empty,
                Email = u.Email
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetCurrentUser()
    {
        var userId = _currentUser.RequireUserId();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User account was not found.");

        var roles = await _userManager.GetRolesAsync(user);

        _logger.LogInformation("Profile loaded for user {UserId}", userId);

        return Ok(new UserProfileDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            EmailConfirmed = user.EmailConfirmed,
            CreatedAt = user.CreatedAt,
            Roles = roles.ToList()
        });
    }
}
