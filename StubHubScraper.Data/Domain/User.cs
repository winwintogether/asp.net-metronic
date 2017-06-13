using System;
using System.Collections.Generic;

using StubHubScraper.Core.Data;

namespace StubHubScraper.Data.Domain
{
    public partial class User : BaseEntity
    {
        public string UserName { get; set; }

        public string Password { get; set; }

        public string ApiUserName { get; set; }

        public string ApiPassword { get; set; }

        public bool IsAdmin { get; set; }

        public string Environment { get; set; }

        public string ConsumerKey { get; set; }

        public string ConsumerSecret { get; set; }

        public string ApplicationToken { get; set; }

        public bool IsScrapingStop { get; set; }

    }
}
