using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class Event : BaseEntity
    {
        private ICollection<SearchTemp> _searchTemps;
        public string Title { get; set; }
        public string Venue { get; set; }
        public DateTime? Date { get; set; }
        public bool Scanned { get; set; }
        public virtual ICollection<SearchTemp> SearchTemps
        {
            get { return _searchTemps ?? (_searchTemps = new List<SearchTemp>()); }
            protected set { _searchTemps = value; }
        }

        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public int VenueId { get; set; }
        [System.ComponentModel.DataAnnotations.Schema.NotMapped]
        public int VenueConfigId { get; set; }
    }
}
