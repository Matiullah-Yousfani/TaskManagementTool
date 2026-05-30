using TaskManagementTool.Models.Enums;

namespace TaskManagementTool.Models.DTO_s;

public class TaskResponseDto
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string CreatedByUserId { get; set; } = string.Empty;

    public string? CreatedByUserName { get; set; }

    public string? CreatedByEmail { get; set; }

    public string AssignedToUserId { get; set; } = string.Empty;

    public string? AssignedToUserName { get; set; }

    public string? AssignedToEmail { get; set; }

    public Guid? CategoryId { get; set; }

    public string? CategoryName { get; set; }
}
