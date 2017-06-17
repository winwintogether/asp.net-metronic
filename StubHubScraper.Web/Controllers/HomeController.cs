using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using StubHubScraper.Web.Models;

using StubHubScraper.Services;

namespace StubHubScraper.Web.Controllers
{
    [Authorize]
    public class HomeController : Controller
    {
        private readonly IAuthenticationService _authenticationService;
        public HomeController(IAuthenticationService authenticationService)
        {
            this._authenticationService = authenticationService;
        }

        [AllowAnonymous]
        public ActionResult Index(string returnUrl)
        {
            if (returnUrl == null) {
                returnUrl = "1";
            }
            ViewBag.ReturnUrl = returnUrl;

            var user = _authenticationService.GetAuthenticatedUser();
            if (user != null)
            {
                ViewBag.Username = user.UserName;
                ViewBag.IsAdmin = user.IsAdmin.ToString();
                ViewBag.UserId = user.Id.ToString();
            }

            return View();
        }

        public ActionResult newIndex() {
            return Content("Welcome");
        }

    }
}
