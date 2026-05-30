using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TaskManagementTool.Models.Common;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Models;
using TaskManagementTool.Services;

namespace TaskManagementTool.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public sealed class UserAuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly TokenService _tokenService;
    private readonly ILogger<UserAuthController> _logger;

    public UserAuthController(
        UserManager<ApplicationUser> userManager,
        TokenService tokenService,
        ILogger<UserAuthController> logger)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("Register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);

        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: email {Email} already exists", request.Email);
            return BadRequest(new { message = "Email already exists." });
        }

        var user = new ApplicationUser
        {
            UserName = request.Username,
            Email = request.Email
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            _logger.LogWarning(
                "Registration failed for {Email}: {Errors}",
                request.Email,
                string.Join(", ", result.Errors.Select(e => e.Description)));

            return BadRequest(result.Errors.Select(e => new { e.Code, e.Description }));
        }

        await _userManager.AddToRoleAsync(user, AppRoles.User);

        _logger.LogInformation("User registered: {UserId} ({Email})", user.Id, user.Email);

        return Ok(new { message = "User registered successfully." });
    }

    [HttpPost("Login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            _logger.LogWarning("Login failed: unknown email {Email}", request.Email);
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var validPassword = await _userManager.CheckPasswordAsync(user, request.Password);

        if (!validPassword)
        {
            _logger.LogWarning("Login failed: bad password for user {UserId}", user.Id);
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.CreateToken(user, roles);

        _logger.LogInformation("User {UserId} logged in successfully", user.Id);

        return Ok(new AuthResponseDto
        {
            Token = token,
            UserId = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            Roles = roles.ToList()
        });
    }
}
