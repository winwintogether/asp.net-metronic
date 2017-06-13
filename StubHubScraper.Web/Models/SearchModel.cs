using System;
using System.Collections.Generic;
using StubHubScraper.Data.Domain;
using StubHubScraper.Core.Data;

namespace StubHubScraper.Web.Models
{
    public partial class SearchModel : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public string Name { get; set; }
        public DateTime Schedule { get; set; }
        public string ScheduleString { get; set; }
        public bool ScanDayBefore { get; set; }
        public bool Scanned { get; set; }
        public bool Archived { get; set; }
    }
}
