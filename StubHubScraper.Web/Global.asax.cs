using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

using AutoMapper;

using Autofac;
using Autofac.Integration.WebApi;

using FluentValidation;
using FluentValidation.WebApi;

using StubHubScraper.Framework;

using StubHubScraper.Core.Data;
using StubHubScraper.Web.Models;

namespace StubHubScraper.Web
{
    // 注意: 有关启用 IIS6 或 IIS7 经典模式的说明，
    // 请访问 http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            //initialize engine context
            var engine = EngineContext.Initialize(false);

            //create the depenedency resolver
            var resolver = new StubHubScraper.Web.Infrastructure.DependencyResolver();

            //Mvc dependency resolver
            DependencyResolver.SetResolver(resolver);

            //WebApi dependency resolver
            GlobalConfiguration.Configuration.DependencyResolver = new AutofacWebApiDependencyResolver(engine.ContainerManager.Container); ;

            //fluent validation
            GlobalConfiguration.Configuration.Services.Add(
                typeof(System.Web.Http.Validation.ModelValidatorProvider),
                new FluentValidationModelValidatorProvider()
                );

            Mapper.CreateMap<BaseEntity, BaseEntityModel>()
                .ConvertUsing(new ProxyConverter<BaseEntity, BaseEntityModel>());

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            AuthConfig.RegisterAuth();
        }
    }
}