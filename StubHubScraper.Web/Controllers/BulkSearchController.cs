using System;
using System.Linq;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Threading;
using StubHubScraper.Web.Filters;
using StubHubScraper.Web.Models;

using StubHubScraper.Data.Domain;
using StubHubScraper.Services;

namespace StubHubScraper.Web.Controllers
{
    //[Authorize]
    public class BulkSearchController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ISearchManagementService _searchManagementService;
        private readonly ILogger _logger;
        public BulkSearchController(ISearchManagementService searchManagementService,
            ILogger logger,
            IAuthenticationService authenticationService)
        {
            this._authenticationService = authenticationService;
            this._searchManagementService = searchManagementService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<SearchBulk> GetSearchBulk()
        {
            var user = _authenticationService.GetAuthenticatedUser();

            return _searchManagementService.GetSearchBulk(user.Id);
        }
        [HttpGet]
        public HttpResponseMessage BulkSearch(string title,string venue)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            try
            {
               // StubHub.Login(user.UserName, user.Password);
                var records = StubHub.ScrapeForEvents(title,venue, user.ApplicationToken);
                foreach (var record in records)
                {
                    var searchBulk = new SearchBulk()
                    {
                        UserId = user.Id,
                        EventId = record.Id,
                        EventTitle = record.Title,
                        EventVenue = record.Venue,
                        EventDate = record.Date,
                        Scanned = record.Scanned
                    };
                    _searchManagementService.InsertSearchBulk(searchBulk);

                };
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
            }
            // return Request.CreateResponse(HttpStatusCode.OK);

            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }
        public HttpResponseMessage Post(int searchId,string ids)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
            var user = _authenticationService.GetAuthenticatedUser();
            try
            {
                var eventIds = ids.Split(new char[] { ',' }).ToList();
                foreach (var eventId in eventIds)
                {
                    if (String.IsNullOrEmpty(eventId))
                        continue;

                    var searchBulk = _searchManagementService.GetSearchBulk(user.Id, int.Parse(eventId));
                    var eventItem = _searchManagementService.GetEvent(int.Parse(eventId));
                    if (eventItem == null)
                    {
                        _searchManagementService.InsertEvent(new Event()
                        {
                            Id = searchBulk.EventId,
                            Title = searchBulk.EventTitle,
                            Venue = searchBulk.EventVenue,
                            Date = searchBulk.EventDate
                        });
                    }
                    _searchManagementService.InsertSearchTemp(new SearchTemp()
                    {
                        SearchId=searchId,
                        UserId=user.Id,
                        EventId = searchBulk.EventId,
                        Active=true
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
            //  return Request.CreateResponse(HttpStatusCode.OK);
            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }
        public HttpResponseMessage Delete(int id)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            try
            {
                if (id == 0)
                {
                    _searchManagementService.DeleteSearchBulk(user.Id);
                }
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            //  return Request.CreateResponse(HttpStatusCode.OK);
            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }

    }

}