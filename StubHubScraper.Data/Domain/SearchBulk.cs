using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class SearchBulk : BaseEntity
    {
        public int UserId { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string EventVenue { get; set; }
        public DateTime? EventDate { get; set; }
        public bool Scanned { get; set; }
    }
}
