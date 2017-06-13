using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Web.Models
{
    public partial class LookupTicketModel 
    {
        public int SearchId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string EventVenue { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Zone { get; set; }
        public string SectionForm { get; set; }
        public string SectionTo { get; set; }
        public bool LastWeekSalesOnly { get; set; }
        public bool HidePastEvents { get; set; }
        public bool ShowArchivedSearches { get; set; }
    }
}
