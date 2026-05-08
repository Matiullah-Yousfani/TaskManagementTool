using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Channels;
using System.Threading.Tasks;

namespace TaskManagementTool.Models.Repositories.IRepositories
{
    public interface IUnitOfWork
    {
            // Add other repositories here as needed
            // ITaskRepository TaskRepository { get; }
    
            Task SaveAsync();
    }
}
