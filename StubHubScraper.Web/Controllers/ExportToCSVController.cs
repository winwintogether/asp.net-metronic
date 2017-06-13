using System;
using System.Linq;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Net.Http;
using System.IO;
using System.Web.Http;
using System.Web.Mvc;
using StubHubScraper.Web.Filters;
using StubHubScraper.Web.Models;

using StubHubScraper.Data.Domain;
using StubHubScraper.Services;

namespace StubHubScraper.Web.Controllers
{
    //[Authorize]
    public class ExportToCSVController : Controller
    {
        private readonly IQuickSearchService _quickSearchService;
        private readonly IManualScrapingService _manualScrapingService;
        private readonly ISearchManagementService _searchManagementService;
        private readonly IAuthenticationService _authenticationService;
        public ExportToCSVController(IQuickSearchService quickSearchService,
            IManualScrapingService manualScrapingService,
            ISearchManagementService searchManagementService,
            IAuthenticationService authenticationService)
        {
            this._quickSearchService = quickSearchService;
            this._manualScrapingService = manualScrapingService;
            this._authenticationService = authenticationService;
            this._searchManagementService = searchManagementService;
        }

        public FileResult QuickSearchToCSV(int eventId,int isNew)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var tickets = new List<QuickTicket>();
            var quickSearch = new QuickSearch();
            if (isNew == 1)
            {
                Event eventItem = new Event() { Id = eventId };
                var exists = StubHub.ScrapeEventMainInfo(eventItem, user.ApplicationToken);
                if (exists)
                {
                    tickets = StubHub.ScrapeEventSoldTickets(eventItem, user.ApplicationToken);
                    quickSearch.EventId = eventItem.Id;
                    quickSearch.EventTitle = eventItem.Title;
                    quickSearch.EventVenue = eventItem.Venue;
                    if (eventItem.Date.HasValue)
                        quickSearch.EventDate = eventItem.Date.Value;
                    else
                        quickSearch.EventDate = new DateTime(2000, 1, 1);
                }
            }
            else
            {
                quickSearch = _quickSearchService.GetQuickSearch(eventId);
                if (quickSearch != null)
                    tickets = _quickSearchService.GetQuickTickets(quickSearch.Id).ToList();
            }
            
            MemoryStream output = new MemoryStream();
            StreamWriter writer = new StreamWriter(output, System.Text.Encoding.UTF8);
            writer.WriteLine("Event,Venue,Event date,Zone,Section,Price,Row,Qty,Date sold");

            foreach (var ticket in tickets)
            {
                writer.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8}",
                    EscapeValueForCSV(quickSearch.EventTitle), EscapeValueForCSV(quickSearch.EventVenue),
                    quickSearch.EventDate,
                    EscapeValueForCSV(ticket.Zone), EscapeValueForCSV(ticket.Section),
                    EscapeValueForCSV(ticket.Price.ToString()), EscapeValueForCSV(ticket.Row), ticket.Qty,
                    ticket.DateSold.ToString("MM/dd/yy")));
            }
            writer.Flush();
            output.Position = 0;
            var csvFileName = string.Format("csvFile {0}.csv", DateTime.Now.ToShortDateString());
            return File(output, "text/comma-separated-values", csvFileName);
        }
        public FileResult ScrapingEventsToCSV(string ids)
        {
            var user=_authenticationService.GetAuthenticatedUser();
            var eventIds = ids.Split(new char[] { ',' }).ToList();
            MemoryStream output = new MemoryStream();
            StreamWriter writer = new StreamWriter(output, System.Text.Encoding.UTF8);
            writer.WriteLine("Event,Venue,Event date,Zone,Section,Price,Row,Qty,Date sold");
            foreach (var eventId in eventIds)
            {
                var tickets = _manualScrapingService.GetEventTickets(user.Id, int.Parse(eventId));
                var e = _searchManagementService.GetEvent(int.Parse(eventId));
                foreach (var ticket in tickets)
                {
                    writer.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8}",
                        EscapeValueForCSV(e.Title), EscapeValueForCSV(e.Venue),
                        e.Date,
                        EscapeValueForCSV(ticket.Zone), EscapeValueForCSV(ticket.Section),
                        EscapeValueForCSV(ticket.Price.ToString()), EscapeValueForCSV(ticket.Row), ticket.Qty,
                        ticket.DateSold.ToString("MM/dd/yy")));
                }

            }
            writer.Flush();
            output.Position = 0;
            var csvFileName = string.Format("csvFile {0}.csv", DateTime.Now.ToShortDateString());
            return File(output, "text/comma-separated-values", csvFileName);
        }
        public FileResult ScrapingMultiSearchesToCSV(string ids)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var searchIds = ids.Split(new char[] { ',' }).ToList();
            var eventIds = new List<int>();
            foreach (var searchId in searchIds)
            {
                var sEvents = _searchManagementService.GetSearchEvents(int.Parse(searchId));
                foreach (var sEvent in sEvents)
                {
                    if (!eventIds.Contains(sEvent.EventId))
                        eventIds.Add(sEvent.EventId);
                }
            }
            MemoryStream output = new MemoryStream();
            StreamWriter writer = new StreamWriter(output, System.Text.Encoding.UTF8);
            writer.WriteLine("Event,Venue,Event date,Zone,Section,Price,Row,Qty,Date sold");
            foreach (var eventId in eventIds)
            {
                var tickets = _manualScrapingService.GetEventTickets(user.Id, eventId);
                var e = _searchManagementService.GetEvent(eventId);
                foreach (var ticket in tickets)
                {
                    writer.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8}",
                        EscapeValueForCSV(e.Title), EscapeValueForCSV(e.Venue),
                        e.Date,
                        EscapeValueForCSV(ticket.Zone), EscapeValueForCSV(ticket.Section),
                        EscapeValueForCSV(ticket.Price.ToString()), EscapeValueForCSV(ticket.Row), ticket.Qty,
                        ticket.DateSold.ToString("MM/dd/yy")));
                }

            }
            writer.Flush();
            output.Position = 0;
            var csvFileName = string.Format("csvFile {0}.csv", DateTime.Now.ToShortDateString());
            return File(output, "text/comma-separated-values", csvFileName);
        }
        public FileResult LookupTicketsToCSV(string ids)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var eventIds = ids.Split(new char[] { ',' }).ToList();
            MemoryStream output = new MemoryStream();
            StreamWriter writer = new StreamWriter(output, System.Text.Encoding.UTF8);
            writer.WriteLine("Event,Venue,Event date,Zone,Section,Price,Row,Qty,Date sold");
            foreach (var eventId in eventIds)
            {
                if (eventId == "")
                    continue;
                var tickets = _manualScrapingService.GetEventTickets(user.Id, int.Parse(eventId));
                var e = _searchManagementService.GetEvent(int.Parse(eventId));
                foreach (var ticket in tickets)
                {
                    writer.WriteLine(string.Format("{0},{1},{2},{3},{4},{5},{6},{7},{8}",
                        EscapeValueForCSV(e.Title), EscapeValueForCSV(e.Venue),
                        e.Date,
                        EscapeValueForCSV(ticket.Zone), EscapeValueForCSV(ticket.Section),
                        EscapeValueForCSV(ticket.Price.ToString()), EscapeValueForCSV(ticket.Row), ticket.Qty,
                        ticket.DateSold.ToString("MM/dd/yy")));
                }

            }
            writer.Flush();
            output.Position = 0;
            var csvFileName = string.Format("csvFile {0}.csv", DateTime.Now.ToShortDateString());
            return File(output, "text/comma-separated-values", csvFileName);
        }
        public string EscapeValueForCSV(string pValue)
        {
            string value = pValue;

            if (value.Contains('"') || value.Contains(','))
                value = string.Format("\"{0}\"", value.Replace("\"", "\"\""));

            return value;
        }
    }
}