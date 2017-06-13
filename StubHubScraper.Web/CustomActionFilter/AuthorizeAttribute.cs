using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Web;
using System.Web.Routing;
using System.Web.Mvc;
using System.Web.Http;
using StubHubScraper.Services;
using StubHubScraper.Framework;

namespace StubHubScraper.Web.CustomActionFilter
{
    public class AuthorizeAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.User.Identity.IsAuthenticated == false)
            {
               
                    
            }
            base.OnActionExecuting(filterContext);
        }
    }
}
