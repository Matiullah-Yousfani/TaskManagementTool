using Microsoft.EntityFrameworkCore;
using TaskManagementTool.DataAccess.Repositories.IRepositories;
using TaskManagementTool.Models.Models;

namespace TaskManagementTool.DataAccess.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ApplicationDbContext _db;

    public CategoryRepository(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task AddAsync(Category category, CancellationToken cancellationToken = default)
    {
        await _db.Categories.AddAsync(category, cancellationToken);
    }

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _db.Categories
            .OrderBy(c => c.Name)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }

    public async Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
    }

    public async Task<bool> NameExistsAsync(
        string name,
        Guid? excludeId,
        CancellationToken cancellationToken = default)
    {
        var query = _db.Categories.Where(c => c.Name == name);
        if (excludeId.HasValue)
            query = query.Where(c => c.Id != excludeId.Value);

        return await query.AnyAsync(cancellationToken);
    }

    public Task SoftDeleteAsync(Category category, CancellationToken cancellationToken = default)
    {
        category.IsDeleted = true;
        category.DeletedAt = DateTime.UtcNow;
        return Task.CompletedTask;
    }
}
