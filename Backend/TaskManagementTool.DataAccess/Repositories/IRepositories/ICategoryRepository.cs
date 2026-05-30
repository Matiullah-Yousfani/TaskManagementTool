using TaskManagementTool.Models.Models;

namespace TaskManagementTool.DataAccess.Repositories.IRepositories;

public interface ICategoryRepository
{
    Task AddAsync(Category category, CancellationToken cancellationToken = default);

    Task<Category?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken = default);

    Task<bool> NameExistsAsync(string name, Guid? excludeId, CancellationToken cancellationToken = default);

    Task SoftDeleteAsync(Category category, CancellationToken cancellationToken = default);
}
