using System;
using System.Linq;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Text.RegularExpressions;
using System.Net.Http;
using System.Web.Http;
using StubHubScraper.Web.Filters;
using StubHubScraper.Web.Models;

using StubHubScraper.Data.Domain;
using StubHubScraper.Services;

namespace StubHubScraper.Web.Controllers
{
    //[Authorize]
    public class QuickSearchesController : ApiController
    {
        private readonly IQuickSearchService _quickSearchService;
        private readonly IAuthenticationService _authenticationService;
        private readonly ILogger _logger;
        public QuickSearchesController(IQuickSearchService quickSearchService,
            ILogger logger,
            IAuthenticationService authenticationService)
        {
            this._quickSearchService = quickSearchService;
            this._authenticationService = authenticationService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<QuickSearchModel> GetQuickSearches()
        {
            var user = _authenticationService.GetAuthenticatedUser();

            return _quickSearchService.GetQuickSearches(user.Id).Select(PrepareQuickSearchModel).AsQueryable();
        }

        public QuickSearch GetById(int id, int isNew, int isSave,string sectionFrom="",string sectionTo="",int LastWeekSalesOnly=1,  string zones = "")
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var quickSearch = new QuickSearch();
            if (isNew == 1)
            {
                try
                {
                    StubHub.Login(user.ApiUserName, user.ApiPassword);
                    Event eventItem = new Event() { Id = id };
                    quickSearch.EventId = id;
                    var exists = StubHub.ScrapeEventMainInfo(eventItem, user.ApplicationToken);
                    if (exists)
                    {
                        var quicktickets = StubHub.ScrapeEventSoldTickets(eventItem, user.ApplicationToken);
                        quickSearch.UserId = user.Id;
                        quickSearch.EventId = eventItem.Id;
                        quickSearch.EventTitle = eventItem.Title;
                        quickSearch.EventVenue = eventItem.Venue;
                        if (eventItem.Date.HasValue)
                            quickSearch.EventDate = eventItem.Date.Value;
                        else
                            quickSearch.EventDate = new DateTime(2000, 1, 1);
                        quickSearch.EventZones = zones;
                        quickSearch.SectionFrom = sectionFrom;
                        quickSearch.SectionTo = sectionTo;
                        quickSearch.Zones = "";
                        quickSearch.LastWeekSalesOnly = LastWeekSalesOnly == 1 ? true : false;
                        quickSearch.LastScrape = DateTime.Now;
                        quickSearch.AllSales = quicktickets.Count;
                        quickSearch.AllTickets = quicktickets.Sum(x => x.Qty);
                        quickSearch.AvgPrice = Math.Round(quicktickets.Sum(x => x.Qty * x.Price) / quickSearch.AllTickets, 2);
                        quickSearch.Deleted = isSave == 1 ? false : true;

                        decimal filterTotal = 0;
                        int filterSales = 0;
                        int filterTickets = 0;
                        var ei = _quickSearchService.GetQuickSearch(eventItem.Id);
                        if (ei == null)
                        {
                            _quickSearchService.InsertQuickSearchItem(quickSearch);
                            foreach (var ticket in quicktickets)
                            {
                                bool accepted = true;
                                if (quickSearch.LastWeekSalesOnly)
                                {
                                    accepted = (ticket.DateSold < DateTime.Now.Date.AddDays(1) && ticket.DateSold >= DateTime.Now.Date.AddDays(-6));
                                }

                                if (accepted && (!string.IsNullOrEmpty(zones)))
                                {
                                    accepted = zones.Contains(ticket.Zone);
                                }

                                if (accepted && (!string.IsNullOrEmpty(sectionFrom) || !string.IsNullOrEmpty(sectionTo)))
                                {
                                    accepted = false;
                                    foreach (string poss in StubHub.GetPossibleMatches(sectionFrom, sectionTo))
                                    {
                                        if (Regex.IsMatch(ticket.Section, "\\b" + poss + "\\b"))
                                        {
                                            accepted = true;
                                            break;
                                        }
                                    }
                                }
                                if (accepted)
                                {
                                    filterSales += 1;
                                    filterTickets += ticket.Qty;
                                    filterTotal += ticket.Qty * ticket.Price;
                                    ticket.UserId = user.Id;
                                    ticket.QuickId = quickSearch.Id;
                                    _quickSearchService.InsertQuickTicketItem(ticket);
                                }

                            }
                            quickSearch.FilterAvgPrice = Math.Round(filterTotal / filterTickets, 2);
                            quickSearch.FilterSales = filterSales;
                            quickSearch.FilterTickets = filterTickets;
                            _quickSearchService.UpdateQuickSearchItem(quickSearch);
                        }
                        else
                        {
                            ei.EventTitle = quickSearch.EventTitle;
                            ei.EventVenue = quickSearch.EventVenue;
                            ei.EventDate = quickSearch.EventDate;
                            ei.EventZones = quickSearch.EventZones;
                            ei.SectionFrom = quickSearch.SectionFrom;
                            ei.SectionTo = quickSearch.SectionTo;
                            ei.Zones = quickSearch.Zones;
                            ei.LastWeekSalesOnly = quickSearch.LastWeekSalesOnly;
                            ei.LastScrape = quickSearch.LastScrape;
                            ei.AllTickets = quicktickets.Sum(x => x.Qty);
                            ei.AllSales = quicktickets.Count;
                            ei.AvgPrice = Math.Round(quicktickets.Sum(x => x.Qty * x.Price) / ei.AllTickets, 2);
                            ei.Deleted = isSave == 1 ? false : true;

                           // _quickSearchService.DeleteQuickTickets(ei.Id);
                            var oldTickets = _quickSearchService.GetQuickTickets(ei.Id);
                            foreach (var ticket in quicktickets)
                            {
                                bool accepted = true;
                                if (quickSearch.LastWeekSalesOnly)
                                {
                                    accepted = (ticket.DateSold < DateTime.Now.Date.AddDays(1) && ticket.DateSold >= DateTime.Now.Date.AddDays(-6));
                                }

                                if (accepted && (!string.IsNullOrEmpty(zones)))
                                {
                                    accepted = zones.Contains(ticket.Zone);
                                }

                                if (accepted && (!string.IsNullOrEmpty(sectionFrom) || !string.IsNullOrEmpty(sectionTo)))
                                {
                                    accepted = false;
                                    foreach (string poss in StubHub.GetPossibleMatches(sectionFrom, sectionTo))
                                    {
                                        if (Regex.IsMatch(ticket.Section, "\\b" + poss + "\\b"))
                                        {
                                            accepted = true;
                                            break;
                                        }
                                    }
                                }
                                if (accepted)
                                {
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
                                }
                                if (accepted)
                                {

                                    filterSales += 1;
                                    filterTickets += ticket.Qty;
                                    filterTotal += ticket.Qty * ticket.Price;

                                    ticket.UserId = user.Id;
                                    ticket.QuickId = ei.Id;
                                    _quickSearchService.InsertQuickTicketItem(ticket);
                                }

                            }
                            ei.FilterAvgPrice = Math.Round(filterTotal / filterTickets, 2);
                            ei.FilterSales = filterSales;
                            ei.FilterTickets = filterTickets;
                            _quickSearchService.UpdateQuickSearchItem(ei);
                            return ei;
                        }

                    }
                }
                catch (Exception ex)
                {
                    _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                }
            }
            else
            {
                try
                {
                    var oldTickets = _quickSearchService.GetQuickTickets(id, 1);
                    quickSearch = _quickSearchService.GetQuickSearchItemById(id);
                    var eventItem = new Event();
                    eventItem.Id = quickSearch.EventId;
                    StubHub.Login(user.ApiUserName, user.ApiPassword);
                    var exists = StubHub.ScrapeEventMainInfo(eventItem, user.ApplicationToken);
                    var quicktickets = StubHub.ScrapeEventSoldTickets(eventItem, user.ApplicationToken);
                    decimal filterTotal = 0;
                    int filterSales = 0;
                    int filterTickets = 0;
                    foreach (var ticket in quicktickets)
                    {
                        bool accepted = true;
                        if (quickSearch.LastWeekSalesOnly)
                        {
                            accepted = (ticket.DateSold < DateTime.Now.Date.AddDays(1) && ticket.DateSold >= DateTime.Now.Date.AddDays(-6));
                        }

                        if (accepted && (!string.IsNullOrEmpty(quickSearch.EventZones)))
                        {
                            accepted = zones.Contains(ticket.Zone);
                        }

                        if (accepted && (!string.IsNullOrEmpty(sectionFrom) || !string.IsNullOrEmpty(sectionTo)))
                        {
                            accepted = false;
                            foreach (string poss in StubHub.GetPossibleMatches(sectionFrom, sectionTo))
                            {
                                if (Regex.IsMatch(ticket.Section, "\\b" + poss + "\\b"))
                                {
                                    accepted = true;
                                    break;
                                }
                            }
                        }
                        if (accepted)
                        {
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
                        }
                        if (accepted)
                        {
                            filterSales += 1;
                            filterTickets += ticket.Qty;
                            filterTotal += ticket.Qty * ticket.Price;

                            ticket.UserId = user.Id;
                            ticket.QuickId = quickSearch.Id;
                            ticket.IsNew = true;
                            _quickSearchService.InsertQuickTicketItem(ticket);
                        }

                    }
                    if (filterTickets == 0)
                    {
                        quickSearch.NewFilterAvgPrice = 0;
                        quickSearch.NewFilterSales = 0;
                        quickSearch.NewFilterTickets = 0;
                    }
                    else
                    {
                        quickSearch.AllSales = quickSearch.AllSales + filterSales;
                        quickSearch.AllTickets = quickSearch.AllTickets + filterTickets;
                        quickSearch.AvgPrice = Math.Round((quicktickets.Sum(x => x.Qty * x.Price) / quickSearch.AllTickets + filterTotal / filterTickets) / 2);

                        quickSearch.NewFilterAvgPrice = Math.Round(filterTotal / filterTickets, 2);
                        quickSearch.NewFilterSales = filterSales;
                        quickSearch.NewFilterTickets = filterTickets;
                    }
                    _quickSearchService.UpdateQuickSearchItem(quickSearch);

                }
                catch(Exception ex)
                {
                    _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                }
            }
            return quickSearch;
        }

        [NonAction]
        protected QuickSearchModel PrepareQuickSearchModel(QuickSearch quickSearch)
        {
            var model = new QuickSearchModel
            {
                Id = quickSearch.Id,
                UserId = quickSearch.UserId,
                EventId = quickSearch.EventId,
                EventTitle = quickSearch.EventTitle,
                EventVenue = quickSearch.EventVenue,
                EventDate = quickSearch.EventDate,
                EventZones = quickSearch.EventZones,
                SectionFrom = quickSearch.SectionFrom,
                SectionTo = quickSearch.SectionTo,
                Zones = quickSearch.Zones,
                LastWeekSalesOnly = quickSearch.LastWeekSalesOnly,
                LastScrape = quickSearch.LastScrape,
                AllTickets = quickSearch.AllTickets,
                AllSales = quickSearch.AllSales,
                AvgPrice = quickSearch.AvgPrice,
                FilterTickets = quickSearch.FilterTickets,
                FilterSales = quickSearch.FilterSales,
                FilterAvgPrice = quickSearch.FilterAvgPrice
            };
            return model;
        }

        public HttpResponseMessage Delete(int id)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var quickSearchItem = _quickSearchService.GetQuickSearchItemById(id);
            if (quickSearchItem == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            QuickSearchModel model = new QuickSearchModel
            {
                Id = quickSearchItem.Id,
                EventId = quickSearchItem.EventId,
                EventTitle = quickSearchItem.EventTitle
            };
            try
            {
                _quickSearchService.DeleteQuickSearchItem(quickSearchItem);
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            return Request.CreateResponse(HttpStatusCode.OK, model);
        }

    }
}