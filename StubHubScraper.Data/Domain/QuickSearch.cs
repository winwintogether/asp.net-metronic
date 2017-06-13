using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class QuickSearch : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string EventVenue { get; set; }
        public DateTime EventDate { get; set; }
        public string EventZones { get; set; }
        public string SectionFrom { get; set; }
        public string SectionTo { get; set; }
        public string Zones { get; set; }
        public bool LastWeekSalesOnly { get; set; }
        public DateTime LastScrape { get; set; }
        public int AllTickets { get; set; }
        public int AllSales { get; set; }
        public decimal AvgPrice { get; set; }
        public int FilterTickets { get; set; }
        public int FilterSales { get; set; }
        public decimal FilterAvgPrice { get; set; }
        public int? NewFilterTickets { get; set; }
        public int? NewFilterSales { get; set; }
        public decimal? NewFilterAvgPrice { get; set; }
        public bool? Deleted { get; set; }
    }
}
