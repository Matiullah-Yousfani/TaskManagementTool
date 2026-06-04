using System.ComponentModel.DataAnnotations;

namespace TaskManagementTool.Models.DTO_s;

public class UpdateUserProfileDto
{
    [Required]
    [MaxLength(256)]
    public string UserName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? PhoneNumber { get; set; }
}
