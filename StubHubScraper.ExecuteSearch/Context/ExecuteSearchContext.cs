using StubHubScraper.ExecuteSearch.Configuration;

namespace StubHubScraper.ExecuteSearch.Context
{
    public class ExecuteSearchContext :IExecuteSearchContext
    {
        private static IConfiguration _configuration;

        public ExecuteSearchContext(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IConfiguration Configuration
        {
            get { return _configuration; }
        }
    }
}
