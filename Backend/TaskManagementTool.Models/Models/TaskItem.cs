using TaskManagementTool.Models.Enums;

namespace TaskManagementTool.Models.Models;

public class TaskItem : BaseEntity
{
    public Guid Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>User who created the task (immutable after create).</summary>
    public string CreatedByUserId { get; set; } = string.Empty;

    public ApplicationUser CreatedBy { get; set; } = null!;

    /// <summary>User responsible for completing the task.</summary>
    public string AssignedToUserId { get; set; } = string.Empty;

    public ApplicationUser AssignedToUser { get; set; } = null!;

    public Guid? CategoryId { get; set; }

    public Category? Category { get; set; }
}
