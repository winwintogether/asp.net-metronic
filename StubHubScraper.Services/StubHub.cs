using System;
using System.Linq;
using System.Collections.Generic;
using System.Text;
using System.IO;
using System.Net;
using System.Web;
using System.Xml.Linq;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Configuration;
using System.Web.Script.Serialization;
using ScrapySharp;
using ScrapySharp.Network;
using ScrapySharp.Extensions;
using StubHubScraper.Data.Domain;
using RestSharp;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace StubHubScraper.Services
{
    public class StubHub
    {
        private static CookieContainer cookieContainer = new CookieContainer();
        private static ScrapingBrowser browser = new ScrapingBrowser();
        private static WebProxy proxy = null;
        private static WebPage webPage;

        static StubHub()
        {
            browser.UserAgent = new FakeUserAgent("MSIE", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; InfoPath.1; .NET CLR 1.1.4322)");
            browser.Timeout = TimeSpan.FromMinutes(2);
            browser.KeepAlive = true;
            //browser.UseDefaultCookiesParser = true;
            browser.IgnoreCookies = true;
            browser.AllowAutoRedirect = true;

            proxy = new WebProxy("209.145.32.88", 8090);
            proxy.Credentials = new NetworkCredential() { UserName = "TAUser", Password = "Barbuceanu#1" };
            //proxy.UseDefaultCredentials = false;
            browser.Proxy = proxy;
        }



        private static string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public static bool Login(string loginEmail, string password)
        {
            bool success = false;
            cookieContainer = new CookieContainer();

            if (!HasLogin())
            {
                var TMRefId = string.Empty;
                var formdata = string.Empty;
                var loginHtml = browser.NavigateTo(new Uri("https://myaccount.stubhub.com/login/Signin"), HttpVerb.Get, "");
                Match match = Regex.Match(loginHtml, @"name=.signinForm_0.><div class=.t-invisible.><input name=.t:formdata.\stype=.hidden.\svalue=.(?<formdata>.*)./></div>.*\s.*\s.*name=.TMRefId.\stype=.text.\svalue=.(?<TMRefId>.*)./></div>", RegexOptions.IgnoreCase);
                if (match.Success)
                {
                    TMRefId = match.Groups["TMRefId"].Value;
                    formdata = match.Groups["formdata"].Value;
                }
                string postData = string.Format("t%3Aformdata={0}&userCheckoutLoginFailedFlag=N&loginEmail={1}&loginPassword={2}&TMRefId={3}&rememberMe=on&signIn=signIn",
                                 HttpUtility.UrlEncode(formdata),
                                 HttpUtility.UrlEncode(loginEmail), HttpUtility.UrlEncode(password), TMRefId);

                var result = browser.NavigateTo(new Uri("https://myaccount.stubhub.com/login/signin.logincomponent_0.signinform"), HttpVerb.Post, postData);
                Match loginMatch = Regex.Match(result, @"<a href=.https://myaccount.stubhub.com/login/Signout.>Sign out</a>", RegexOptions.IgnoreCase);
                if (loginMatch.Success)
                {
                    success = true;
                }
            }
            else
                success = true;
            return success;
        }

        public static void Logout()
        {
            webPage = browser.NavigateToPage(new Uri("https://www.stubhub.com/?gSec=login&gAct=logout"));
        }

        public static bool HasLogin()
        {
            //bool hasLogin = true;
            //var result = browser.NavigateToPage(new Uri("https://www.stubhub.com/"));
            //Match match = Regex.Match(result, @"<a.*>Sign in</a>", RegexOptions.IgnoreCase);
            //if (match.Success)
            //{
            //    hasLogin = false;
            //}
            //return hasLogin;
            return false;
        }

        public static List<string> GetEventZones(int eventId, string token)
        {
            #region old code
            //List<string> results = new List<string>();
            //webPage = browser.NavigateToPage(new Uri(string.Format("https://api.stubhub.com/catalog/events/v1/{0}?getZones=true", eventId)));
            //var zones = webPage.Html.CssSelect("zones");
            //foreach (var zone in zones)
            //{
            //    results.Add(zone.ChildNodes["zoneDescription"].InnerText);
            //}
            //return results;
            #endregion

            List<string> results = new List<string>();

            RestClient restClient = new RestClient("https://api.stubhub.com");
            if (proxy != null) restClient.Proxy = proxy;

            string resource = string.Concat("search/inventory/v2/listings/?eventId=", eventId, "&start=0&rows=20&zoneStats=true",
                "&sectionStats=false&allSectionZoneStats=false&eventLevelStats=false&quantitySummary=false");
            var restReqeust = new RestRequest(resource, Method.GET);
            restReqeust.AddHeader("Authorization", string.Format("Bearer {0}", token));

            var resp = restClient.Execute<StubhubSearchInventoryResponse>(restReqeust);
            if (resp.StatusCode == HttpStatusCode.OK && resp.Data != null && resp.Data.zone_stats != null)
            {
                foreach (var zone in resp.Data.zone_stats)
                {
                    results.Add(zone.zoneName);
                }
            }

            return results;
        }

        public static bool ScrapeEventMainInfo(Event eventItem, string token)
        {
            #region old code
            //bool exists = false;
            //webPage = browser.NavigateToPage(new Uri(string.Format("https://api.stubhub.com/catalog/events/v3/{0}", eventItem.Id)));
            //var eventXML = webPage.Html.CssSelect("event").FirstOrDefault();
            //if (eventXML != null)
            //{
            //    exists = true;
            //    eventItem.Title = eventXML.ChildNodes["title"].InnerText;
            //    var eventDate = eventXML.ChildNodes["eventDateLocal"].InnerText;
            //    if (eventDate.Contains("TBD"))
            //    {
            //        eventItem.Date = null;
            //    }
            //    else
            //    {
            //        eventItem.Date = DateTime.Parse(eventDate);
            //    }
            //    eventItem.Venue = eventXML.ChildNodes["venue"].ChildNodes["name"].InnerText;
            //}
            //bool exists = false;
            //webPage = browser.NavigateToPage(new Uri(string.Format("https://api.stubhub.com/catalog/events/v3/{0}", eventItem.Id)));
            //StubhubEvent shEvent = JsonConvert.DeserializeObject<StubhubEvent>(webPage.Content);
            //if (shEvent != null)
            //{
            //    exists = true;
            //    eventItem.Title = shEvent.name;
            //    if (shEvent.eventDateLocal.Contains("TBD"))
            //    {
            //        eventItem.Date = null;
            //    }
            //    else
            //    {
            //        Match m = Regex.Match(shEvent.eventDateLocal, @"[+-]\d{2}:?\d{2}", RegexOptions.Singleline);
            //        int ind = -1;
            //        if (m.Success) ind = m.Index;
            //        if (ind < 0)
            //        {
            //            eventItem.Date = DateTime.Parse(shEvent.eventDateLocal);
            //        }
            //        else
            //        {
            //            eventItem.Date = DateTime.Parse(shEvent.eventDateLocal.Substring(0, ind));
            //        }
            //    }
            //    eventItem.Venue = shEvent.venue.name;
            //}
            //return exists;
            #endregion

            bool exists = false;

            RestClient restClient = new RestClient("https://api.stubhub.com");
            if (proxy != null) restClient.Proxy = proxy;

            string resource = string.Concat("/catalog/events/v3/", eventItem.Id);
            var restReqeust = new RestRequest(resource, Method.GET);
            restReqeust.AddHeader("Authorization", string.Format("Bearer {0}", token));

            var resp = restClient.Execute<StubhubEvent>(restReqeust);
            if (resp.StatusCode == HttpStatusCode.OK && resp.Data != null)
            {
                exists = true;

                StubhubEvent shEvent = resp.Data;
                eventItem.Title = shEvent.name;
                if (shEvent.eventDateLocal.Contains("TBD"))
                {
                    eventItem.Date = null;
                }
                else
                {
                    Match m = Regex.Match(shEvent.eventDateLocal, @"[+-]\d{2}:?\d{2}", RegexOptions.Singleline);
                    int ind = -1;
                    if (m.Success) ind = m.Index;
                    if (ind < 0)
                    {
                        eventItem.Date = DateTime.Parse(shEvent.eventDateLocal);
                    }
                    else
                    {
                        eventItem.Date = DateTime.Parse(shEvent.eventDateLocal.Substring(0, ind));
                    }
                }
                eventItem.Venue = shEvent.venue.name;
                eventItem.VenueId = shEvent.venue.id;
                eventItem.VenueConfigId = shEvent.venue.configurationId;
            }

            return exists;
        }

        /*
        public static List<QuickTicket> ScrapeEventSoldTickets(Event eventItem)
        {
            var quickTickets = new List<QuickTicket>();
            webPage = browser.NavigateToPage(new Uri(string.Format("https://pro.stubhub.com/api/events/v3/{0}/pricingOrders?start=0&sortcolumn=SOLD_DATE&sortorder=DESCENDING&stats=false&_type=xml", eventItem.Id)));
            var total = "0";
            var sales = webPage.Html.CssSelect("salesResponse").FirstOrDefault();
            if (sales.ChildNodes.Count > 0)
                total = sales.ChildNodes["total"].InnerText;
            if (total != "0")
            {
                var orders = sales.CssSelect("orders");
                var zones = GetEventZones(eventItem.Id);
                if (zones.Count > 0)
                {
                    int i = 0;
                    int n = zones.Count;
                    for (; i < n; i++)
                    {
                        try
                        {
                            foreach (var order in orders)
                            {
                                if (order.ChildNodes["section"].InnerText.Contains(zones[i]))
                                {
                                    quickTickets.Add(CreateTicketItem(eventItem, zones[i], order));
                                }
                            }
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                }
                else if (zones.Count == 0)
                {
                    try
                    {

                        foreach (var order in orders)
                        {
                            quickTickets.Add(CreateTicketItem(eventItem, "", order));
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
            }
            return quickTickets;
        }
        */

        public static List<QuickTicket> ScrapeEventSoldTickets(Event eventItem, string token)
        {
            var quickTickets = new List<QuickTicket>();
            
            //webPage = browser.NavigateToPage(new Uri(string.Format("https://pro.stubhub.com/shape/accountmanagement/sales/v1/event/{0}?sort=SALEDATE DESC&sectionId=0&priceType=listprice&filters=", eventItem.Id)));
            //var sales = JsonConvert.DeserializeObject<StubhubSalesResponse>(webPage.Content);
            //if (sales != null && sales.sales != null && sales.sales.numFound > 0)
            //{
            //    List<StubhubSale> orders = sales.sales.sale;

            List<StubhubSale> orders = DownloadAllStubhubSales(eventItem, token);
            if (orders.Count > 0)
            {
                Dictionary<string, StubhubVenueConfigMetadata> venueMetaResp = null;
                List<string> zones = GetEventZones(eventItem.Id, token);

                try
                {
                    webPage = browser.NavigateToPage(new Uri(string.Concat("https://pro.stubhub.com/shape/",
                        "catalog/venues/v2/", eventItem.VenueId, "/venueconfig/", eventItem.VenueConfigId, "/metadata")));
                    venueMetaResp = JsonConvert.DeserializeObject<Dictionary<string, StubhubVenueConfigMetadata>>(webPage.Content);
                }
                catch { }

                if (venueMetaResp != null && venueMetaResp.Count > 0)
                {
                    foreach (var order in orders)
                    {
                        StubhubVenueConfigMetadata meta = venueMetaResp.Values.FirstOrDefault(m => (m.na != null) && m.na.Equals(order.section));
                        if (meta == null)
                        {
                            string zone = zones.FirstOrDefault(z => order.section.StartsWith(z));
                            if (zone == null)
                            {
                                quickTickets.Add(CreateTicketItem(eventItem, "", order));
                            }
                            else
                            {
                                quickTickets.Add(CreateTicketItem(eventItem, zone, order));
                            }
                        }
                        else
                        {
                            quickTickets.Add(CreateTicketItem(eventItem, meta.z, order));
                        }
                    }
                }
                else
                {
                    if (zones.Count > 0)
                    {
                        foreach (var order in orders)
                        {
                            string zone = zones.FirstOrDefault(z => order.section.StartsWith(z));
                            if (zone == null)
                            {
                                quickTickets.Add(CreateTicketItem(eventItem, "", order));
                            }
                            else
                            {
                                quickTickets.Add(CreateTicketItem(eventItem, zone, order));
                            }
                        }
                    }
                    else if (zones.Count == 0)
                    {
                        foreach (var order in orders)
                        {
                            quickTickets.Add(CreateTicketItem(eventItem, "", order));
                        }
                    }
                }

                #region old code
                /*
                var orders = sales.sales.sale;
                var zones = GetEventZones(eventItem.Id, token);
                if (zones.Count > 0)
                {
                    int i = 0;
                    int n = zones.Count;
                    for (; i < n; i++)
                    {
                        try
                        {
                            foreach (var order in orders)
                            {
                                if (order.section.StartsWith(zones[i]))
                                {
                                    quickTickets.Add(CreateTicketItem(eventItem, zones[i], order));
                                }
                            }
                        }
                        catch (Exception ex)
                        {

                        }
                    }
                }
                else if (zones.Count == 0)
                {
                    try
                    {

                        foreach (var order in orders)
                        {
                            quickTickets.Add(CreateTicketItem(eventItem, "", order));
                        }
                    }
                    catch (Exception ex)
                    {

                    }
                }
                */
                #endregion
            }

            return quickTickets;
        }

        private static List<StubhubSale> DownloadAllStubhubSales(Event eventItem, string token)
        {
            List<StubhubSale> sales = new List<StubhubSale>();
            const int maxCount = 100;
            int count = 100;
            int start = 0;

            do
            {
                count = 0;
                webPage = browser.NavigateToPage(new Uri(
                    string.Concat("https://pro.stubhub.com/shape/accountmanagement/sales/v1/event/", eventItem.Id,
                    "?sort=SALEDATE DESC&sectionId=0&priceType=listprice&filters=&start=", start)));

                var salesResponse = JsonConvert.DeserializeObject<StubhubSalesResponse>(webPage.Content);
                if (salesResponse != null && salesResponse.sales != null && salesResponse.sales.numFound > 0)
                {
                    count = salesResponse.sales.sale.Count;
                    sales.AddRange(salesResponse.sales.sale);
                }
                start += maxCount;
            } while (count == maxCount);

            return sales;
        }

        public static List<Event> ScrapeForEvents(string title, string venue, string token)
        {
            List<Event> results = new List<Event>();
            string resource = "/search/catalog/events/v3?limit=500&sort=eventDateLocal asc";

            if (!string.IsNullOrEmpty(title))
            {
                resource = string.Concat(resource, "&name=", title);
                //resource = string.Concat(resource, "&title=", title);
            }
            if (!string.IsNullOrEmpty(venue))
            {
                resource = string.Concat(resource, "&q=", venue);
                //resource = string.Concat(resource, "venue=", venue);
            }

            RestClient restClient = new RestClient("https://api.stubhub.com");
            if (proxy != null) restClient.Proxy = proxy;

            var restReqeust = new RestRequest(resource, Method.GET);
            restReqeust.AddHeader("Authorization", string.Format("Bearer {0}", token));

            var resp = restClient.Execute<StubhubSearchEventResponse>(restReqeust);
            if (resp.StatusCode == HttpStatusCode.OK)
            {
                foreach (var eventItem in resp.Data.events)
                {
                    var ei = new Event();
                    ei.Id = eventItem.id;
                    ei.Title = eventItem.name;
                    if (eventItem.eventDateLocal.Contains("TBD"))
                    {
                        ei.Date = null;
                    }
                    else
                    {
                        Match m = Regex.Match(eventItem.eventDateLocal, @"[+-]\d{4}", RegexOptions.Singleline);
                        int ind = -1;
                        if (m.Success) ind = m.Index;
                        if (ind < 0)
                        {
                            ei.Date = DateTime.Parse(eventItem.eventDateLocal);
                        }
                        else
                        {
                            ei.Date = DateTime.Parse(eventItem.eventDateLocal.Substring(0, ind));
                        }
                    }

                    ei.Venue = eventItem.venue.name;
                    results.Add(ei);
                }
            }

            return results;
        }
        
        private static QuickTicket CreateTicketItem(Event eventItem, string zone, HtmlAgilityPack.HtmlNode order)
        {
            QuickTicket soldTicketItem = new QuickTicket();
            soldTicketItem.Zone = zone;
            soldTicketItem.Section = order.ChildNodes["section"].InnerText.Replace(zone, "").Replace("-", "").Trim();
            soldTicketItem.Row = order.ChildNodes["rowDesc"].InnerText;

            decimal p = 0;
            if (decimal.TryParse(order.ChildNodes["pricePerTicket"].ChildNodes["amount"].InnerText, out p))
                soldTicketItem.Price = p;

            int qty = 0;
            if (int.TryParse(order.ChildNodes["quantity"].InnerText, out qty))
                soldTicketItem.Qty = qty;

            DateTime d = DateTime.Now;
            if (DateTime.TryParse(order.ChildNodes["dateSold"].InnerText, out d))
                soldTicketItem.DateSold = d;
            //if (DateTime.TryParseExact(order.ChildNodes["dateSold"].InnerText, "MM/dd/yy", CultureInfo.GetCultureInfo(1033),
            //    DateTimeStyles.None, out d)) soldTicketItem.DateSold = d;

            return soldTicketItem;
        }

        private static QuickTicket CreateTicketItem(Event eventItem, string zone, StubhubSale order)
        {
            QuickTicket soldTicketItem = new QuickTicket();

            string section = order.section;
            if (string.IsNullOrEmpty(section))
            {
                section = "";
            }
            else if (!string.IsNullOrEmpty(zone) && order.section.StartsWith(zone))
            {
                section = order.section.Replace(zone, "");
            }

            soldTicketItem.Zone = zone;
            soldTicketItem.Section = section.Replace("-", "").Trim();
            soldTicketItem.Row = order.rows;
            soldTicketItem.Price = order.displayPricePerTicket == null ? 0 : order.displayPricePerTicket.amount;
            soldTicketItem.Qty = order.quantity;
            soldTicketItem.DateSold = order.transactionDate;

            return soldTicketItem;
        }

        public static List<string> GetPossibleMatches(string sectionF, string sectionT)
        {
            List<string> possibleMatches = new List<string>();
            Regex sectionAlpha = new Regex("^([A-Z])\\1{0,2}$");
            if (sectionF == null) sectionF = "";
            if (sectionT == null) sectionT = "";
            if (sectionF.Length == 0 || sectionT.Length == 0)
            {
                if (sectionT.Length != 0) possibleMatches.Add(sectionT);
                else possibleMatches.Add(sectionF);
                return possibleMatches;
            }

            string[] splitedF = sectionF.Split(' ');
            string[] splitedT = sectionT.Split(' ');
            string sectionFFirstTokens = (splitedF.Length > 1) ? string.Join(" ", splitedF, 0, splitedF.Length - 1) : "";
            string sectionTFirstTokens = (splitedT.Length > 1) ? string.Join(" ", splitedT, 0, splitedT.Length - 1) : "";

            int nf, nt;

            if ((splitedF.Length != splitedT.Length) || (sectionFFirstTokens != sectionTFirstTokens))
            {
                possibleMatches.Add(sectionF);
                possibleMatches.Add(sectionT);
            }
            else
            {
                string sectionFLastToken = splitedF[splitedF.Length - 1];
                string sectionTLastToken = splitedT[splitedT.Length - 1];

                int.TryParse(sectionFLastToken, out nf);
                int.TryParse(sectionTLastToken, out nt);

                if (nf != 0 && nt != 0)
                {
                    if (splitedF.Length == 1)
                    {
                        for (int number = nf; number <= nt; number++)
                            possibleMatches.Add(number.ToString());
                    }
                    else
                    {
                        for (int number = nf; number <= nt; number++)
                            possibleMatches.Add(string.Format("{0} {1}", sectionFFirstTokens, number.ToString()));
                    }
                }
                else if (nf == 0 && nt == 0)
                {
                    if (sectionAlpha.IsMatch(sectionFLastToken) && sectionAlpha.IsMatch(sectionTLastToken))
                    {
                        if (splitedF.Length == 1)
                        {
                            for (char c = sectionFLastToken[0]; c <= sectionTLastToken[0]; c++)
                            {
                                possibleMatches.Add("" + c);
                                possibleMatches.Add(("" + c) + c);
                                possibleMatches.Add((("" + c) + c) + c);
                            }
                        }
                        else
                        {
                            for (char c = sectionFLastToken[0]; c <= sectionTLastToken[0]; c++)
                            {
                                possibleMatches.Add(string.Format("{0} {1}", sectionTFirstTokens, "" + c));
                                possibleMatches.Add(string.Format("{0} {1}", sectionTFirstTokens, ("" + c) + c));
                                possibleMatches.Add(string.Format("{0} {1}", sectionTFirstTokens, (("" + c) + c) + c));
                            }
                        }
                    }
                }

                if (possibleMatches.Count == 0)
                {
                    possibleMatches.Add(sectionF);
                    possibleMatches.Add(sectionT);
                }
            }
            return possibleMatches;
        }


        class StubhubSearchEventResponse
        {
            public int numFound { get; set; }
            public List<StubhubEvent> events { get; set; }
        }

        class StubhubEvent
        {
            public int id { get; set; }
            public string name { get; set; }
            public string eventDateLocal { get; set; }
            public StubhubVenue venue { get; set; }
        }

        class StubhubVenue
        {
            public int id { get; set; }
            public string name { get; set; }
            public int configurationId { get; set; }
        }

        class StubhubSalesResponse
        {
            public StubhubSales sales { get; set; }
        }

        class StubhubSales
        {
            public int numFound { get; set; }
            public List<StubhubSale> sale { get; set; }
        }

        class StubhubSale
        {
            public int quantity { get; set; }
            public string section { get; set; }
            public string rows { get; set; }
            public string seats { get; set; }
            public StubhubPrice displayPricePerTicket { get; set; }
            public string deliveryOption { get; set; }
            public DateTime transactionDate { get; set; }
        }

        class StubhubPrice
        {
            public decimal amount { get; set; }
            public string currency { get; set; }
        }

        class StubhubSearchInventoryResponse
        {
            public int eventId { get; set; }
            public List<StubhubZoneStats> zone_stats { get; set; }
            public List<StubhubZoneStats> zoneStats { get; set; }
            public List<StubhubSectionStats> section_stats { get; set; }
            public List<StubhubSectionStats> sectionStats { get; set; }
        }

        class StubhubZoneStats
        {
            public int zoneId { get; set; }
            public string zoneName { get; set; }
        }

        class StubhubSectionStats
        {
            public int sectionId { get; set; }
            public string sectionName { get; set; }
            public int zoneId { get; set; }
            public string zoneName { get; set; }
        }

        class StubhubVenueConfigMetadata
        {
            public string na { get; set; }
            public string t { get; set; }
            public string z { get; set; }
            public string zi { get; set; }
        }
    }

}
