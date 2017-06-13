using StubHubScraper.Data.Domain;
using System.Collections.Generic;
using System.Linq;
using System;

namespace StubHubScraper.Services
{
    public partial interface IQuickSearchService
    {
        IQueryable<QuickSearch> GetQuickSearches(int userId);
        QuickSearch GetQuickSearchItemById(int id);
        void InsertQuickSearchItem(QuickSearch quickSearchItem);
        void DeleteQuickSearchItem(QuickSearch quickSearchItem);
        IQueryable<QuickTicket> GetQuickTickets(int quickId, int isSave = 1,int isNew=0);
        void InsertQuickTicketItem(QuickTicket quickTicketItem);
        QuickSearch GetQuickSearch(int eventId);
        void UpdateQuickSearchItem(QuickSearch quickSearchItem);
        void DeleteQuickTickets(int quickId);
        void GetTicketsChartData(int userId, int quickId, DateTime date, out decimal average, out int sales);
    }
}
