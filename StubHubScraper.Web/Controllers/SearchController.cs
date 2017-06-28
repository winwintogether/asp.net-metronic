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
    public class SearchController : ApiController
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ISearchManagementService _searchManagementService;
        private readonly ILogger _logger;
        public SearchController(ISearchManagementService searchManagementService,
            ILogger logger,
            IAuthenticationService authenticationService)
        {
            this._authenticationService = authenticationService;
            this._searchManagementService = searchManagementService;
            this._logger = logger;
        }

        [Queryable]
        public IQueryable<SearchModel> GetSearches(int archived=0)
        {
            var user = _authenticationService.GetAuthenticatedUser();

            return _searchManagementService.GetSearches(user.Id, archived == 1 ? true : false).Select(PrepareSearchModel).AsQueryable();
        }
        [NonAction]
        protected SearchModel PrepareSearchModel(Search search)
        {
            var model = new SearchModel
            {
                Id = search.Id,
                Name=search.Name,
                ScheduleString=search.Schedule.HasValue==true?search.Schedule.Value.ToString("MM/dd/yyyy hh:ss"):"",
                ScanDayBefore=search.ScanDayBefore,
                Archived=search.Archived,
                Scanned=search.Scanned,
                UserId=search.UserId
            };
            return model;
        }
        public HttpResponseMessage Put(int id, Search model,int archived=0)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
            var user = _authenticationService.GetAuthenticatedUser();
            if (model != null)
            {
                try
                {
                    model.UserId = user.Id;
                    if (id == 0)
                    {
                        _searchManagementService.InsertSearch(model);
                        var temps = _searchManagementService.GetSearchTemps(user.Id, id, false).ToList();
                        foreach (var temp in temps)
                        {
                            _searchManagementService.InsertSearchEvent(
                                new SearchEvent
                                {
                                    SearchId = model.Id,
                                    EventId = temp.EventId,
                                    Active = temp.Active
                                });
                        }
                    }
                    else
                    {
                        var search = _searchManagementService.GetSearch(id);
                        search.Name = model.Name;
                        search.Schedule = model.Schedule;
                        search.ScanDayBefore = model.ScanDayBefore;
                        _searchManagementService.UpdateSearch(search);
                        var sTemps = _searchManagementService.GetSearchTemps(user.Id, id, false).ToList();
                        var sEvents = _searchManagementService.GetSearchEvents(id);
                        _searchManagementService.DeleteSearchEvent(id);
                        foreach (var temp in sTemps)
                        {
                            _searchManagementService.InsertSearchEvent(
                                 new SearchEvent
                                 {
                                     SearchId = id,
                                     EventId = temp.EventId,
                                     Active = temp.Active
                                 });
                        }

                    }

                }
                catch (Exception ex)
                {
                    _logger.InsertLog(new Log { UserId = user.Id, LogLevelId = 40, Message = ex.Message, CreatedOnUtc = DateTime.Now });
                    return Request.CreateResponse(HttpStatusCode.InternalServerError);
                }
            }
            else
            {
                var search = _searchManagementService.GetSearch(id);
                search.Archived = archived == 1 ? true : false;
                _searchManagementService.UpdateSearch(search);
            }
            // return Request.CreateResponse(HttpStatusCode.OK);
            var responsemodel = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, responsemodel);
            return response;
        }
        public HttpResponseMessage Post(Search model)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }
            var user = _authenticationService.GetAuthenticatedUser();
            try
            {
                model.UserId = user.Id;
                var searchId = model.Id;
                _searchManagementService.InsertSearch(model);
                var temps = _searchManagementService.GetSearchTemps(user.Id, searchId,false).ToList();
                foreach (var temp in temps)
                {
                    _searchManagementService.InsertSearchEvent(
                        new SearchEvent
                        {
                            SearchId = model.Id,
                            EventId = temp.EventId,
                            Active = temp.Active
                        });
                }
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
            var search = _searchManagementService.GetSearch(id);
            if (search == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            SearchModel model = new SearchModel
            {
                Id = search.Id
            };
            try
            {
                var sEvents = _searchManagementService.GetSearchEvents(id).ToList();
                foreach (var sEvent in sEvents)
                {
                    _searchManagementService.DeleteSearchEvent(sEvent);
                }
                _searchManagementService.DeleteSearch(search);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            return Request.CreateResponse(HttpStatusCode.OK, model);
        }

    }

}