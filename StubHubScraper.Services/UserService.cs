using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

using StubHubScraper.Core;
using StubHubScraper.Core.Data;
using StubHubScraper.Data;
using StubHubScraper.Data.Domain;

namespace StubHubScraper.Services
{
    public partial class UserService : IUserService
    {
        private readonly IApplicationRepository<User> _userRepository;

        public UserService(IApplicationRepository<User> userRepository)
        {
            this._userRepository = userRepository;
        }

        public virtual bool ValidateUser(string username, string password)
        {
            var user = this.GetUserByUsername(username);

            bool isValid = user.Password == password;

            return isValid;
        }

        public virtual User GetUserByUsername(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return null;

            var query = from c in _userRepository.Table
                        orderby c.Id
                        where c.UserName == username
                        select c;

            var user = query.FirstOrDefault();
            return user;
        }

        public virtual User GetUserById(int id)
        {
            var user = _userRepository.GetById(id);

            return user;
        }

        public void InsertUser(User user)
        {
            _userRepository.Insert(user);
        }

        public void DeleteUser(User user)
        {
            _userRepository.Delete(user);
        }

        public void UpdateUser(User user)
        {
            _userRepository.Update(user);
        }

        public IQueryable<User> GetAllUsers()
        {
            return _userRepository.Table;
        }
    }
}
