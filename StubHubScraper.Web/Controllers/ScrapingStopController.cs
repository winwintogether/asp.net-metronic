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
    public class ScrapingStopController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly IUserService _userService;
        public ScrapingStopController(IAuthenticationService authenticationService,
            IUserService userService)
        {
            this._authenticationService = authenticationService;
            this._userService = userService;
        }

        [HttpGet]
        public HttpResponseMessage ScrapingStop()
        {
            var user = _authenticationService.GetAuthenticatedUser();
            user.IsScrapingStop = true;
            _userService.UpdateUser(user);
            // return Request.CreateResponse(HttpStatusCode.OK);
            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }
    }

}