using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class QuickTicketMap : EntityTypeConfiguration<QuickTicket>
    {
        public QuickTicketMap()
        {
            this.ToTable("QuickTickets");

            this.HasKey(x => x.Id);

            this.HasRequired(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);

            this.HasRequired(x => x.QuickSearch)
                .WithMany()
                .HasForeignKey(x => x.QuickId);
        }
    }
}
