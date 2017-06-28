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
    public class SearchEventController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ISearchManagementService _searchManagementService;
        private readonly ILogger _logger;
        public SearchEventController(ISearchManagementService searchManagementService,
            ILogger logger,
            IAuthenticationService authenticationService)
        {
            this._authenticationService = authenticationService;
            this._searchManagementService = searchManagementService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<SearchTempModel> GetSearchTemps(int searchId=0,int sync=1)
        {
            var user = _authenticationService.GetAuthenticatedUser();

            return _searchManagementService.GetSearchTemps(user.Id, searchId, sync == 1 ? true : false).Select(PrepareSearchTempModel).AsQueryable();
        }
        [NonAction]
        protected SearchTempModel PrepareSearchTempModel(SearchTemp sTemp )
        {
            var eventItem = _searchManagementService.GetEvent(sTemp.EventId);
            var model = new SearchTempModel
            {
                Id = sTemp.Id,
                EventId = sTemp.EventId,
                EventTitle = eventItem.Title,
                EventVenue = eventItem.Venue,
                EventDate = eventItem.Date.HasValue == true ? sTemp.Event.Date.Value.ToString("MM/dd/yyyy") : "",
                Active = sTemp.Active
            };
            return model;
        }

        public HttpResponseMessage Post(SearchTempModel model)
        {
            var user = _authenticationService.GetAuthenticatedUser();
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
            try
            {
                var eventItem = new Event() { Id = model.EventId };
                StubHub.Login(user.ApiUserName, user.ApiPassword);
                var exist = StubHub.ScrapeEventMainInfo(eventItem, user.ApplicationToken);
                if (!exist)
                    return Request.CreateErrorResponse(HttpStatusCode.NotFound, ModelState);
                var ei = _searchManagementService.GetEvent(model.EventId);
                if (ei != null)
                {
                    ei.Title = eventItem.Title;
                    ei.Venue = eventItem.Venue;
                    ei.Date = eventItem.Date;
                    ei.Scanned = eventItem.Scanned;
                    _searchManagementService.UpdateEvent(ei);
                }
                else
                    _searchManagementService.InsertEvent(eventItem);

                var sTemp = _searchManagementService.GetSearchTemps(user.Id, model.SearchId, eventItem.Id);

                if (sTemp.Count() > 0)
                {
                    HttpResponseMessage response1 = Request.CreateResponse(HttpStatusCode.Created, model);
                    response1.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = model.Id }));
                    return response1;
                }
                SearchTemp searchTemp = new SearchTemp
                {
                    SearchId = model.SearchId,
                    UserId = user.Id,
                    EventId = eventItem.Id,
                    Active = true
                };
                _searchManagementService.InsertSearchTemp(searchTemp);

                model.Id = searchTemp.Id;
            }
            catch (Exception ex)
            {
                _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, model);
            response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = model.Id }));
            return response;
        }


        public HttpResponseMessage Delete(int id)
        {
            if (id > 0)
            {
                var searchTemp = _searchManagementService.GetSearchTemp(id);
                if (searchTemp == null)
                {
                    return Request.CreateResponse(HttpStatusCode.NotFound);
                }
                try
                {
                    _searchManagementService.DeleteSearchTemp(searchTemp);
                }
                catch (DbUpdateConcurrencyException)
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError);
                }
            }
            else
            {
                try
                {
                    var user = _authenticationService.GetAuthenticatedUser();
                    _searchManagementService.DeleteSearchTemp(user.Id);
                }
                catch
                {
                    return Request.CreateResponse(HttpStatusCode.InternalServerError);
                }
            }

            //  return Request.CreateResponse(HttpStatusCode.OK);
            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
        }

    }

}