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
    public class QuickTicketsController : ApiController
    {
        private readonly IQuickSearchService _quickSearchService;

        public QuickTicketsController(IQuickSearchService quickSearchService)
        {
            this._quickSearchService = quickSearchService;
        }

        [Queryable]
        public IQueryable<QuickTicket> GetQuickSearches(int quickId,int isSave=1,int isNew=0)
        {
            return _quickSearchService.GetQuickTickets(quickId,isSave,isNew);
        }

    }
}