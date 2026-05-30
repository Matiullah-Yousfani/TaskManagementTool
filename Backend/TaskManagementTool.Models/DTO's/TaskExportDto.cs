using TaskManagementTool.Models.Enums;

namespace TaskManagementTool.Models.DTO_s;

public class TaskExportDto
{
    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public TaskItemStatus Status { get; set; }

    public TaskPriority Priority { get; set; }

    public DateTime? DueDate { get; set; }

    public string? CategoryName { get; set; }

    public string? AssignedToEmail { get; set; }
}

public class TaskImportDto
{
    public List<TaskExportDto> Tasks { get; set; } = new();
}

public class TaskImportResultDto
{
    public int Imported { get; set; }

    public int Skipped { get; set; }

    public List<string> Errors { get; set; } = new();
}
