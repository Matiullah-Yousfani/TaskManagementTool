using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Models;
using TaskManagementTool.Models.Repositories.IRepositories;

namespace TaskManagementTool.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserAuthController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> userManager;

        public UserAuthController(UserManager<ApplicationUser> user)
        {
            this.userManager = user;   
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            // Check existing email
            var existingUser = await userManager.FindByEmailAsync(request.Email);

            if (existingUser != null)
            {
                return BadRequest("Email already exists.");
            }

            // Create user
            var user = new ApplicationUser
            {
                UserName = request.Username,
                Email = request.Email,
            };

            // Identity handles password hashing
            var result = await userManager.CreateAsync(user, request.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            return Ok("User registered successfully.");
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login(LoginRequestDto request)
        {
            var user = await userManager.FindByEmailAsync(request.Email);

            if (user == null)
            {
                return Unauthorized("Invalid email.");
            }

            var result = await userManager.CheckPasswordAsync(user, request.Password);

            if (!result)
            {
                return Unauthorized("Invalid password.");
            }

            return Ok("Login successful.");
        }
    }
}
