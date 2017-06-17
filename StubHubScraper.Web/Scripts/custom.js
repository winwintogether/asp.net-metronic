    function getSearchId() {
       
    }

   
    function loadSearches() {
        // var showArchivedSearches = $('#showArchivedSearches').is(':checked');
        // var archived = 0;
        // if (showArchivedSearches)
        //     archived = 1;
        // loadGridData("/api/search/?archived=" + archived, searchesGrid);
    }

   
   
    
    $("#deleteQuickSearchItem").click(function () {
        alert("Click deleteQuickSearchItem");
    });
  
/*********   Complete *******************/
   
    function ajaxRequest(type, url, data, dataType) { // Ajax helper
        var options = {
            dataType: dataType || "json",
            contentType: "application/json",
            cache: false,
            type: type,
            data: data ? JSON.stringify(data) : null,
            error: function (xhr, status, error) {
                var err = eval("(" + xhr.responseText + ")");
                if (err.message == undefined)
                    alert("error");
                else
                    alert("error");
            }
        };
        var antiForgeryToken = $("#antiForgeryToken").val();
        if (antiForgeryToken) {
            options.headers = {
                'RequestVerificationToken': antiForgeryToken
            };
        }
        return $.ajax(url, options);
    }
    function failCallback(elem) {
        alert("Connetion error");
    }
    function loadComboData(combo, url, showKey, valKey, val) {
        ajaxRequest("get", url).done(function (data) {
            if (data.length > 0) {
                var options = [];
                options.push(["", ""]);
                $.each(data, function (i, v) {
                    options.push([v[valKey], v[showKey]]);
                    combo.append("<option value='" + v[valKey] + "'>" + v[showKey] + "</option>")
                });

                if (options.length > 0)
                    combo.val(options[0][0]);
                if (val != "")
                    combo.val(val);
            }
        }).fail(failCallback);
    }
    function loadGridData(url, grid) {
        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            grid.find("tbody").empty();

            $.each(data, function (i, v) {
                grid.DataTable().row.add([v["Zone"], v["Section"], v["Row"], v["Price"], v["Qty"], v["DateSold"]]);
                grid.DataTable().draw();
            });


        }).fail(function () {
            alert("Error when loading data!");
        });
    }
    function loadSearchGridData(url, grid) {
        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            grid.find("tbody").empty();

            $.each(data, function (i, v) {
                //grid.DataTable().row.add([v["Zone"], v["Section"], v["Row"], v["Price"], v["Qty"], v["DateSold"]]);
                grid.DataTable().draw();
            });


        }).fail(function () {
            alert("Error when loading data!");
        });
    }

    $("#getZones").click(function () {
       
        var eventId = $("#txtEventId").val();
        if (eventId != "") {
            ajaxRequest("get", "/api/eventzones/?eventId=" + eventId).done(function (data) {
              
                $.each(data, function (i, v) {
                    console.log(v);
                    $("#PickZones").append("<option value='" + v["value"] + "'>" + v["text"] + "</option>")
                });
            });
        }
    });
    $("#cbDoNewQuickSearch").click(function () {

        if ($(this).is(':checked')) {

            $("#cbSaveQuickSearch").attr('disabled', false);
            $("#cboQuickSearches").attr('disabled', true);
            $("#txtEventId").attr('disabled', false);
            $("#cboQuickSearches").val("");
            $("#txtEventId").val("");
            $("#SectionFrom").val("");
            $("#SectionTo").val("");
            $("#LastWeekSalesOnly").attr("checked", false);
            $("#AllSales_1").val("");
            $("#AllTickets_1").val("");
            $("#AvgPrice_1").val("");
            $("#FilterSales_1").val("");
            $("#FilterTickets_1").val("");
            $("#FilterAvgPrice_1").val("");
            $("#AllSales_2").val("");
            $("#AllTickets_2").val("");
            $("#AvgPrice_2").val("");
            $("#FilterSales_2").val("");
            $("#FilterTickets_2").val("");
            $("#FilterAvgPrice_2").val("");

            $("#table_1").DataTable().clear();
            $("#table_1").DataTable().draw();
            $("#table_2").DataTable().clear();
            $("#table_2").DataTable().draw();
            $("#PickZones").empty();
            //   barChart.clearAll();
            //   barChart.parse([], "json");

        } else {
            $("cbSaveQuickSearch").attr("checked", false);
            $("cboQuickSearches").val("");
            $("cbSaveQuickSearch").attr("disabled", true);
            $("cboQuickSearches").attr("disabled", false);
            $("txtEventId").attr("disabled", true);
        }
    });
    $("#btnQuickSearch").click(function () {
       
        if ($("cboQuickSearches").is(':disabled'))
            return true;
       
        var eventId = $("#txtEventId").val();
        var isChecked = $("#cbSaveQuickSearch").is(':checked');
        var isSave = 0;
        var sectionFrom = $("#SectionFrom").val();
        var sectionTo = $("#SectionTo").val();
        var LastWeekSalesOnly = 0;
        var lwso = $("#LastWeekSalesOnly").is(':checked');
        if (lwso) LastWeekSalesOnly = 1;
        var zones = $("#PickZones").val();
        if (isChecked) isSave = 1;
        ajaxRequest("get", "/api/quicksearches/" + eventId + "?isNew=1&isSave=" + isSave + "&sectionFrom=" + sectionFrom + "&sectionTo=" + sectionTo + "&lastWeekSalesOnly=" + LastWeekSalesOnly + "&zones=" + zones).done(function (data) {

            console.log(JSON.stringify(data));

            $("#txtEventId").val(data.EventId);
            $("#SectionFrom").val(data.SectionFrom);
            $("#SectionTo").val(data.SectionTo);
            $("#LastWeekSalesOnly").val(data.LastWeekSalesOnly);

            $("#AllSales_2").val(data.AllSales);
            $("#AllTickets_2").val(data.AllTickets);
            $("#AvgPrice_2").val(data.AvgPrice);
            $("#FilterSales_2").val(data.FilterSales);
            $("#FilterTickets_2").val(data.FilterTickets);
            $("#FilterAvgPrice_2").val(data.FilterAvgPrice);

            $("#PickZones").val("");
            var qsTab2Grid = $("#table_2");
            loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isSave=" + isSave, qsTab2Grid);

            var cboQuickSearches = $("#cboQuickSearches");
            cboQuickSearches.empty();
            loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

            /*ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {
                var end = 100;
                if (data != "")
                    end = data[0].max;
                barChart.define("yAxis", {
                    start: 0,
                    step: 20,
                    end: end
                })
                barChart.clearAll();
                barChart.parse(data, "json");
            });
            */
        });

    });
    $("#btnExportToCSV").click(function () {
        var eventId = $("#txtEventId").val();
        var isChecked = $("#cbDoNewQuickSearch").is(':checked');
        var isNew = 0;
        if (isChecked) isNew = 1;
        window.location = "ExportToCSV/QuickSearchToCSV?eventid=" + eventId + "&isNew=" + isNew;
    });
    $("#cboQuickSearches").change(function () {
        if ($(this).val() != "") {
            ajaxRequest("get", "/api/quicksearches/" + $(this).val() + "?isNew=0&isSave=0").done(function (data) {
                if (data.Id != undefined) {
                    
                    $("#txtEventId").val(data.EventId);
                    $("#SectionFrom").val(data.SectionFrom);
                    $("#SectionTo").val(data.SectionTo);
                    $("#LastWeekSalesOnly").val(data.LastWeekSalesOnly);

                    $("#AllSales_1").val(data.AllSales);
                    $("#AllTickets_1").val(data.AllTickets);
                    $("#AvgPrice_1").val(data.AvgPrice);
                    $("#FilterSales_1").val(data.FilterSales);
                    $("#FilterTickets_1").val(data.FilterTickets);
                    $("#FilterAvgPrice_1").val(data.FilterAvgPrice);
                    
                    $("#AllSales_2").val(data.AllSales);
                    $("#AllTickets_2").val(data.AllTickets);
                    $("#AvgPrice_2").val( data.AvgPrice);
                    $("#FilterSales_2").val(data.NewFilterSales);
                    $("#FilterTickets_2").val(data.NewFilterTickets);
                    $("#FilterAvgPrice_2").val(data.NewFilterAvgPrice);
                    
                    qsTab1Grid = $("#table_1");
                    qsTab2Grid = $("#table_2");

                    loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isNew=0", qsTab1Grid);
                    loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isNew=1", qsTab2Grid);

/*                   ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {
                        var end = 100;
                        if (data != "")
                            end = data[0].max;
                        barChart.define("yAxis", {
                            start: 0,
                            step: 20,
                            end: end
                        })
                        barChart.clearAll();
                        barChart.parse(data, "json");
                    });
*/
                }
                //       qsAform.reloadOptions("PickZones", []);
                $("#PickZones").empty();

            });
        }
    });
    $("#txtEventId").change(function () {
        $("#PickZones").empty();
    });

   function QuickSearchInit() {

       $("#cbSaveQuickSearch").attr("checked",false);
       $("#cbSaveQuickSearch").attr('disabled', true);
       $("#txtEventId").attr('disabled', true);

       var cboQuickSearches =$("#cboQuickSearches");
       loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');
   }

   function CreateSearchInit() {
   }

   switch ($("#currentpage").val()) {
       case "1":
           QuickSearchInit();
           break;
       case "2":
           CreateSearchInit();
           break;
       case "3":
           loadManualScrapingCenterTab();
           break;
       case "4":
           loadStubHubDatabaseTab();
           break;
       case "5":
           loadScrapingLogTab();
           break;
   }