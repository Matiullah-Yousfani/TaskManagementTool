namespace TaskManagementTool.DataAccess.Repositories.IRepositories;

public interface IUnitOfWork
{
    ITaskRepository TaskRepository { get; }

    ICategoryRepository CategoryRepository { get; }

    Task SaveAsync(CancellationToken cancellationToken = default);
}
