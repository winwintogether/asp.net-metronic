using System;
using System.Data.Entity.ModelConfiguration;
using System.ComponentModel.DataAnnotations.Schema;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class SearchBulkMap : EntityTypeConfiguration<SearchBulk>
    {
        public SearchBulkMap()
        {
            this.ToTable("SearchBulk");

            this.HasKey(x => x.Id);
        }
    }
}
