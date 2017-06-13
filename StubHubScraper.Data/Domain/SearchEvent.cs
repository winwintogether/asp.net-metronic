using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class SearchEvent : BaseEntity
    {
        public int SearchId { get; set; }
        public Search Search { get; set; }
        public int EventId { get; set; }
        public Event Event { get; set; }
        public bool Active { get; set; }
    }
}
