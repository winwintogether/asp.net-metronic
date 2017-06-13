using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;

using Autofac;
using Autofac.Core;
using Autofac.Integration.Mvc;
using Autofac.Integration.WebApi;

using StubHubScraper.Framework;
using StubHubScraper.Framework.DependencyManagement;

using StubHubScraper.Data;

using StubHubScraper.Core.Caching;

using StubHubScraper.Services;

namespace StubHubScraper.Web.Infrastructure
{
    public class DependencyRegistrar : IDependencyRegistrar
    {
        public void Register(ContainerBuilder builder, ITypeFinder typeFinder)
        {
            //register controllers
            builder.RegisterControllers(Assembly.GetExecutingAssembly());
            builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
            
            //register dbcontext
            builder.Register<IApplicationDbContext>(c => new ApplicationDbObjectContext("ApplicationConnection")).InstancePerHttpRequest();
            builder.RegisterGeneric(typeof(ApplicationEfRepository<>)).As(typeof(IApplicationRepository<>)).InstancePerHttpRequest();

            //register services
            builder.RegisterType<UserService>().As<IUserService>().InstancePerHttpRequest();
            builder.RegisterType<FormsAuthenticationService>().As<IAuthenticationService>().InstancePerHttpRequest();
            builder.RegisterType<QuickSearchService>().As<IQuickSearchService>().InstancePerHttpRequest();
            builder.RegisterType<SearchManagementService>().As<ISearchManagementService>().InstancePerHttpRequest();
            builder.RegisterType<ManualScrapingService>().As<IManualScrapingService>().InstancePerHttpRequest();
            builder.RegisterType<DefaultLogger>().As<ILogger>().InstancePerHttpRequest();
            //cache manager
            builder.RegisterType<MemoryCacheManager>().As<ICacheManager>().SingleInstance();

        }

        public int Order
        {
            get { return 1; }
        }
    }
}