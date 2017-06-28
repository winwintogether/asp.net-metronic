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
    public class LookupTicketsController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IManualScrapingService _manualScrapingService;
        private readonly ILogger _logger;
        public LookupTicketsController(
            IAuthenticationService authenticationService,
            ILogger logger,
            IManualScrapingService manualScrapingService)
        {
            this._authenticationService = authenticationService;
            this._manualScrapingService = manualScrapingService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<EventTicketModel> GetTickets(int searchId, int eventId, string title, string venue,
            string startDate, string endDate, string zone, string sectionForm, string sectionTo,
            int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var eventTickets = new List<EventTicketModel>();
            try
            {
                var soldTickets = _manualScrapingService.SearchTickets(user.Id, searchId, eventId, title, venue, startDate, endDate, zone, sectionForm, sectionTo,
                    LastWeekSalesOnly, HidePastEvents, ShowArchivedSearches);
                foreach (var ticket in soldTickets)
                {
                    var eventTicket = new EventTicketModel()
                    {
                        Id = ticket.Id,
                        EventId = ticket.EventId,
                        EventTitle = ticket.Title,
                        EventVenue = ticket.Venue,
                        EventDate = ticket.Date.HasValue == true ? ticket.Date.Value.ToString("MM/dd/yyyy") : "",
                        Zone = ticket.Zone,
                        Section = ticket.Section,
                        Price = ticket.Price,
                        Row = ticket.Row,
                        Qty = ticket.Qty,
                        DateSold = ticket.DateSold.ToString("MM/dd/yyyy")
                    };
                    eventTickets.Add(eventTicket);
                }
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
            }
            return eventTickets.AsQueryable();
        }

        public HttpResponseMessage Delete(int id)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var ticket = _manualScrapingService.GetEventTicket(id);
            if (ticket == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }
            try
            {
                _manualScrapingService.DeleteEventTicket(ticket);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            // return Request.CreateResponse(HttpStatusCode.OK);
            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }

    }

}