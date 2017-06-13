
using Autofac;


namespace StubHubScraper.Framework.DependencyManagement
{
    public class DependencyRegistrar : IDependencyRegistrar
    {
        public void Register(ContainerBuilder builder, ITypeFinder typeFinder)
        {
            //builder.RegisterApiControllers(Assembly.GetExecutingAssembly());
            //builder.Register<IDbContext>(c => new DbObjectContext("Application")).InstancePerApiRequest();


        }

        public int Order
        {
            get { return 0; }
        }
    }
}
