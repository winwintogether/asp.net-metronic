namespace StubHubScraper.Framework
{
    public interface IStartupTask 
    {
        void Execute();

        int Order { get; }
    }
}
