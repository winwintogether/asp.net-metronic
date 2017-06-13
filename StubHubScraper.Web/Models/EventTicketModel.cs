using System;

namespace StubHubScraper.Web.Models
{
    public partial class EventModel
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Venue { get; set; }
        public string Date{ get; set; }
        public bool Scanned { get; set; }

        public int TicketsCount { get; set; }
        public int Sales { get; set; }
        public decimal AvgPrice { get; set; }
    }
    public partial class EventTicketModel
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public string EventVenue { get; set; }
        public string EventDate { get; set; }
        public string Zone { get; set; }
        public string Section { get; set; }
        public decimal Price { get; set; }
        public string Row { get; set; }
        public int Qty { get; set; }
        public string DateSold { get; set; }
    }
}
