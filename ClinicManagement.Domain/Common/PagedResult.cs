namespace ClinicManagement.Domain.Common
{
    public class PagedResult<T>
    {
        public IEnumerable<T> Data { get; set; } = Enumerable.Empty<T>();
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int total { get; set; }

    }
}
