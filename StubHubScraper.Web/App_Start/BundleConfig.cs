using System.Web;
using System.Web.Optimization;

namespace StubHubScraper.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725

        public static void AddDefaultIgnorePatterns(IgnoreList ignoreList)
        {
         //   if (ignoreList == null)
          //      throw new ArgumentNullException("ignoreList");
            ignoreList.Ignore("*.intellisense.js");
            ignoreList.Ignore("*-vsdoc.js");
            ignoreList.Ignore("*.debug.js", OptimizationMode.WhenEnabled);
            ignoreList.Ignore("*.min.js", OptimizationMode.WhenDisabled);
            ignoreList.Ignore("*.min.css", OptimizationMode.WhenDisabled);
        }

        public static void RegisterBundles(BundleCollection bundles)
        {

            bundles.IgnoreList.Clear();

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

            bundles.Add(new StyleBundle("~/bundles/custom_css").Include(
                            "~/Content/custom.css"));

            bundles.Add(new ScriptBundle("~/bundles/custom").Include(
                   "~/Scripts/custom.js"));
            bundles.Add(new ScriptBundle("~/bundles/custom_table").Include(
                  "~/Scripts/custom_table.js"));

            bundles.Add(new StyleBundle("~/bundles/metronic_css").Include(
               "~/Content/assets/global/plugins/font-awesome/css/font-awesome.min.css",
                "~/Content/assets/global/plugins/simple-line-icons/simple-line-icons.min.css",
                "~/Content/assets/global/plugins/bootstrap/css/bootstrap.min.css",
                "~/Content/assets/global/plugins/uniform/css/uniform.default.css",
                "~/Content/assets/global/plugins/bootstrap-switch/css/bootstrap-switch.min.css",
                "~/Content/assets/global/plugins/datatables/datatables.min.css",
                "~/Content/assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.css",

                "~/Content/assets/global/dist/ladda-themeless.min.css",
                "~/Content/assets/global/plugins/bootstrap-daterangepicker/daterangepicker-bs3.css",
                "~/Content/assets/global/plugins/bootstrap-datepicker/css/bootstrap-datepicker3.min.css",
               

                "~/Content/assets/global/css/components-md.min.css",
                "~/Content/assets/global/css/plugins-md.min.css",
                "~/Content/assets/layouts/layout2/css/layout.min.css",
                "~/Content/assets/layouts/layout2/css/themes/blue.min.css",
                "~/Content/assets/layouts/layout2/css/custom.min.css"                
                ));

             bundles.Add(new ScriptBundle("~/bundles/metronic_js").Include(
                   "~/Content/assets/global/plugins/jquery.min.js",
                   "~/Content/assets/global/plugins/bootstrap/js/bootstrap.min.js",
                   "~/Content/assets/global/plugins/js.cookie.min.js",
                   "~/Content/assets/global/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js",
                   "~/Content/assets/global/plugins/jquery-slimscroll/jquery.slimscroll.min.js",
                   "~/Content/assets/global/plugins/jquery.blockui.min.js",
                   "~/Content/assets/global/plugins/uniform/jquery.uniform.min.js",
                   "~/Content/assets/global/plugins/bootstrap-switch/js/bootstrap-switch.min.js",
                   "~/Content/assets/global/scripts/datatable.js",
                   "~/Content/assets/global/plugins/datatables/datatables.min.js",
                   "~/Content/assets/global/plugins/datatables/plugins/bootstrap/datatables.bootstrap.js",
                   
                   "~/Content/assets/global/dist/spin.min.js",
                   "~/Content/assets/global/dist/ladda.min.js",

                   "~/Content/assets/global/plugins/bootbox/bootbox.min.js",
                   "~/Content/assets/global/plugins/bootstrap-daterangepicker/moment.min.js",
                   "~/Content/assets/global/plugins/bootstrap-daterangepicker/daterangepicker.js",
                   "~/Content/assets/global/plugins/bootstrap-datepicker/js/bootstrap-datepicker.min.js",

                   "~/Content/assets/global/plugins/jquery-ui/jquery-ui.min.js",

                   "~/Content/assets/global/plugins/amcharts/amcharts/amcharts.js",
                   "~/Content/assets/global/plugins/amcharts/amcharts/serial.js",
                   "~/Content/assets/global/plugins/amcharts/amcharts/themes/light.js",
                   
                   "~/Content/assets/global/scripts/app.min.js",
    
                   "~/Content/assets/layouts/layout2/scripts/layout.min.js",
                   "~/Content/assets/layouts/layout2/scripts/demo.min.js",
                   "~/Content/assets/layouts/global/scripts/quick-sidebar.min.js"
               ));
        }
    }
}