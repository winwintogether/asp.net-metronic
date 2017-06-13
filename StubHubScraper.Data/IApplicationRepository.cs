using StubHubScraper.Core.Data;

namespace StubHubScraper.Data
{
    public interface IApplicationRepository<T> : IRepository<T> where T : BaseEntity
    {
    }
}
