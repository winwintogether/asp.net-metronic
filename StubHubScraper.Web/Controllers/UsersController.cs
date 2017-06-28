using System;
using System.Linq;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity.Infrastructure;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using StubHubScraper.Web.Filters;
using StubHubScraper.Web.Models;

using StubHubScraper.Data.Domain;
using StubHubScraper.Services;

namespace StubHubScraper.Web.Controllers
{
    //[Authorize]
    public class UsersController : ApiController
    {
        private readonly IUserService _userService;
        private readonly IAuthenticationService _authenticationService;

        public UsersController(IUserService userService,
            IAuthenticationService authenticationService)
        {
            this._userService = userService;
            this._authenticationService = authenticationService;
        }

        [Queryable]
        public IQueryable<UserModel> GetAllUsers()
        {
            var user = _authenticationService.GetAuthenticatedUser();

            if (user.IsAdmin)
                return _userService.GetAllUsers().Select(PrepareUserModel).AsQueryable();

            return null;
        }

        public UserModel GetById(int id)
        {
            var user = _userService.GetUserById(id);

            return PrepareUserModel(user);
        }

        [NonAction]
        protected UserModel PrepareUserModel(User user)
        {
            var userModel = new UserModel
            {
                Id = user.Id,
                UserName = user.UserName,
                Password = user.Password,
                IsAdmin=user.IsAdmin,
                ApiUserName=user.ApiUserName,
                ApiPassword=user.ApiPassword,
                Environment=user.Environment,
                ConsumerKey=user.ConsumerKey,
                ConsumerSecret=user.ConsumerSecret,
                ApplicationToken=user.ApplicationToken
            };

            return userModel;
        }

        // PUT api/Account/5
        public HttpResponseMessage Put(int id, UserModel userModel, int edituser = 0)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            if (id != userModel.Id)
            {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            User user = _userService.GetUserById(id);
            if (user == null)
                return Request.CreateResponse(HttpStatusCode.NotFound);

            try
            {
                if (!string.IsNullOrEmpty(userModel.UserName))
                    user.UserName = userModel.UserName;

                if (!string.IsNullOrEmpty(userModel.Password))
                    user.Password = userModel.Password;

                if (edituser == 0)
                {
                    user.IsAdmin = userModel.IsAdmin;
                }
                if (!string.IsNullOrEmpty(userModel.ApiUserName))
                    user.ApiUserName = userModel.ApiUserName;
                if (!string.IsNullOrEmpty(userModel.ApiPassword))
                    user.ApiPassword = userModel.ApiPassword;
                if (!string.IsNullOrEmpty(userModel.Environment))
                    user.Environment = userModel.Environment;
                if (!string.IsNullOrEmpty(userModel.ConsumerKey))
                    user.ConsumerKey = userModel.ConsumerKey;
                if (!string.IsNullOrEmpty(userModel.ConsumerSecret))
                    user.ConsumerSecret = userModel.ConsumerSecret;
                if (!string.IsNullOrEmpty(userModel.ApplicationToken))
                    user.ApplicationToken = userModel.ApplicationToken;

                _userService.UpdateUser(user);
            }
            catch (Exception ex)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }
            var model = new { result = "success" };
            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.OK, model);
            return response;
            // return Request.CreateResponse(HttpStatusCode.OK);
        }

        // POST api/Account
        public HttpResponseMessage Post(UserModel userModel)
        {
            if (!ModelState.IsValid)
            {
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ModelState);
            }

            User user = new User
            {
                UserName = userModel.UserName,
                Password = userModel.Password,
                ApiUserName = userModel.ApiUserName,
                ApiPassword = userModel.ApiPassword,
                IsAdmin = userModel.IsAdmin,
                Environment=userModel.Environment,
                ConsumerKey=userModel.ConsumerKey,
                ConsumerSecret=userModel.ConsumerSecret,
                ApplicationToken=userModel.ApplicationToken
            };

            _userService.InsertUser(user);

            userModel.Id = user.Id;

            HttpResponseMessage response = Request.CreateResponse(HttpStatusCode.Created, userModel);
            response.Headers.Location = new Uri(Url.Link("DefaultApi", new { id = userModel.Id }));
            return response;
        }

        // DELETE api/Account/5
        public HttpResponseMessage Delete(int id)
        {
            User user = _userService.GetUserById(id);
            if (user == null)
            {
                return Request.CreateResponse(HttpStatusCode.NotFound);
            }

            UserModel userModel = new UserModel
            {
                Id = user.Id,
                UserName = user.UserName,
                Password = user.Password
            };
            try
            {
                _userService.DeleteUser(user);
            }
            catch (DbUpdateConcurrencyException)
            {
                return Request.CreateResponse(HttpStatusCode.InternalServerError);
            }

            return Request.CreateResponse(HttpStatusCode.OK, userModel);
        }

    }
}