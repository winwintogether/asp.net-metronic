using System;
using System.Collections.Generic;
using System.Linq;

using StubHubScraper.Core.Data;
using StubHubScraper.Data;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial class DefaultLogger : ILogger
    {
        private readonly IApplicationRepository<Log> _logRepository;
        private readonly IDbContext _dbContext;
        public DefaultLogger(IApplicationRepository<Log> logRepository, IApplicationDbContext dbContext)
        {
            this._logRepository = logRepository;
            this._dbContext = dbContext;
        }

        /// <summary>
        /// Determines whether a log level is enabled
        /// </summary>
        /// <param name="level">Log level</param>
        /// <returns>Result</returns>
        public virtual bool IsEnabled(LogLevel level)
        {
            switch (level)
            {
                case LogLevel.Debug:
                    return true;
                default:
                    return true;
            }
        }

        /// <summary>
        /// Deletes a log item
        /// </summary>
        /// <param name="log">Log item</param>
        public virtual void DeleteLog(Log log)
        {
            if (log == null)
                throw new ArgumentNullException("log");

            _logRepository.Delete(log);
        }

        /// <summary>
        /// Clears a log
        /// </summary>
        public virtual void ClearLog()
        {
            var log = _logRepository.Table.ToList();
            foreach (var logItem in log)
                _logRepository.Delete(logItem);
        }

        /// <summary>
        /// Gets all log items
        /// </summary>
        public virtual IQueryable<Log> GetAllLogs(DateTime? fromUtc, DateTime? toUtc,
            string message, LogLevel? logLevel, int? userId)
        {
            var query = _logRepository.Table;
            if (fromUtc.HasValue)
                query = query.Where(l => fromUtc.Value <= l.CreatedOnUtc);
            if (toUtc.HasValue)
                query = query.Where(l => toUtc.Value >= l.CreatedOnUtc);
            if (logLevel.HasValue)
            {
                int logLevelId = (int)logLevel.Value;
                query = query.Where(l => logLevelId == l.LogLevelId);
            }
            if (!String.IsNullOrEmpty(message))
                query = query.Where(l => l.Message.Contains(message));
            if (userId.HasValue)
                query = query.Where(l => l.UserId == userId);

            query = query.OrderByDescending(l => l.CreatedOnUtc);
           
            return query;
        }

        /// <summary>
        /// Gets a log item
        /// </summary>
        /// <param name="logId">Log item identifier</param>
        /// <returns>Log item</returns>
        public virtual Log GetLogById(int logId)
        {
            if (logId == 0)
                return null;

            return _logRepository.GetById(logId);
        }

        /// <summary>
        /// Get log items by identifiers
        /// </summary>
        /// <param name="logIds">Log item identifiers</param>
        /// <returns>Log items</returns>
        public virtual IList<Log> GetLogByIds(int[] logIds)
        {
            if (logIds == null || logIds.Length == 0)
                return new List<Log>();

            var query = from l in _logRepository.Table
                        where logIds.Contains(l.Id)
                        select l;
            var logItems = query.ToList();
            //sort by passed identifiers
            var sortedLogItems = new List<Log>();
            foreach (int id in logIds)
            {
                var log = logItems.Find(x => x.Id == id);
                if (log != null)
                    sortedLogItems.Add(log);
            }
            return sortedLogItems;
        }

        /// <summary>
        /// Inserts a log item
        /// </summary>
        public virtual Log InsertLog(Log log)
        {
            _logRepository.Insert(log);

            return log;
        }

        public virtual IQueryable<Log> GetLogs(int userId)
        {
            var query = _logRepository.Table;
            query = query.Where(x => x.UserId == userId);
            query = query.OrderByDescending(x => x.CreatedOnUtc);
            return query;
        }

        public virtual IList<Log> GetDebugs(int userId)
        {
            var query = _logRepository.Table;
            query = query.Where(x => x.UserId == userId );
            query = query.Where(x => x.LogLevelId == 10);
            query = query.OrderByDescending(x => x.CreatedOnUtc).Take(15);
            return query.ToList();
        }

        public void DeleteDebugs(int userId)
        {
            this._dbContext.ExecuteSqlCommand(string.Format("DELETE FROM dbo.Log WHERE UserId = {0} AND LogLevelId = 10", userId.ToString()));
            //this._dbContext.ExecuteSqlCommand(string.Format("UPDATE dbo.Log SET IsDeleted=1 WHERE UserId = {0} AND LogLevelId = 10", userId.ToString()));

        }
    }
}
