namespace TaskManagementTool.Models.DTO_s;

public class UpdateUserAdminDto
{
    public string Email { get; set; } = string.Empty;

    /// <summary>Application role: Admin or User.</summary>
    public string Role { get; set; } = string.Empty;
}
