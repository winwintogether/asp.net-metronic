using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class Search : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public string Name { get; set; }
        public DateTime? Schedule { get; set; }
        public bool ScanDayBefore { get; set; }
        public bool Scanned { get; set; }
        public bool Archived { get; set; }
    }
}
