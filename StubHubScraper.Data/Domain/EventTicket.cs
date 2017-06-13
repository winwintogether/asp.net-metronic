using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class EventTicket : BaseEntity
    {
        public int UserId { get; set; }
        public User User { get; set; }
        public int EventId { get; set; }
        public Event Event { get; set; }
        public string Zone { get; set; }
        public string Section { get; set; }
        public decimal Price { get; set; }
        public string Row { get; set; }
        public int Qty { get; set; }
        public DateTime DateSold { get; set; }
    }
}
