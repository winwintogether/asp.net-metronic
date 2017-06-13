using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

using StubHubScraper.Core;
using StubHubScraper.Core.Data;
using StubHubScraper.Data;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial class QuickSearchService : IQuickSearchService
    {
        private readonly IApplicationRepository<QuickSearch> _quickSearchRepository;
        private readonly IApplicationRepository<QuickTicket> _quickTicketRepository;
        public QuickSearchService(IApplicationRepository<QuickSearch> quickSearchRepository,
            IApplicationRepository<QuickTicket> quickTicketRepository)
        {
            this._quickSearchRepository = quickSearchRepository;
            this._quickTicketRepository = quickTicketRepository;
        }


        public IQueryable<QuickSearch> GetQuickSearches(int userId)
        {
            var quickSearches = _quickSearchRepository.Table.Where(x => x.UserId == userId && (x.Deleted.HasValue == false || x.Deleted.Value == false));
            return quickSearches;
        }

        public virtual QuickSearch GetQuickSearchItemById(int id)
        {
            return _quickSearchRepository.GetById(id);
        }
        public virtual QuickSearch GetQuickSearch(int eventId)
        {
            return _quickSearchRepository.Table.FirstOrDefault(x => x.EventId == eventId);
        }
        public void InsertQuickSearchItem(QuickSearch quickSearchItem)
        {
            _quickSearchRepository.Insert(quickSearchItem);
        }
        public void UpdateQuickSearchItem(QuickSearch quickSearchItem)
        {
            _quickSearchRepository.Update(quickSearchItem);
        }

        public void DeleteQuickSearchItem(QuickSearch quickSearchItem)
        {
            var tickets = _quickTicketRepository.Table.Where(x => x.QuickId == quickSearchItem.Id).ToList();
            foreach (var ticket in tickets)
            {
                _quickTicketRepository.Delete(ticket);
            }
            _quickSearchRepository.Delete(quickSearchItem);
        }

        public IQueryable<QuickTicket> GetQuickTickets(int quickId,int isSave=1,int isNew=0)
        {
            if (isSave == 1)
            {
                if (isNew == 0)
                {
                    var quickTickets = _quickTicketRepository.Table.Where(x => x.QuickId == quickId);
                    return quickTickets;
                }
                else
                {
                    var quickTickets = _quickTicketRepository.Table.Where(x => x.QuickId == quickId & x.IsNew == true).ToList();
                    foreach (var ticket in quickTickets)
                    {
                        ticket.IsNew = false;
                        _quickTicketRepository.Update(ticket);
                    }
                    return quickTickets.AsQueryable();
                }
            }
            else
            {
                var quickTickets = _quickTicketRepository.Table.Where(x => x.QuickId == quickId).ToList();
                DeleteQuickTickets(quickId);
                return quickTickets.AsQueryable();
            }
        }

        public void InsertQuickTicketItem(QuickTicket quickTicketItem)
        {
            _quickTicketRepository.Insert(quickTicketItem);
        }
        public void DeleteQuickTickets(int quickId)
        {
            var tickets = _quickTicketRepository.Table.Where(x => x.QuickId == quickId).ToList();
            foreach (var ticket in tickets)
            {
                _quickTicketRepository.Delete(ticket);
            }
        }
        public void GetTicketsChartData(int userId,int quickId,DateTime date,out decimal average,out int sales)
        {
            var before = date.AddDays(-1);
            var after = date.AddDays(1);
            var tickets = _quickTicketRepository.Table.Where(x => x.UserId == userId & x.QuickId == quickId & x.DateSold > before & x.DateSold < after).ToList();
            if (tickets.Count > 0)
            {
                average = Math.Round(tickets.Sum(x => x.Qty * x.Price) / tickets.Sum(x => x.Qty), 2);
                sales = tickets.Count();
            }
            else
            {
                average = 0;
                sales = 0;
            }
        }

    }
}
