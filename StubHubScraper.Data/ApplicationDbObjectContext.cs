using StubHubScraper.Data;

namespace StubHubScraper.Data
{
    public class ApplicationDbObjectContext : DbObjectContext, IApplicationDbContext
    {
        public ApplicationDbObjectContext(string nameOrConnectionString)
            : base(nameOrConnectionString)
        {
            //this.Configuration.ProxyCreationEnabled = false;
            //this.Configuration.LazyLoadingEnabled = true;
        }
    }
}
