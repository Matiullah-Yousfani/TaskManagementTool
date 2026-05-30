using TaskManagementTool.DataAccess.Repositories.IRepositories;

namespace TaskManagementTool.DataAccess.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(
        ApplicationDbContext context,
        ITaskRepository taskRepository,
        ICategoryRepository categoryRepository)
    {
        _context = context;
        TaskRepository = taskRepository;
        CategoryRepository = categoryRepository;
    }

    public ITaskRepository TaskRepository { get; }

    public ICategoryRepository CategoryRepository { get; }

    public async Task SaveAsync(CancellationToken cancellationToken = default)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
}
