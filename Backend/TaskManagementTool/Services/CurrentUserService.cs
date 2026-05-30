using Microsoft.AspNetCore.Authentication;
using System.Security.Claims;
using TaskManagementTool.Models.Common;

namespace TaskManagementTool.Services;

public interface ICurrentUserService
{
    string? UserId { get; }

    bool IsAuthenticated { get; }

    bool IsAdmin { get; }

    IReadOnlyList<string> Roles { get; }
}

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public bool IsAuthenticated => !string.IsNullOrEmpty(UserId);

    public bool IsAdmin => User?.IsInRole(AppRoles.Admin) ?? false;

    public IReadOnlyList<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList()
        ?? (IReadOnlyList<string>)Array.Empty<string>();
}
