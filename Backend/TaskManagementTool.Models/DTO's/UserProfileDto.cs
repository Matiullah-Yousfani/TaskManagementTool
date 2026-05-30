namespace TaskManagementTool.Models.DTO_s;

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public bool EmailConfirmed { get; set; }

    public DateTime CreatedAt { get; set; }

    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();
}
