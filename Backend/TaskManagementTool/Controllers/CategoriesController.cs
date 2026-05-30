using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskManagementTool.DataAccess.Repositories.IRepositories;
using TaskManagementTool.Exceptions;
using TaskManagementTool.Mapping;
using TaskManagementTool.Models.Common;
using TaskManagementTool.Models.DTO_s;
using TaskManagementTool.Models.Models;

namespace TaskManagementTool.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public sealed class CategoriesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CategoriesController> _logger;

    public CategoriesController(IUnitOfWork unitOfWork, ILogger<CategoriesController> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CategoryResponseDto>>> GetAll(
        CancellationToken cancellationToken)
    {
        var list = await _unitOfWork.CategoryRepository.GetAllAsync(cancellationToken);
        return Ok(list.Select(EntityDtoMapper.ToCategoryResponseDto).ToList());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CategoryResponseDto>> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
            throw new NotFoundException("Category was not found.");

        return Ok(EntityDtoMapper.ToCategoryResponseDto(category));
    }

    [HttpPost]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<CategoryResponseDto>> Create(
        [FromBody] CreateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var name = dto.Name.Trim();

        if (await _unitOfWork.CategoryRepository.NameExistsAsync(name, null, cancellationToken))
            throw new ConflictException("A category with this name already exists.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = name,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.CategoryRepository.AddAsync(category, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation("Category {CategoryId} created", category.Id);

        var response = EntityDtoMapper.ToCategoryResponseDto(category);
        return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<ActionResult<CategoryResponseDto>> Update(
        Guid id,
        [FromBody] UpdateCategoryDto dto,
        CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
            throw new NotFoundException("Category was not found.");

        var name = dto.Name.Trim();

        if (await _unitOfWork.CategoryRepository.NameExistsAsync(name, id, cancellationToken))
            throw new ConflictException("A category with this name already exists.");

        category.Name = name;
        category.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation("Category {CategoryId} updated", id);

        return Ok(EntityDtoMapper.ToCategoryResponseDto(category));
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Admin)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var category = await _unitOfWork.CategoryRepository.GetByIdAsync(id, cancellationToken);
        if (category == null)
            throw new NotFoundException("Category was not found.");

        await _unitOfWork.TaskRepository.ClearCategoryForTasksAsync(id, cancellationToken);
        await _unitOfWork.CategoryRepository.SoftDeleteAsync(category, cancellationToken);
        await _unitOfWork.SaveAsync(cancellationToken);

        _logger.LogInformation("Category {CategoryId} soft-deleted", id);

        return NoContent();
    }
}
