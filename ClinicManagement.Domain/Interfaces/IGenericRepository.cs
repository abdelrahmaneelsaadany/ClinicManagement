

using ClinicManagement.Domain.Common;

namespace ClinicManagement.Domain.Interfaces

{
    public interface IGenericRepository<T> where T : class
    {
        Task<PagedResult<T>> GetPagedAsync(int page, int pageSize);
        Task<T?> GetByIdAsync(Guid Id);
        Task<IEnumerable<T?>> GetAllAsync();
        Task<T> AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
    }
}
