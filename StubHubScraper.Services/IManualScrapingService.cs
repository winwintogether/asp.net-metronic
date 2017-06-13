using StubHubScraper.Data.Domain;
using System.Collections.Generic;
using System.Linq;

namespace StubHubScraper.Services
{
    public partial interface IManualScrapingService
    {
        IQueryable<EventTicket> GetEventTickets(int userId, int eventId);
        EventTicket GetEventTicket(int id);
        void InsertEventTicket(EventTicket ticket);
        void UpdateEventTicket(EventTicket ticket);
        void DeleteEventTicket(EventTicket ticket);
        void DeleteEventTickets(int userId, int eventId);
        List<Event> SearchEvents(int userId, int searchId, int eventId, string title, string venue, string startDate, string endDate, string zone,
            string sectionForm, string sectionTo, int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches);
        List<SoldTicketItem> SearchTickets(int userId, int searchId, int eventId, string title, string venue, string startDate, string endDate, string zone,
   string sectionFrom, string sectionTo, int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches);
    }
}
