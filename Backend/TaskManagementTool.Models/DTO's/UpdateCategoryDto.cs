using System.ComponentModel.DataAnnotations;

namespace TaskManagementTool.Models.DTO_s;

public class UpdateCategoryDto
{
    [Required]
    [MaxLength(128)]
    public string Name { get; set; } = string.Empty;
}
