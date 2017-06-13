using StubHubScraper.Data.Domain;
using System.Collections.Generic;
using System.Linq;

namespace StubHubScraper.Services
{
    public partial interface ISearchManagementService
    {
        IQueryable<Search> GetSearches(int userId, bool archived = false);
        Search GetSearch(int id);
        void InsertSearch(Search search);
        void UpdateSearch(Search search);
        void DeleteSearch(Search search);

        IQueryable<SearchEvent> GetSearchEvents(int searchId);
        void InsertSearchEvent(SearchEvent searchEvent);
        void UpdateSearchEvent(SearchEvent searchEvent);
        SearchEvent GetSearchEvent(int searchId, int eventId);
        void DeleteSearchEvent(SearchEvent sEvent);
        void DeleteSearchEvent(int searchId);

        Event GetEvent(int id);
        void InsertEvent(Event eventItem);
        void UpdateEvent(Event evnetItem);

        void InsertSearchTemp(SearchTemp searchTemp);
        void DeleteSearchTemp(SearchTemp searchTemp);
        IQueryable<SearchTemp> GetSearchTemps(int userId, int searchId, bool sync);
        void DeleteSearchTemp(int userId);
        SearchTemp GetSearchTemp(int id);
        IQueryable<SearchTemp> GetSearchTemps(int userId, int searchId, int eventId);

        void InsertSearchBulk(SearchBulk searchBulk);
        IQueryable<SearchBulk> GetSearchBulk(int userId);
        SearchBulk GetSearchBulk(int userId, int eventId);
        void DeleteSearchBulk(int userId);

        List<int> GetRunOnceADayEventIds(int userId);
    }
}
