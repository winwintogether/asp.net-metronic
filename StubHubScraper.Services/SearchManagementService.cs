using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

using StubHubScraper.Core;
using StubHubScraper.Core.Data;
using StubHubScraper.Data;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial class SearchManagementService : ISearchManagementService
    {
        private readonly IApplicationRepository<Search> _searchRepository;
        private readonly IApplicationRepository<SearchEvent> _searchEventRepository;
        private readonly IApplicationRepository<Event> _eventRepository;
        private readonly IApplicationRepository<SearchTemp> _searchTempRepository;
        private readonly IApplicationRepository<SearchBulk> _searchBulkRepository;
        public SearchManagementService(IApplicationRepository<Search> searchRepository,
            IApplicationRepository<SearchEvent> searchEventRepository,
            IApplicationRepository<Event> eventRepository,
            IApplicationRepository<SearchTemp> searchTempRepository,
            IApplicationRepository<SearchBulk> searchBulkRepository)
        {
            this._searchRepository = searchRepository;
            this._searchEventRepository = searchEventRepository;
            this._eventRepository = eventRepository;
            this._searchTempRepository = searchTempRepository;
            this._searchBulkRepository = searchBulkRepository;
        }


        public IQueryable<Search> GetSearches(int userId, bool archived=false)
        {
            if (!archived)
                return _searchRepository.Table.Where(x => x.UserId == userId & x.Archived == false);
            else
                return _searchRepository.Table.Where(x => x.UserId == userId);
        }

        public virtual Search GetSearch(int id)
        {
            return _searchRepository.GetById(id);
        }

        public void InsertSearch(Search search)
        {
            _searchRepository.Insert(search);
        }
        public void UpdateSearch(Search search)
        {
            _searchRepository.Update(search);
        }
        public void DeleteSearch(Search search)
        {
            _searchRepository.Delete(search);
        }

        public virtual IQueryable<SearchEvent> GetSearchEvents(int searchId)
        {
            return _searchEventRepository.Table.Where(x => x.SearchId == searchId);
        }
        public List<int> GetRunOnceADayEventIds(int userId)
        {
            var eventIds = new List<int>();
            var searches = _searchRepository.Table.Where(x => x.UserId == userId && x.ScanDayBefore == true).ToList();
            foreach (var search in searches)
            {
                var sEvents = GetSearchEvents(search.Id).ToList();
                foreach (var sEvent in sEvents)
                {
                    if (!eventIds.Contains(sEvent.EventId))
                        eventIds.Add(sEvent.EventId);
                }
            }
            return eventIds;
        }
        public void InsertSearchEvent(SearchEvent searchEvent)
        {
            _searchEventRepository.Insert(searchEvent);
        }
        public void UpdateSearchEvent(SearchEvent searchEvent)
        {
            _searchEventRepository.Update(searchEvent);
        }
        public SearchEvent GetSearchEvent(int searchId, int eventId)
        {
            return _searchEventRepository.Table.FirstOrDefault(x => x.SearchId == searchId && x.EventId == eventId);
        }
        public void DeleteSearchEvent(SearchEvent sEvent)
        {
            _searchEventRepository.Delete(sEvent);
        }
        public void DeleteSearchEvent(int searchId)
        {
            var sEvents = _searchEventRepository.Table.Where(x => x.SearchId == searchId).ToList();
            foreach (var sEvent in sEvents)
            {
                _searchEventRepository.Delete(sEvent);
            }
        }

        public Event GetEvent(int id)
        {
            return _eventRepository.GetById(id);
        }
        public void InsertEvent(Event eventItem)
        {
            _eventRepository.Insert(eventItem);
        }
        public void UpdateEvent(Event evnetItem)
        {
            _eventRepository.Update(evnetItem);
        }



        public IQueryable<SearchTemp> GetSearchTemps(int userId,int searchId,bool sync)
        {
            if (sync)
            {
                var temps = _searchTempRepository.Table.Where(x => x.UserId == userId && x.SearchId == searchId);
                if (temps.Count() == 0)
                {
                    DeleteSearchTemp(userId);
                    var sEvents = _searchEventRepository.Table.Where(x => x.SearchId == searchId).ToList();
                    foreach (var sEvent in sEvents)
                    {
                        InsertSearchTemp(new SearchTemp { UserId = userId, SearchId = searchId, EventId = sEvent.EventId, Active = sEvent.Active });
                    }
                }
            }
            return _searchTempRepository.Table.Where(x => x.UserId == userId && x.SearchId == searchId);
        }
        public SearchTemp GetSearchTemp(int id)
        {
            return _searchTempRepository.GetById(id);
        }
        public IQueryable<SearchTemp> GetSearchTemps(int userId,int searchId, int eventId)
        {
            return _searchTempRepository.Table.Where(x => x.UserId == userId && x.SearchId == searchId && x.EventId == eventId);
        }
        public void InsertSearchTemp(SearchTemp searchTemp)
        {
            _searchTempRepository.Insert(searchTemp);
        }
        public void DeleteSearchTemp(SearchTemp searchTemp)
        {
            _searchTempRepository.Delete(searchTemp);
        }
        public void DeleteSearchTemp(int userId)
        {
            var temps = _searchTempRepository.Table.Where(x => x.UserId == userId).ToList();
            foreach (var temp in temps)
            {
                _searchTempRepository.Delete(temp);
            }
        }

        public void InsertSearchBulk(SearchBulk searchBulk)
        {
            _searchBulkRepository.Insert(searchBulk);
        }
        public IQueryable<SearchBulk> GetSearchBulk(int userId)
        {
            return _searchBulkRepository.Table.Where(x => x.UserId == userId);
        }
        public SearchBulk GetSearchBulk(int userId,int eventId)
        {
            return _searchBulkRepository.Table.Where(x => x.UserId == userId & x.EventId == eventId).FirstOrDefault();
        }
        public void DeleteSearchBulk(int userId)
        {
            var records = _searchBulkRepository.Table.Where(x => x.UserId == userId).ToList();
            foreach (var record in records)
            {
                _searchBulkRepository.Delete(record);
            }
        }
    }
}
