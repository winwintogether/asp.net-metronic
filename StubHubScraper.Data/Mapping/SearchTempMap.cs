using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class SearchTempMap : EntityTypeConfiguration<SearchTemp>
    {
        public SearchTempMap()
        {
            this.ToTable("SearchTemp");
            this.HasKey(x => x.Id);
            this.HasRequired(x => x.Event)
                .WithMany(x=>x.SearchTemps)
                .HasForeignKey(x => x.EventId);
            this.HasRequired(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);
        }
    }
}
