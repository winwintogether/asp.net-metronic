using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class Log : BaseEntity
    {
        public int UserId { get; set; }
        public int LogLevelId { get; set; }
        public string Message { get; set; }
        public string IpAddress { get; set; }
        public DateTime CreatedOnUtc { get; set; }
    }
}
