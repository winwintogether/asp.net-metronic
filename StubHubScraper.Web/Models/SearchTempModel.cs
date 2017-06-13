using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Web.Models
{
    public partial class SearchTempModel : BaseEntity
    {
        public int SearchId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string EventVenue { get; set; }
        public string EventDate { get; set; }
        public bool Active { get; set; }
    }
}
