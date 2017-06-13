using System;
using StubHubScraper.Framework.DependencyManagement;

namespace StubHubScraper.Framework
{
    /// <summary>
    /// Classes implementing this interface can serve as a portal for the 
    /// various services composing the app engine. Edit functionality, modules
    /// and implementations access most app functionality through this 
    /// interface.
    /// </summary>
    public interface IEngine
    {
        ContainerManager ContainerManager { get; }
        
        /// <summary>
        /// Initialize components and plugins in the app environment.
        /// </summary>
        void Initialize();

        T Resolve<T>() where T : class;

        object Resolve(Type type);

        T[] ResolveAll<T>();
    }
}
