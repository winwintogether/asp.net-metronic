using Autofac;
using StubHubScraper.Framework;
using StubHubScraper.Framework.DependencyManagement;
using StubHubScraper.ExecuteSearch.Configuration;
using StubHubScraper.ExecuteSearch.Context;
using StubHubScraper.ExecuteSearch.Processor;
using StubHubScraper.Data;
using StubHubScraper.Services;

namespace StubHubScraper.ExecuteSearch
{
    public class DependencyRegistrar : IDependencyRegistrar
    {
        public virtual void Register(ContainerBuilder builder, ITypeFinder typeFinder)
        {
            builder.Register<IApplicationDbContext>(c => new ApplicationDbObjectContext("ApplicationConnection"));
            builder.RegisterGeneric(typeof(ApplicationEfRepository<>)).As(typeof(IApplicationRepository<>));
            builder.RegisterType<SearchManagementService>().As<ISearchManagementService>();
            builder.RegisterType<ManualScrapingService>().As<IManualScrapingService>();
            builder.RegisterType<UserService>().As<IUserService>();
            builder.RegisterType<ExecuteSearchContext>().As<IExecuteSearchContext>();
            builder.RegisterType<ExecuteSearchProcess>().As<IExecuteSearchProcess>();
            builder.RegisterType<Configuration.Configuration>().As<IConfiguration>();
        }

        public int Order
        {
            get { return 1; }
        }
    }
}
