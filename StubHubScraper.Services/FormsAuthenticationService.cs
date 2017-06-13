using System;
using System.Web;
using System.Web.Security;

using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial class FormsAuthenticationService :IAuthenticationService
    {
        private readonly TimeSpan _expirationTimeSpan;
        private readonly IUserService _userService;

        private User _cachedUser;

        public FormsAuthenticationService(IUserService userService)
        {
            this._userService = userService;

            this._expirationTimeSpan = FormsAuthentication.Timeout;
        }

        public void SignIn(User user, bool createPersistentCookie)
        {
            //StubHub.Login(user.UserName, user.Password);
            //if (StubHub.Login(user.UserName, user.Password))
            //{
                var now = DateTime.UtcNow.ToLocalTime();

                var ticket = new FormsAuthenticationTicket(
                    1 /*version*/,
                    user.UserName,
                    now,
                    now.Add(_expirationTimeSpan),
                    createPersistentCookie,
                    user.Id.ToString(),
                    FormsAuthentication.FormsCookiePath);

                var encryptedTicket = FormsAuthentication.Encrypt(ticket);

                var cookie = new HttpCookie(FormsAuthentication.FormsCookieName, encryptedTicket);
                cookie.HttpOnly = true;
                if (ticket.IsPersistent)
                {
                    cookie.Expires = ticket.Expiration;
                }
                cookie.Secure = FormsAuthentication.RequireSSL;
                cookie.Path = FormsAuthentication.FormsCookiePath;
                if (FormsAuthentication.CookieDomain != null)
                {
                    cookie.Domain = FormsAuthentication.CookieDomain;
                }


                HttpContext.Current.Response.Cookies.Add(cookie);
                _cachedUser = user;
            //}
        }

        public void SignOut()
        {
            _cachedUser = null;
            FormsAuthentication.SignOut();
        }

        public User GetAuthenticatedUser()
        {
            if (_cachedUser != null)
                return _cachedUser;

            if (HttpContext.Current == null ||
                HttpContext.Current.Request == null ||
                !HttpContext.Current.Request.IsAuthenticated ||
                !(HttpContext.Current.User.Identity is FormsIdentity))
            {
                return null;
            }

            var formsIdentity = (FormsIdentity)HttpContext.Current.User.Identity;
            var user = GetAuthenticatedUserFromTicket(formsIdentity.Ticket);
            //if (user != null && user.Active && !user.Deleted && user.IsRegistered())
            _cachedUser = user;
            return _cachedUser;
        }

        public virtual User GetAuthenticatedUserFromTicket(FormsAuthenticationTicket ticket)
        {
            if (ticket == null)
                throw new ArgumentNullException("ticket");

            var userId = int.Parse(ticket.UserData);

            var user = _userService.GetUserById(userId);
            return user;
        }
    }
}
