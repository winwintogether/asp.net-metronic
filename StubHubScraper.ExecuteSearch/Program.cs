using System.ServiceProcess;

namespace StubHubScraper.ExecuteSearch
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        static void Main()
        {
            //System.Diagnostics.Debugger.Launch();
            ServiceBase[] servicesToRun = new ServiceBase[] 
            { 
                new ExecuteSearch() 
            };
            ServiceBase.Run(servicesToRun);
        }
    }
}
