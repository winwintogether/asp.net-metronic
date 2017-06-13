using Autofac;
using StubHubScraper.Services;
using StubHubScraper.ExecuteSearch.Configuration;
using StubHubScraper.ExecuteSearch.Context;

namespace StubHubScraper.ExecuteSearch
{
    public class ContainerManager
    {
        private static IContainer _container = null;

        public static IContainer BuildContainer()
        {
            if (_container != null)
                return _container;

            var builder = new ContainerBuilder();

            return _container = builder.Build();
        }
    }
}
