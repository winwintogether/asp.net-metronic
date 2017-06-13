using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class SearchEventMap : EntityTypeConfiguration<SearchEvent>
    {
        public SearchEventMap()
        {
            this.ToTable("SearchEvents");
            this.HasKey(x => x.Id);

            this.HasRequired(x => x.Event)
                .WithMany()
                .HasForeignKey(x => x.EventId);

            this.HasRequired(x => x.Search)
                .WithMany()
                .HasForeignKey(x => x.SearchId);
        }
    }
}
