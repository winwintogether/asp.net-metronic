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
    public class EventsChartController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IManualScrapingService _manualScrapingService;
        private readonly ILogger _logger;
        public EventsChartController(
            IAuthenticationService authenticationService,
            ILogger logger,
            IManualScrapingService manualScrapingService)
        {
            this._authenticationService = authenticationService;
            this._manualScrapingService = manualScrapingService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<ChartModel> GetEvents(int searchId,int eventId,string title,string venue,
            string startDate,string endDate,string zone,string sectionForm,string sectionTo,
            int LastWeekSalesOnly, int HidePastEvents, int ShowArchivedSearches)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var charts = new List<ChartModel>();
            DateTime sDate = DateTime.Now.AddDays(-10);
            var max = 0.0M;
            try
            {
                var soldTickets = _manualScrapingService.SearchTickets(user.Id, searchId, eventId, title, venue, startDate, endDate, zone, sectionForm, sectionTo,
                    LastWeekSalesOnly, HidePastEvents, ShowArchivedSearches);
                var dateList = soldTickets.Where(x => x.DateSold > sDate).Select(x => x.DateSold.Date).Distinct().OrderBy(x => x.Date).ToList();

                foreach (var date in dateList)
                {
                    var before = date.AddDays(-1);
                    var after = date.AddDays(1);
                    var tickets = soldTickets.Where(x => x.DateSold > before & x.DateSold < after);
                    decimal average = 0; int sales = 0;
                    average = Math.Round(tickets.Sum(x => x.Qty * x.Price) / tickets.Sum(x => x.Qty), 2);
                    sales = tickets.Count();
                    if (max < average) max = average;
                    charts.Add(new ChartModel { average = average, volume = sales, date = date.ToString("M/d") });
                }
                if (charts.Count > 0)
                {
                    max = Math.Ceiling(max / 10) * 10;
                    var c = charts.FirstOrDefault();
                    c.max = max;
                }
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
            }
            return charts.AsQueryable();
        }

    }

}