using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace StubHubScraper.Services
{
    public class Constants
    {
        public static string SAVE_ERR = "Saving to database failed for object \"{0}\"!";
        public static string DELETE_ERR = "Deleting from database failed for object \"{0}\"!";
        public static string DELETE = "Deleting from database failed!";
        public static string EXPORT = "Exporting to CSV failed!";
        public static string LOAD_1 = "Loading event search lists failed!";
        public static string LOAD_2 = "Loading event search lists or events failed in automatic scraping!";
        public static string LOAD_3 = "Loading events for search list \"{0}\" failed!";
        public static string LOAD_4 = "Searching sold tickets failed!";
        public static string LOAD_5 = "Loading quick searches failed!";
        public static string LOAD_6 = "Loading tickets for quick search \"{0}\" failed!";
        public static string REQ_1 = "Security request failed!";
        public static string REQ_2 = "Request to StubHub event or saving event \"{0}\" failed!";
        public static string REQ_3 = "Unexpected error in manual scraping!";
        public static string REQ_4 = "Unexpected error in automatic scraping for search list \"{0}\"!";
        public static string REQ_5 = "Event \"{0}\" not found on StubHub!";
        public static string REQ_6 = "Unexpected error on event \"{0}\" for zone \"{1}\"!";
        public static string REQ_7 = "Unexpected error on event \"{0}\"!";
        public static string REQ_8 = "Unexpected error on scanning link \"{0}\"!";
        public static string REQ_9 = "Unexpected error on loading zones for event \"{0}\"!";
        public static string REQ_10 = "Request to StubHub or saving quick search data failed (event \"{0}\")!";

        public static string ZONE_SCRAPE_STATUS_FORMAT = "Zone \"{0}\" ({1} of {2})";

        private static string[][] TimeZones = new string[][] {
            new string[] {"ADT", "-03:00"},
            new string[] {"AST", "-04:00"},
            new string[] {"CDT", "-05:00"},
            new string[] {"CST", "-06:00"},
            new string[] {"CENTRAL", "-06:00"},
            new string[] {"EDT", "-04:00"},
            new string[] {"EST", "-05:00"},
            new string[] {"EASTERN", "-05:00"},
            new string[] {"EGT", "-01:00"},
            new string[] {"HDT", "-09:00"},
            new string[] {"HST", "-10:00"},
            new string[] {"MDT", "-06:00"},
            new string[] {"MST", "-07:00"},
            new string[] {"MOUNTAIN", "-07:00"},
            new string[] {"NDT", "-02:30"},
            new string[] {"NST", "-03:30"},
            new string[] {"PDT", "-07:00"},
            new string[] {"PST", "-08:00"},
            new string[] {"PACIFIC", "-08:00"},
            new string[] {"WGT", "-03:00"}
        };

        public static Hashtable ZoneTable;

        static Constants()
        {
            ZoneTable = new Hashtable(50);

            foreach(string[] TimeZone in TimeZones)
            {
                ZoneTable.Add(TimeZone[0], TimeZone[1]);
            }
        }
    }
}
