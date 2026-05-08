using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TaskManagementTool.DataAccess;
using TaskManagementTool.Models.Repositories.IRepositories;

namespace TaskManagementTool.Models.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext applicationDbContext;


        public UnitOfWork(ApplicationDbContext dbContext)
        {
            this.applicationDbContext = dbContext;

        }




        public async Task SaveAsync()
        {
            await applicationDbContext.SaveChangesAsync();
        }





    }
}
