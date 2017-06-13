using System;
using System.Data.Entity.ModelConfiguration;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Data.Mapping
{
    public partial class UserMap : EntityTypeConfiguration<User>
    {
        public UserMap()
        {
            this.ToTable("Users");

            this.HasKey(x => x.Id);

            this.Property(x => x.UserName).HasMaxLength(128);
            this.Property(x => x.Password).HasMaxLength(128);
            this.Property(x => x.IsAdmin);
            this.Property(x => x.Environment).HasMaxLength(128);
            this.Property(x => x.ConsumerKey).HasMaxLength(256);
            this.Property(x => x.ConsumerSecret).HasMaxLength(256);
            this.Property(x => x.ApplicationToken).HasMaxLength(256);
        }
    }
}
