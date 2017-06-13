using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class SearchMap : EntityTypeConfiguration<Search>
    {
        public SearchMap()
        {
            this.ToTable("Searches");

            this.HasKey(x => x.Id);
            this.HasRequired(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);
        }
    }
}
