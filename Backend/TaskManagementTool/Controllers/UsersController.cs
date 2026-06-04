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

    [HttpGet("manage")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<IReadOnlyList<UserAdminDto>>> GetUsersForManagement()
    {
        var users = await _userManager.Users
            .OrderBy(u => u.UserName)
            .ToListAsync();

        var result = new List<UserAdminDto>();
        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            result.Add(new UserAdminDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email,
                Roles = roles.ToList(),
                CreatedAt = user.CreatedAt
            });
        }

        return Ok(result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<UserAdminDto>> UpdateUser(
        string id,
        [FromBody] UpdateUserAdminDto dto)
    {
        var currentUserId = _currentUser.RequireUserId();
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
            throw new NotFoundException("User account was not found.");

        var email = dto.Email.Trim();
        if (string.IsNullOrWhiteSpace(email))
            throw new BadRequestException("Email is required.");

        var role = dto.Role.Trim();
        if (role != AppRoles.Admin && role != AppRoles.User)
            throw new BadRequestException("Role must be Admin or User.");

        var emailOwner = await _userManager.FindByEmailAsync(email);
        if (emailOwner != null && emailOwner.Id != id)
            throw new ConflictException("That email is already registered to another account.");

        var currentRoles = await _userManager.GetRolesAsync(user);
        var wasAdmin = currentRoles.Contains(AppRoles.Admin);

        if (wasAdmin && role != AppRoles.Admin)
        {
            var admins = await _userManager.GetUsersInRoleAsync(AppRoles.Admin);
            if (admins.Count <= 1)
                throw new BadRequestException("Cannot remove the last administrator account.");
        }

        user.Email = email;
        user.NormalizedEmail = _userManager.NormalizeEmail(email);

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var message = string.Join(" ", updateResult.Errors.Select(e => e.Description));
            throw new BadRequestException(message);
        }

        if (currentRoles.Count > 0)
        {
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
                throw new BadRequestException("Failed to update user role.");
        }

        var addResult = await _userManager.AddToRoleAsync(user, role);
        if (!addResult.Succeeded)
            throw new BadRequestException("Failed to assign user role.");

        _logger.LogInformation(
            "User {TargetUserId} updated by admin {AdminUserId}: email={Email}, role={Role}",
            id,
            currentUserId,
            email,
            role);

        var newRoles = await _userManager.GetRolesAsync(user);
        return Ok(new UserAdminDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email,
            Roles = newRoles.ToList(),
            CreatedAt = user.CreatedAt
        });
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

    [HttpPut("me")]
    public async Task<ActionResult<UserProfileDto>> UpdateCurrentUser(
        [FromBody] UpdateUserProfileDto dto)
    {
        var userId = _currentUser.RequireUserId();
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException("User account was not found.");

        var userName = dto.UserName.Trim();
        if (string.IsNullOrWhiteSpace(userName))
            throw new BadRequestException("Name is required.");

        var email = dto.Email.Trim();
        if (string.IsNullOrWhiteSpace(email))
            throw new BadRequestException("Email is required.");

        var emailOwner = await _userManager.FindByEmailAsync(email);
        if (emailOwner != null && emailOwner.Id != userId)
            throw new ConflictException("That email is already registered to another account.");

        var nameOwner = await _userManager.FindByNameAsync(userName);
        if (nameOwner != null && nameOwner.Id != userId)
            throw new ConflictException("That name is already taken by another account.");

        user.UserName = userName;
        user.NormalizedUserName = _userManager.NormalizeName(userName);
        user.Email = email;
        user.NormalizedEmail = _userManager.NormalizeEmail(email);
        user.PhoneNumber = string.IsNullOrWhiteSpace(dto.PhoneNumber)
            ? null
            : dto.PhoneNumber.Trim();

        var updateResult = await _userManager.UpdateAsync(user);
        if (!updateResult.Succeeded)
        {
            var message = string.Join(" ", updateResult.Errors.Select(e => e.Description));
            throw new BadRequestException(message);
        }

        var roles = await _userManager.GetRolesAsync(user);

        _logger.LogInformation(
            "Profile updated for user {UserId}: userName={UserName}, email={Email}",
            userId,
            userName,
            email);

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
