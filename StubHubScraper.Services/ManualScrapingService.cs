using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

using StubHubScraper.Core;
using StubHubScraper.Core.Data;
using StubHubScraper.Data;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial class ManualScrapingService : IManualScrapingService
    {
        private readonly IApplicationRepository<Search> _searchRepository;
        private readonly IApplicationRepository<SearchEvent> _searchEventRepository;
        private readonly IApplicationRepository<Event> _eventRepository;
        private readonly IApplicationRepository<EventTicket> _eventTicketRepository;
        private readonly IApplicationDbContext _dbContext;
        public ManualScrapingService(IApplicationRepository<Search> searchRepository,
            IApplicationRepository<SearchEvent> searchEventRepository,
            IApplicationRepository<Event> eventRepository,
            IApplicationRepository<EventTicket> eventTicketRepository,
            IApplicationDbContext dbContext)
        {
            this._searchRepository = searchRepository;
            this._searchEventRepository = searchEventRepository;
            this._eventRepository = eventRepository;
            this._eventTicketRepository = eventTicketRepository;
            this._dbContext = dbContext;
        }

        public IQueryable<EventTicket> GetEventTickets(int userId, int eventId)
        {

            return _eventTicketRepository.Table.Where(x => x.UserId == userId & x.EventId == eventId);

        }

        public virtual EventTicket GetEventTicket(int id)
        {
            return _eventTicketRepository.GetById(id);
        }

        public void InsertEventTicket(EventTicket ticket)
        {
            _eventTicketRepository.Insert(ticket);
        }
        public void UpdateEventTicket(EventTicket ticket)
        {
            _eventTicketRepository.Update(ticket);
        }
        public void DeleteEventTicket(EventTicket ticket)
        {
            _eventTicketRepository.Delete(ticket);
        }
        public void DeleteEventTickets(int userId, int eventId)
        {
            var tickets = _eventTicketRepository.Table.Where(x => x.UserId == userId && x.EventId == eventId).ToList();
            foreach (var ticket in tickets)
            {
                _eventTicketRepository.Delete(ticket);
            }
        }
        public List<Event> SearchEvents(int userId, int searchId, int eventId, string title, string venue, string startDate, string endDate, string zone,
            string sectionForm, string sectionTo, int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT DISTINCT e.* FROM dbo.[Events] e INNER JOIN dbo.[SearchEvents] se ON se.EventId=e.Id INNER JOIN dbo.[Searches] s ON s.Id=se.SearchId INNER JOIN dbo.[EventTickets] et ON et.EventId=e.Id");
            query.Append(string.Format(" WHERE s.UserId = {0}", userId));
            if (searchId != 0)
            {
                query.Append(string.Format("AND s.Id = {0} ", searchId));
            }
            if (eventId != 0)
            {
                query.Append(string.Format("AND e.Id = {0}", eventId));
            }

            if (!string.IsNullOrEmpty(title))
            {
                query.Append(string.Format("AND e.Title LIKE '%{0}%' ", title));
            }

            if (!string.IsNullOrEmpty(venue))
            {
                query.Append(string.Format("AND e.Venue LIKE '%{0}%' ", venue));
            }

            if (startDate != "null")
            {
                query.Append(string.Format("AND  e.Date IS NULL OR e.Date>='{0}'", startDate));
            }

            if (endDate != "null")
            {
                query.Append(string.Format("AND  e.Date IS NULL OR e.Date<='{0}'", endDate));
            }

            if (LastWeekSalesOnly == 1)
            {
                query.Append(" AND (et.DateSold < DateAdd(dd, 1, GetDate())) AND (et.DateSold >= DateAdd(dd, -6, GetDate())) ");
            }

            if (!string.IsNullOrEmpty(zone))
            {
                query.Append(string.Format("AND et.Zone LIKE '%{0}%' ", zone));
            }
            if (HidePastEvents == 1)
            {
                query.Append("AND  e.Date IS NULL OR e.Date>=GetDate()");
            }

            if (ShowArchivedSearches == 1)
            {
                query.Append("AND  s.archived = 0)");
            }
            var events = _dbContext.SqlQuery<Event>(query.ToString()).ToList();
            return events;
        }

        public List<SoldTicketItem> SearchTickets(int userId, int searchId, int eventId, string title, string venue, string startDate, string endDate, string zone,
    string sectionFrom, string sectionTo, int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches)
        {
            StringBuilder query = new StringBuilder();
            query.Append("SELECT distinct e.title, e.venue, e.Date, et.* FROM dbo.EventTickets et INNER JOIN (dbo.[SearchEvents] se INNER JOIN dbo.[Events] e ON se.EventId=e.Id) ON e.Id=et.EventId");
            query.Append(string.Format(" WHERE et.UserId = {0}", userId));
            if (searchId != 0)
            {
                query.Append(string.Format("AND se.SearchId = {0} ", searchId));
            }
            if (eventId != 0)
            {
                query.Append(string.Format("AND e.Id = {0}", eventId));
            }

            if (!string.IsNullOrEmpty(title))
            {
                query.Append(string.Format("AND e.Title LIKE '%{0}%' ", title));
            }

            if (!string.IsNullOrEmpty(venue))
            {
                query.Append(string.Format("AND e.Venue LIKE '%{0}%' ", venue));
            }

            if (startDate != "null")
            {
                query.Append(string.Format("AND  ( e.Date IS NULL OR e.Date>='{0}') ", startDate));
            }

            if (endDate != "null")
            {
                query.Append(string.Format("AND ( e.Date IS NULL OR e.Date<='{0}' ) ", endDate));
            }

            if (LastWeekSalesOnly == 1)
            {
                query.Append(" AND (et.DateSold < DateAdd(dd, 1, GetDate())) AND (et.DateSold >= DateAdd(dd, -6, GetDate())) ");
            }

            if (!string.IsNullOrEmpty(zone))
            {
                query.Append(string.Format("AND et.Zone LIKE '%{0}%' ", zone));
            }
            if (HidePastEvents == 1)
            {
                query.Append("AND ( e.Date IS NULL OR e.Date>=GetDate())");
            }

            if (ShowArchivedSearches == 1)
            {
                query.Append("AND se.SearchId IN (SELECT Id FROM dbo.[Searches] WHERE Archived = 0 ) ");
            }
            var eTickets = _dbContext.SqlQuery<SoldTicketItem>(query.ToString()).ToList();
            var tickets = new List<SoldTicketItem>();
            foreach (var eTicket in eTickets)
            {
                var accepted = true;
                if (!string.IsNullOrEmpty(sectionFrom) || !string.IsNullOrEmpty(sectionTo))
                {
                    accepted = false;
                    foreach (string poss in StubHub.GetPossibleMatches(sectionFrom,sectionTo))
                    {
                        if (Regex.IsMatch(eTicket.Section, "\\b" + poss + "\\b"))
                        {
                            accepted = true;
                            break;
                        }
                    }
                }
                if (accepted)
                    tickets.Add(eTicket);
            }
            return tickets;
        }
    }
    public class SoldTicketItem
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string Title { get; set; }
        public string Venue { get; set; }
        public DateTime? Date { get; set; }
        public string Zone { get; set; }
        public string Section { get; set; }
        public decimal Price { get; set; }
        public string Row { get; set; }
        public int Qty { get; set; }
        public DateTime DateSold { get; set; }
    }
}
