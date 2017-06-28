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
    public class ScrapingEventController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ISearchManagementService _searchManagementService;
        private readonly IManualScrapingService _manualScrapingService;
        private readonly IUserService _userService;
        private readonly ILogger _logger;
        public ScrapingEventController(ISearchManagementService searchManagementService,
            IAuthenticationService authenticationService,
            ILogger logger,
            IUserService userService,
            IManualScrapingService manualScrapingService)
        {
            this._authenticationService = authenticationService;
            this._searchManagementService = searchManagementService;
            this._manualScrapingService = manualScrapingService;
            this._userService = userService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<MultiSelectModel> GetEvents(int searchId)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var sEvents = _searchManagementService.GetSearchEvents(searchId);
            var events = new List<MultiSelectModel>();
            foreach (var sEvent in sEvents)
            {
                var eventItem = _searchManagementService.GetEvent(sEvent.EventId);
                events.Add(new MultiSelectModel { text = string.Format("{0}-{1}", sEvent.EventId, eventItem.Title), value = sEvent.EventId.ToString() });
            }
            return events.AsQueryable();
        }

        [HttpGet]
        public HttpResponseMessage ScrapingEvents(string ids)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            try
            {
                StubHub.Login(user.ApiUserName, user.ApiPassword);
                var eventIds = ids.Split(new char[] { ',' }).ToList();
                foreach (var eventId in eventIds)
                {
                    if (user.IsScrapingStop)
                    {
                        user.IsScrapingStop = false;
                        _userService.UpdateUser(user);
                        break;
                    }
                    Event eventItem = new Event() { Id = int.Parse(eventId) };
                    var exists = StubHub.ScrapeEventMainInfo(eventItem, user.ApplicationToken);
                    if (exists)
                    {
                        var tickets = StubHub.ScrapeEventSoldTickets(eventItem, user.ApplicationToken);
                        var oldTickets = _manualScrapingService.GetEventTickets(user.Id, eventItem.Id).ToList();
                        foreach (var ticket in tickets)
                        {
                            bool accepted = true;
                            ticket.Price = Math.Round(ticket.Price, 2);
                            foreach (var oldTicket in oldTickets)
                            {
                                if (ticket.Zone == oldTicket.Zone
                                    && ticket.Section == oldTicket.Section
                                    && ticket.Price == oldTicket.Price
                                    && ticket.Row == oldTicket.Row
                                    && ticket.Qty == oldTicket.Qty
                                    && ticket.DateSold == oldTicket.DateSold)
                                {
                                    accepted = false;
                                    break;
                                }
                            }
                            if (accepted)
                            {
                                var eventTicket = new EventTicket()
                                 {
                                     EventId = eventItem.Id,
                                     UserId = user.Id,
                                     Zone = ticket.Zone,
                                     Section = ticket.Section,
                                     Price = ticket.Price,
                                     Row = ticket.Row,
                                     Qty = ticket.Qty,
                                     DateSold = ticket.DateSold
                                 };

                                _manualScrapingService.InsertEventTicket(eventTicket);
                            }
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            //return Request.CreateResponse(HttpStatusCode.OK);

            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }
    }

}