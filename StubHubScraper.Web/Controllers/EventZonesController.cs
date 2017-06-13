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
    public class EventZonesController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ILogger _logger;
        public EventZonesController(IAuthenticationService authenticationService,ILogger logger)
        {
            this._authenticationService = authenticationService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<MultiSelectModel> GetEventZones(int eventId)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            var zones = new List<MultiSelectModel>();
            try
            {
                StubHub.Login(user.ApiUserName, user.ApiPassword);
                var records = StubHub.GetEventZones(eventId, user.ApplicationToken);
                foreach (var record in records)
                {
                    zones.Add(new MultiSelectModel { value = record, text = record });
                }
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
            }
            return zones.AsQueryable();
        }

    }
}