using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Web.Models
{
    public partial class QuickSearchModel : BaseEntity
    {
        public string Name
        {
            get
            {
                if (this.Id == 0) return "";
                return string.Format("{0} - {1} ({2})", this.Id, this.EventTitle, this.EventId);
            }
        }
        public int UserId { get; set; }
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
    }
}
