using System.Web;
using System.Web.Optimization;

namespace StubHubScraper.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/dhtmlx").Include(
                            "~/Scripts/dhtmlx.js",
                            "~/Scripts/main.js"
                        ));
            bundles.Add(new StyleBundle("~/bundles/dhtmlx_css").Include(
                            "~/Content/dhtmlx.css",
                            "~/Content/site.css"
                        ));
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/dateformat").Include(
                        "~/Scripts/dateFormat.js"));


            bundles.Add(new ScriptBundle("~/bundles/ajaxlogin").Include(
                "~/Scripts/ajaxlogin.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js"));


            bundles.Add(new StyleBundle("~/bundles/bootstrap_css").Include(
                "~/Content/bootstrap.css",
                "~/Content/bootstrap-responsive.css"));

            bundles.Add(new StyleBundle("~/bundles/login_css").Include(
                            "~/Content/login.css"));
        }
    }
}