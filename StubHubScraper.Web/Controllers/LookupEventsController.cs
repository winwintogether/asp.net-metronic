using System;
using System.Linq;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using StubHubScraper.Web.Filters;
using StubHubScraper.Web.Models;

using StubHubScraper.Data.Domain;
using StubHubScraper.Services;

namespace StubHubScraper.Web.Controllers
{
    //[Authorize]
    public class LookupEventsController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IManualScrapingService _manualScrapingService;
        private readonly ILogger _logger;
        public LookupEventsController(
            IAuthenticationService authenticationService,
            ILogger logger,
            IManualScrapingService manualScrapingService)
        {
            this._authenticationService = authenticationService;
            this._manualScrapingService = manualScrapingService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<EventModel> GetEvents(int searchId,int eventId,string title,string venue,
            string startDate,string endDate,string zone,string sectionForm,string sectionTo,
            int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var eventList = new List<EventModel>();
            try
            {
                var soldTickets = _manualScrapingService.SearchTickets(user.Id, searchId, eventId, title, venue, startDate, endDate, zone, sectionForm, sectionTo,
                    LastWeekSalesOnly, HidePastEvents, ShowArchivedSearches);
                var eIds = soldTickets.Select(x => x.EventId).Distinct();
                foreach (var eId in eIds)
                {
                    var eTicket = soldTickets.FirstOrDefault(x => x.EventId == eId);
                    var ei = new EventModel()
                    {
                        Id = eTicket.EventId,
                        Title = eTicket.Title,
                        Venue = eTicket.Venue,
                        Date = eTicket.Date.HasValue == true ? eTicket.Date.Value.ToString("MM/dd/yyyy") : "",
                        TicketsCount = soldTickets.Where(x=>x.EventId==eId).Sum(x=>x.Qty),
                        Sales = soldTickets.Where(x => x.EventId == eId).Count()
                    };
                    ei.AvgPrice = Math.Round(soldTickets.Where(x => x.EventId == eId).Sum(x => x.Qty * x.Price) / ei.TicketsCount, 2);
                    eventList.Add(ei);
                }
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
            }
            return eventList.AsQueryable();
        }

    }

}