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
    public class AppLogController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ILogger _logger;
        public AppLogController(ILogger logger,
            IAuthenticationService authenticationService)
        {
            this._authenticationService = authenticationService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<Log> GetAppLogs()
        {
            var user = _authenticationService.GetAuthenticatedUser();

            return _logger.GetLogs(user.Id);
        }

    }

}