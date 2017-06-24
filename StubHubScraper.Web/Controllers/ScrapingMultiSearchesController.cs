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
    public class ScrapingMultiSearchesController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ISearchManagementService _searchManagementService;
        private readonly IManualScrapingService _manualScrapingService;
        private readonly IUserService _userService;
        private readonly ILogger _logger;
        public ScrapingMultiSearchesController(ISearchManagementService searchManagementService,
            IAuthenticationService authenticationService,
            IUserService userService,
            ILogger logger,
            IManualScrapingService manualScrapingService)
        {
            this._authenticationService = authenticationService;
            this._searchManagementService = searchManagementService;
            this._manualScrapingService = manualScrapingService;
            this._userService = userService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<MultiSelectModel> GetSearches()
        {
            var user = _authenticationService.GetAuthenticatedUser();

            var searches = _searchManagementService.GetSearches(user.Id, false);
            var mSearches = new List<MultiSelectModel>();
            foreach (var search in searches)
            {
                mSearches.Add(new MultiSelectModel { text = search.Name, value = search.Id.ToString() });
            }
            return mSearches.AsQueryable();
        }
        [HttpGet]
        public HttpResponseMessage ScrapingMultiSearches(string ids)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            try
            {
                StubHub.Login(user.ApiUserName, user.ApiPassword);
                var searchIds = ids.Split(new char[] { ',' }).ToList();
                var eventIds = new List<int>();
                foreach (var searchId in searchIds)
                {
                    var sEvents = _searchManagementService.GetSearchEvents(int.Parse(searchId)).ToList();
                    foreach (var sEvent in sEvents)
                    {
                        if (!eventIds.Contains(sEvent.EventId))
                            eventIds.Add(sEvent.EventId);
                    }
                }
                foreach (var eventId in eventIds)
                {
                    if (user.IsScrapingStop)
                    {
                        user.IsScrapingStop = false;
                        _userService.UpdateUser(user);
                        break;
                    }
                    Event eventItem = new Event() { Id = eventId };
                    var exists = StubHub.ScrapeEventMainInfo(eventItem, user.ApplicationToken);
                    if (exists)
                    {
                        var tickets = StubHub.ScrapeEventSoldTickets(eventItem, user.ApplicationToken);
                        var oldTickets = _manualScrapingService.GetEventTickets(user.Id, eventItem.Id);
                        foreach (var ticket in tickets)
                        {
                            bool accepted = true;
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
            // return Request.CreateResponse(HttpStatusCode.OK);

            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);        
            return response;
        }
    }

}