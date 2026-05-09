using ClinicManagement.Domain.Common;
using ClinicManagement.Domain.Interfaces;
using ClinicManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClinicManagement.Infrastructure.Repsitories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        private readonly ApplicationDBContext _context;
        protected readonly DbSet<T> _dbSet; // For Access Any DbSet<Patient , Doctor , Appointment > And Apply On Them Crud Operation
        public GenericRepository(ApplicationDBContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }
        public virtual async Task<T> AddAsync(T entity) { await _dbSet.AddAsync(entity); return entity; }


        public async Task DeleteAsync(Guid id)
        {
            var item = await _dbSet.FindAsync(id);
            if (item != null)
                _dbSet.Remove(item);
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _dbSet.FindAsync(id) != null;
        }

        public async Task<IEnumerable<T?>> GetAllAsync() => await _dbSet.ToListAsync();

        public async Task<T?> GetByIdAsync(Guid Id) => await _dbSet.FindAsync(Id);
        public async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            return entity;
        }

        public async Task<PagedResult<T>> GetPagedAsync(int page, int pageSize)
        {
            var total = await _dbSet.CountAsync();
            var data = await _dbSet
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PagedResult<T>
            {
                Data = data,
                total = total,
                Page = page,
                PageSize = pageSize
            };
        }
    }

}

