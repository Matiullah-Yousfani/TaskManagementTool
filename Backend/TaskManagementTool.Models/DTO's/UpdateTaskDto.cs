using System.ComponentModel.DataAnnotations;
using TaskManagementTool.Models.Enums;

namespace TaskManagementTool.Models.DTO_s;

public class UpdateTaskDto
{
    [Required]
    [MaxLength(256)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public Guid? CategoryId { get; set; }

    /// <summary>Omit or leave null to keep current assignee. Only task creator or admin may change.</summary>
    public string? AssignedToUserId { get; set; }
}
