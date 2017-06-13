using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.IO;
using System.Web;
using System.Xml.Linq;
using System.Globalization;
using System.Text.RegularExpressions;
using System.Configuration;
using ScrapySharp;
using ScrapySharp.Network;
using ScrapySharp.Extensions;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public class StubHub1
    {
        private static object lockObject = new object();

        private string loginEmail;
        private string password;
        private string refersh_token;
        private string access_token;
        private CookieContainer cookieContainer = new CookieContainer();

        private ScrapingBrowser browser = new ScrapingBrowser();
        private WebPage webPage;
        private bool _hasLogin = false;
        public bool HasLogin
        {
            get { return _hasLogin; }
            set { _hasLogin = value; }
        }

        public StubHub1(string email, string pass)
        {
            this.loginEmail = email;
            this.password = pass;
            browser.UserAgent = new FakeUserAgent("MSIE", "Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 2.0.50727; InfoPath.1; .NET CLR 1.1.4322)");
            browser.Timeout = TimeSpan.FromMinutes(2);
            browser.KeepAlive = true;
            browser.UseDefaultCookiesParser = true;
            browser.AllowAutoRedirect = true;
        }

        public bool Stoped { get; set; }
        public bool IsManual { get; set; }
        //public AutoLogItem ItemLog { get; set; }


        private string Base64Encode(string plainText)
        {
            var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
            return System.Convert.ToBase64String(plainTextBytes);
        }

        public bool Login(out string errorMessage)
        {
            bool success = false;
            errorMessage = "OK";
            cookieContainer = new CookieContainer();

            if (!_hasLogin)
            {
                string postData = string.Format("t%3Aformdata={0}&loginEmail={1}&loginPassword={2}&signIn=signIn",
                                 "H4sIAAAAAAAAAJWRvUoDQRRGrwGbBJuALyAJdhML02iVQqsogcVa7s7ejCPz570TNzY%2Bik8gvkQKO9%2FBB7C1SqFZTBvW9sDhfPC9fsF%2BPYCjwppgw5mLxgYdfYqBQr49UQ0gj9YJwziyUZhQ35HKmEgyP42VjkzOlqpEITUpfyHqfGnJVYOC8iINb1a9z8P3dQf2ptDTMWSO7ho9ZehP7%2FERRw6DGRWZbTDny5Sh21QvNtXW2yb%2F3TbjqEmkWJTeitgYVm%2FV6fz75aMDsEz1MQx3dhOK1JEreYBngAwHDZ390db6xt55AJMnXxJ72pa6W3RF7cSm8QPEho0q6QEAAA%3D%3D",
                    //HttpUtility.UrlEncode(tformdataParam),
                                 HttpUtility.UrlEncode(this.loginEmail), HttpUtility.UrlEncode(this.password));

                var result = browser.NavigateTo(new Uri("https://myaccount.stubhub.com/login/signin.logincomponent_0.signinform"), HttpVerb.Post, postData);
                Match loginMatch = Regex.Match(result, @"<a href=.https://myaccount.stubhub.com/login/Signout.>Sign out</a>", RegexOptions.IgnoreCase);
                if (loginMatch.Success)
                {
                    success = true;
                    _hasLogin = true;
                }
                else
                    errorMessage = "Unable to login.";
            }
            else
                success = true;
            return success;
        }

        public void Logout()
        {
            lock (lockObject)
            {
                // logout
                //HttpWebRequest request = (HttpWebRequest)WebRequest.Create("https://www.stubhub.com/?gSec=login&gAct=logout");
                //request.CookieContainer = this.cookieContainer;
                //using (WebResponse resp = request.GetResponse()) { }
                webPage = browser.NavigateToPage(new Uri("https://www.stubhub.com/?gSec=login&gAct=logout"));
            }
        }

        //public bool ScrapeEventMainInfo(Event eventItem)
        //{
        //    bool exists = false;
        //    // search event
        //    lock (lockObject)
        //    {
        //        if (this.Stoped) return false;

        //        webPage = browser.NavigateToPage(new Uri(string.Format("https://api.stubhub.com/catalog/events/v2/{0}", eventItem.Id)));
        //        var eventXML = webPage.Html.CssSelect("event").FirstOrDefault();
        //        if (eventXML != null)
        //        {
        //            exists = true;
        //            eventItem.Title = eventXML.ChildNodes["title"].InnerText;
        //            var eventDate = eventXML.ChildNodes["eventDateLocal"].InnerText;
        //            if (eventDate.Contains("TBD"))
        //            {
        //                eventItem.Date = null;
        //            }
        //            else
        //            {
        //                eventItem.Date = DateTime.Parse(eventDate);
        //            }
        //            eventItem.Venue = eventXML.ChildNodes["venue"].ChildNodes["name"].InnerText;
        //        }
        //    }
        //    return exists;
        //}

        //public void ScrapeEventSoldTickets(Event eventItem)
        //{
        //    lock (lockObject)
        //    {
        //        eventItem.Tickets.Clear();
        //        webPage = browser.NavigateToPage(new Uri(string.Format("https://pro.stubhub.com/api/events/v3/{0}/pricingOrders?start=0&sortcolumn=SOLD_DATE&sortorder=DESCENDING&stats=false&_type=xml", eventItem.ID)));
        //        var total = "0";
        //        var sales = webPage.Html.CssSelect("salesResponse").FirstOrDefault();
        //        if (sales.ChildNodes.Count > 0)
        //            total = sales.ChildNodes["total"].InnerText;
        //        if (total != "0")
        //        {
        //            var orders = sales.CssSelect("orders");
        //            var zones = GetEventZones(eventItem.ID);
        //            if (zones.Count > 0)
        //            {
        //                int i = 0;
        //                int n = zones.Count;
        //                for (; i < n && !this.Stoped; i++)
        //                {
        //                    if (ItemLog != null)
        //                    {
        //                        ItemLog.Date = DateTime.Now;
        //                        ItemLog.Zone = zones[i];
        //                    }
        //                    OnScrapingEvent(new ScrapingEventArgs() { Name = zones[i], Step = i + 1, Number = n });
        //                    try
        //                    {
        //                        foreach (var order in orders)
        //                        {
        //                            if (order.ChildNodes["section"].InnerText.Contains(zones[i]))
        //                            {
        //                                SoldTicketItem sold = CreateTicketItem(eventItem, zones[i], order);
        //                                TicketFoundArgs tfArgs = new TicketFoundArgs() { Ticket = sold };
        //                                OnTicketFound(tfArgs);
        //                                if (tfArgs.Accepted)
        //                                    eventItem.Tickets.Add(sold);
        //                            }
        //                        }
        //                    }
        //                    catch (Exception ex)
        //                    {
        //                        Program.MasterWindow.LogFromThreads(string.Format(Constants.REQ_6, eventItem, zones[i]), ex);
        //                    }
        //                }
        //            }
        //            else if (zones.Count == 0 && eventItem.Tickets.Count == 0)
        //            {
        //                try
        //                {

        //                    foreach (var order in orders)
        //                    {
        //                        SoldTicketItem sold = CreateTicketItem(eventItem, "", order);
        //                        TicketFoundArgs tfArgs = new TicketFoundArgs() { Ticket = sold };
        //                        OnTicketFound(tfArgs);
        //                        if (tfArgs.Accepted)
        //                            eventItem.Tickets.Add(sold);
        //                    }
        //                }
        //                catch (Exception ex)
        //                {
        //                    Program.MasterWindow.LogFromThreads(string.Format(Constants.REQ_7, eventItem), ex);
        //                }
        //            }
        //        }
        //    }
        //}


        //public List<EventItem> ScrapeLinkForEvents(string link)
        //{
        //    List<EventItem> results = new List<EventItem>();
        //    HtmlAgilityPack.HtmlDocument htmlDoc = new HtmlAgilityPack.HtmlDocument();

        //    OnScrapingEvent(new ScrapingEventArgs() { Status = "Scanning link..." });

        //    lock (lockObject)
        //    {
        //        if (this.Stoped) return results;

        //        //HttpWebRequest request = (HttpWebRequest)WebRequest.Create(link);
        //        //request.CookieContainer = this.cookieContainer;
        //        //using (HttpWebResponse response = (HttpWebResponse)request.GetResponse())
        //        //{
        //        //    using (StreamReader sr = new StreamReader(response.GetResponseStream()))
        //        //    {
        //        //        htmlDoc.LoadHtml(sr.ReadToEnd());
        //        //    }
        //        //}
        //        webPage = browser.NavigateToPage(new Uri(link));
        //        htmlDoc.LoadHtml(webPage.Html.InnerHtml);
        //    }

        //    HtmlAgilityPack.HtmlNode tblNoTabs = htmlDoc.GetElementbyId("tblNoTabs");
        //    HtmlAgilityPack.HtmlNode tblUpEvents = htmlDoc.GetElementbyId("tblUpEvents");
        //    HtmlAgilityPack.HtmlNode divResultsPaneContainer = htmlDoc.GetElementbyId("resultsPaneContainer");
        //    IEnumerable<HtmlAgilityPack.HtmlNode> trs = null;

        //    if (tblNoTabs != null)
        //        trs = tblNoTabs.SelectNodes("tbody/tr");
        //    else if (tblUpEvents != null)
        //        trs = tblUpEvents.SelectNodes("tbody/tr");
        //    else if (divResultsPaneContainer != null)
        //    {
        //        HtmlAgilityPack.HtmlNode tblEvents = divResultsPaneContainer.Descendants("table").FirstOrDefault<HtmlAgilityPack.HtmlNode>(
        //            delegate(HtmlAgilityPack.HtmlNode table)
        //            {
        //                return Regex.IsMatch(table.OuterHtml.Trim(), "^<table\\s+activeTable=\"yes\"\\s+class=\"dataTable\\s+eventTable\\s+clear\"\\s+id=\"tbl\\d+\">.*", RegexOptions.IgnoreCase);
        //            });
        //        if (tblEvents != null)
        //            trs = tblEvents.SelectNodes("tbody/tr");
        //    }

        //    if (trs != null && trs.Count() > 0)
        //    {
        //        for (int i = 0, n = trs.Count(); i < n && !this.Stoped; i++)
        //        {
        //            EventItem eventItem = new EventItem();
        //            HtmlAgilityPack.HtmlNode tr = trs.ElementAt(i);

        //            HtmlAgilityPack.HtmlNode eventNameLink = tr.SelectSingleNode("td[contains(@class,'eventName')]/a");
        //            if (eventNameLink != null)
        //            {
        //                eventItem.Title = HttpUtility.HtmlDecode(eventNameLink.InnerText).Trim();

        //                int id = 0;
        //                string href = eventNameLink.GetAttributeValue("href", "");

        //                Match match = Regex.Match(href, @"^.*(?:-|/)(?<id>\d+)/$", RegexOptions.IgnoreCase);
        //                if (match.Success && int.TryParse(match.Groups[1].Value, out id))
        //                    eventItem.ID = id;
        //                else continue;
        //            }
        //            else continue;

        //            HtmlAgilityPack.HtmlNode tdEventDate = tr.SelectSingleNode("td[contains(@class, 'eventDate')]");
        //            if (tdEventDate != null)
        //            {
        //                string eventDate = HttpUtility.HtmlDecode(tdEventDate.InnerText).Trim();
        //                DateTime d = DateTime.Now;

        //                if (eventDate.Contains("TBD"))
        //                    eventItem.Date = null;
        //                else
        //                {
        //                    eventDate = eventDate.Replace(".", "").Replace("pm", "PM").Replace("am", "AM");

        //                    int index = eventDate.LastIndexOf(" ");
        //                    if (index != -1)
        //                    {
        //                        string timezone = eventDate.Substring(index + 1);
        //                        string hours = Constants.ZoneTable[timezone] as string;

        //                        if (hours != null)
        //                        {
        //                            string eventDateWithZone = eventDate.Replace(timezone, hours);

        //                            if (DateTime.TryParseExact(eventDateWithZone, "ddd MM/dd/yyyy h:mm tt zzz", CultureInfo.GetCultureInfo(1033), DateTimeStyles.AdjustToUniversal, out d)
        //                                || DateTime.TryParseExact(eventDateWithZone, "ddd, MM/dd/yyyy h:mm tt zzz", CultureInfo.GetCultureInfo(1033), DateTimeStyles.AdjustToUniversal, out d))
        //                            {
        //                                eventItem.Date = d;
        //                                eventItem.DateString = eventDate.Replace(",", "");
        //                            }
        //                            else eventItem.Date = null;
        //                        }
        //                    }
        //                }

        //                if (eventItem.Date == null) eventItem.DateString = "";
        //            }

        //            HtmlAgilityPack.HtmlNode tdEventLocation = tr.SelectSingleNode("td[contains(@class, 'eventLocation')]");
        //            if (tdEventLocation != null)
        //            {
        //                eventItem.Venue = HttpUtility.HtmlDecode(tdEventLocation.InnerText).Trim().Replace("\n", " ").Replace("\n\r", " ");
        //            }

        //            results.Add(eventItem);
        //        }
        //    }

        //    return results;
        //}

        public List<string> GetEventZones(int eventId)
        {
            List<string> results = new List<string>();

            if (this.Stoped) return results;


            // get seatmapdata.xml ... will provide all zones available
            lock (lockObject)
            {
                webPage = browser.NavigateToPage(new Uri(string.Format("https://api.stubhub.com/catalog/events/v1/{0}?getZones=true", eventId)));
                var zones = webPage.Html.CssSelect("zones");
                foreach (var zone in zones)
                {
                    results.Add(zone.ChildNodes["zoneDescription"].InnerText);
                }
            }

            return results;
        }

        //private SoldTicketItem CreateTicketItem(EventItem eventItem, string zone, HtmlAgilityPack.HtmlNode order)
        //{
        //    SoldTicketItem soldTicketItem = new SoldTicketItem();

        //    soldTicketItem.EventID = eventItem.ID;
        //    soldTicketItem.EventDate = eventItem.Date;
        //    soldTicketItem.EventDateString = eventItem.DateString;
        //    soldTicketItem.EventTitle = eventItem.Title;
        //    soldTicketItem.EventVenue = eventItem.Venue;
        //    soldTicketItem.Zone = zone;
        //    soldTicketItem.Section = order.ChildNodes["section"].InnerText.Replace(zone, "").Replace("-", "").Trim();
        //    soldTicketItem.Row = order.ChildNodes["rowDesc"].InnerText;

        //    double p = 0;
        //    if (double.TryParse(order.ChildNodes["pricePerTicket"].ChildNodes["amount"].InnerText, out p))
        //        soldTicketItem.Price = p;

        //    int qty = 0;
        //    if (int.TryParse(order.ChildNodes["quantity"].InnerText, out qty))
        //        soldTicketItem.Qty = qty;

        //    DateTime d = DateTime.Now;
        //    if (DateTime.TryParse(order.ChildNodes["dateSold"].InnerText, out d))
        //        soldTicketItem.DateSold = d;
        //    //if (DateTime.TryParseExact(order.ChildNodes["dateSold"].InnerText, "MM/dd/yy", CultureInfo.GetCultureInfo(1033),
        //    //    DateTimeStyles.None, out d)) soldTicketItem.DateSold = d;

        //    return soldTicketItem;
        //}

        //private SoldTicketItem CreateTicketItem(EventItem eventItem, string zone, XElement xmlTicket)
        //{
        //    SoldTicketItem soldTicketItem = new SoldTicketItem();

        //    soldTicketItem.EventID = eventItem.ID;
        //    soldTicketItem.EventDate = eventItem.Date;
        //    soldTicketItem.EventDateString = eventItem.DateString;
        //    soldTicketItem.EventTitle = eventItem.Title;
        //    soldTicketItem.EventVenue = eventItem.Venue;
        //    soldTicketItem.Zone = zone;
        //    soldTicketItem.Section = xmlTicket.Element("section").Value;
        //    soldTicketItem.Row = xmlTicket.Element("row").Value;

        //    double p = 0;
        //    if (double.TryParse(xmlTicket.Element("price").Value, out p))
        //        soldTicketItem.Price = p;

        //    int qty = 0;
        //    if (int.TryParse(xmlTicket.Element("qty").Value, out qty))
        //        soldTicketItem.Qty = qty;

        //    DateTime d = DateTime.Now;
        //    if (DateTime.TryParseExact(xmlTicket.Element("date").Value, "MM/dd/yy", CultureInfo.GetCultureInfo(1033),
        //        DateTimeStyles.None, out d)) soldTicketItem.DateSold = d;

        //    return soldTicketItem;
        //}
    }

}
