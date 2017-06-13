using System.Xml.Linq;
using System.Linq;
using System.Configuration;
using System.Collections.Generic;
using System.Text.RegularExpressions;
using System.Net.Mail;
using System;
using System.IO;
using StubHubScraper.ExecuteSearch.Configuration;
using StubHubScraper.Data.Domain;
using StubHubScraper.Services;

namespace StubHubScraper.ExecuteSearch.Processor
{
    public class ExecuteSearchProcess : IExecuteSearchProcess
    {
        readonly IManualScrapingService _manualScrapingService;
        readonly ISearchManagementService _searchManagementService;
        readonly IUserService _userService;
        readonly IConfiguration _configuration;

        public ExecuteSearchProcess(IManualScrapingService manualScrapingService,
            ISearchManagementService searchManagementService,
            IUserService userService,
            IConfiguration configuration)
        {
            _manualScrapingService = manualScrapingService;
            _searchManagementService = searchManagementService;
            _userService = userService;
            _configuration = configuration;
        }

        public void Process()
        {
            var users = _userService.GetAllUsers().ToList();
            foreach (var user in users)
            {
                if (string.IsNullOrEmpty(user.ApiUserName) || string.IsNullOrEmpty(user.ApiPassword))
                    continue;
                StubHub.Login(user.ApiUserName, user.ApiPassword);
                var eventIds = _searchManagementService.GetRunOnceADayEventIds(user.Id);
                foreach (var eventId in eventIds)
                {
                    try
                    {
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
                    catch (Exception ex)
                    {
                        if (ex.InnerException.Message.Contains("401"))
                            StubHub.Login(user.ApiUserName, user.ApiPassword);
                        continue;
                    }
                }
            }
        }
    }
}
