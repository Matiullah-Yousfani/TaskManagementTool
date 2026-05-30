using System.ComponentModel.DataAnnotations;
using TaskManagementTool.Models.Enums;

namespace TaskManagementTool.Models.DTO_s;

public class CreateTaskDto
{
    [Required]
    [MaxLength(256)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(4000)]
    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; } = TaskItemStatus.Pending;

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public Guid? CategoryId { get; set; }

    [Required]
    public string AssignedToUserId { get; set; } = string.Empty;
}

