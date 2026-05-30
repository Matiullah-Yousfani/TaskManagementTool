using TaskManagementTool.Models.Enums;

namespace TaskManagementTool.Models.DTO_s;

public class TaskQueryParametersDto
{
    private const int MaxPageSize = 100;

    private int _pageSize = 20;

    public int Page { get; set; } = 1;

    public int PageSize
    {
        get => _pageSize;
        set => _pageSize = value > MaxPageSize ? MaxPageSize : value < 1 ? 20 : value;
    }

    public TaskItemStatus? Status { get; set; }

    public TaskPriority? Priority { get; set; }

    public Guid? CategoryId { get; set; }

    public string? Search { get; set; }
}
