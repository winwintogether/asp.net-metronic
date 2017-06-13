using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class QuickSearchMap : EntityTypeConfiguration<QuickSearch>
    {
        public QuickSearchMap()
        {
            this.ToTable("QuickSearches");

            this.HasKey(x => x.Id);
            this.HasRequired(x => x.User)
                .WithMany()
                .HasForeignKey(x => x.UserId);
        }
    }
}
