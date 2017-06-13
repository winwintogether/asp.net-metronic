using System.Configuration;

namespace StubHubScraper.ExecuteSearch.Configuration
{
    public class Configuration :IConfiguration
    {
        public int RunInterval
        {
            get
            {
                var interval = 0;
                if (!int.TryParse(ConfigurationManager.AppSettings["RunInterval"], out interval))
                    interval = 60;
                return interval;
            }
        }
    }
}
