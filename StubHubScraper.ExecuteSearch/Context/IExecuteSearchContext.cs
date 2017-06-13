using StubHubScraper.ExecuteSearch.Configuration;

namespace StubHubScraper.ExecuteSearch.Context
{
    public interface IExecuteSearchContext
    {
        IConfiguration Configuration { get; }
    }
}
