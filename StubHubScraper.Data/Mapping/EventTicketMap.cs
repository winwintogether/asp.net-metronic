using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class EventTicketMap : EntityTypeConfiguration<EventTicket>
    {
        public EventTicketMap()
        {
            this.ToTable("EventTickets");

            this.HasKey(x => x.Id);

            this.HasRequired(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);

            this.HasRequired(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId);
        }
    }
}
