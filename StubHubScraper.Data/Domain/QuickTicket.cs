using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class QuickTicket : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int QuickId { get; set; }
        public QuickSearch QuickSearch { get; set; }
        public string Zone { get; set; }
        public string Section { get; set; }
        public decimal Price { get; set; }
        public string Row { get; set; }
        public int Qty { get; set; }
        public DateTime DateSold { get; set; }
        public bool IsNew { get; set; }
    }
}
