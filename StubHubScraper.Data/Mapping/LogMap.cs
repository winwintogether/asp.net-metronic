using System;
using System.Data.Entity.ModelConfiguration;
using System.ComponentModel.DataAnnotations.Schema;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class LogMap : EntityTypeConfiguration<Log>
    {
        public LogMap()
        {
            this.ToTable("Log");
            this.HasKey(x => x.Id);
        }
    }
}
