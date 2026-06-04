namespace TaskManagementTool.Models.DTO_s;

public class UserAdminDto
{
    public string Id { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public IReadOnlyList<string> Roles { get; set; } = Array.Empty<string>();

    public DateTime CreatedAt { get; set; }
}
