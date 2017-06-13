using System;
using System.Data.Entity.ModelConfiguration;
using System.ComponentModel.DataAnnotations.Schema;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class EventMap : EntityTypeConfiguration<Event>
    {
        public EventMap()
        {
            this.ToTable("Events");

            this.HasKey(x => x.Id)
            .Property(x => x.Id).HasDatabaseGeneratedOption(DatabaseGeneratedOption.None);
        }
    }
}
