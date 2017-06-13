using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class SearchTemp : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int SearchId { get; set; }
        public int EventId { get; set; }
        public Event Event { get; set; }
        public bool Active { get; set; }
    }
}
