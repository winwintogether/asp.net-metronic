using StubHubScraper.Data.Domain;
using System.Collections.Generic;
using System.Linq;

namespace StubHubScraper.Services
{
    public partial interface IUserService
    {
        bool ValidateUser(string username, string password);
        User GetUserByUsername(string username);
        User GetUserById(int id);
        void InsertUser(User user);
        void DeleteUser(User user);
        void UpdateUser(User user);
        IQueryable<User> GetAllUsers();
    }
}
