using System.Collections.Generic;
using System.ServiceProcess;
using System.Threading;
using System.Threading.Tasks;
using System;
using System.Timers;

using StubHubScraper.ExecuteSearch.Configuration;
using StubHubScraper.ExecuteSearch.Processor;
using StubHubScraper.ExecuteSearch.Context;
using StubHubScraper.Framework;

namespace StubHubScraper.ExecuteSearch
{
    public partial class ExecuteSearch : ServiceBase
    {
        IEngine appEngine;
        List<IExecuteSearchProcess> _processors = new List<IExecuteSearchProcess>();
        IExecuteSearchContext _context;
        IConfiguration _configuration;
        
        System.Timers.Timer timer = null;

        public ExecuteSearch()
        {
            InitializeComponent();
            appEngine = new AppEngine();
        }

        protected override void OnStart(string[] args)
        {
            _context = appEngine.Resolve<IExecuteSearchContext>();
            _configuration = appEngine.Resolve<IConfiguration>();

            _processors.AddRange(new IExecuteSearchProcess[] { appEngine.Resolve<IExecuteSearchProcess>() });

            //timer = new System.Timers.Timer();
            //timer.Elapsed += new ElapsedEventHandler(processQueuedEmail);
            //timer.Interval = 1000 * _configuration.RunInterval;
            //timer.Enabled = true;
            //timer.Start();
            var task = Task.Factory.StartNew(() =>
            {
                processExecuteSearch(null, null);
            });
        }
        private void processExecuteSearch(object source, ElapsedEventArgs e)
        {
            while (true)
            {
                try
                {

                    if (_processors.Count > 1)
                    {
                        throw new NotSupportedException("Multiple Processors not supported at this time!");
                    }
                    foreach (var processor in _processors)
                    {
                        processor.Process();
                    }
                }
                catch (Exception ex)
                {
                }
                TimeSpan ts = new TimeSpan(_configuration.RunInterval, 0, 0);
                Thread.Sleep(ts);
            }
        }

        protected override void OnStop()
        {
            //timer.Stop();
            //timer.Dispose();
        }
    }
}
