using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Models;

namespace TaskManagementTool.Mapping;

public static class EntityDtoMapper
{
    public static TaskResponseDto ToTaskResponseDto(TaskItem task)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CreatedByUserId = task.CreatedByUserId,
            CreatedByUserName = task.CreatedBy?.UserName,
            CreatedByEmail = task.CreatedBy?.Email,
            AssignedToUserId = task.AssignedToUserId,
            AssignedToUserName = task.AssignedToUser?.UserName,
            AssignedToEmail = task.AssignedToUser?.Email,
            CategoryId = task.CategoryId,
            CategoryName = task.Category?.Name
        };
    }

    public static CategoryResponseDto ToCategoryResponseDto(Category category)
    {
        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            CreatedAt = category.CreatedAt,
            UpdatedAt = category.UpdatedAt
        };
    }
}
