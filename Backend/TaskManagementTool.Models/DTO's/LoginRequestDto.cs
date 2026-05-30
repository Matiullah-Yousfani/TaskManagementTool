using System.ComponentModel.DataAnnotations;

namespace TaskManagementTool.Models.DTO_s;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}
