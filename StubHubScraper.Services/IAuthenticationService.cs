using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial interface IAuthenticationService
    {
        void SignIn(User user, bool createPersistentCookie);
        void SignOut();
        User GetAuthenticatedUser();
    }
}
