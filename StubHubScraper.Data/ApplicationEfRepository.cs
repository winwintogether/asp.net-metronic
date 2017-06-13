using System;

using StubHubScraper.Core.Data;
using StubHubScraper.Data;

namespace StubHubScraper.Data
{
    public partial class ApplicationEfRepository<T> : EfRepository<T>, IApplicationRepository<T> where T : BaseEntity
    {
        /// <summary>
        /// Ctor
        /// </summary>
        /// <param name="context">Object context</param>
        public ApplicationEfRepository(IApplicationDbContext context)
            : base(context)
        {
        }
    }
}