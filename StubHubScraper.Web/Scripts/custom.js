$(document).ready(function () {

    /*********************************Global Variable**********************************************/
    var RequestNum = 0;
    var ResponseNum = 0;
    var selected_TicketId = null;
    var selected_tableGridId = null;
    var selected_tableEventGridId = null;

    /******************************   Shared Function *******************************/

    function ajaxRequest(type, url, data, dataType) { // Ajax helper

        var options = {
            dataType: dataType || "json",
            contentType: "application/json",
            cache: false,
            type: type,
            data: data ? JSON.stringify(data) : null,
            success: function (data) {

                ResponseNum++;
                CheckEndProcess();
            },
            error: function (xhr, status, error) {

                LoadingOff();
               //var err = eval("(" + xhr.responseText + ")");
               // if (err.message == undefined)
               //      alert("undefined error");
               // else
                    alert("xhr:"+JSON.stringify(xhr)+" status:"+status+" error:"+error);

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
                    combo.append("<option value='" + v[valKey] + "'>" + v[showKey] + "</option>");
                });

                if (options.length > 0)

                    combo.val(options[0][0]);

                if (val != "")

                    combo.val(val);

            }
        }).fail(failCallback);
    }

    function loadGridData(url, grid, columnData) {

        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            grid.DataTable().clear();
            grid.DataTable().draw();

            $.each(data, function (i, v) {

                var row = [];

                $.each(columnData, function (j, k) {

                    row.push(v[columnData[j]]);
                });

                grid.DataTable().row.add(row);
                grid.DataTable().draw();
            });

        }).fail(function () {

            alert("Error when loading data!");

        });
    }

    function LoadingOn() {
        $("#loading").addClass("loading");
    }

    function LoadingOff() {

        $("#loading").removeClass("loading");
    }

    function CheckEndProcess() {
        if (RequestNum == ResponseNum) {
            LoadingOff();
        }
    }

    function InitLoad(reqnum) {
        RequestNum = reqnum;
        ResponseNum = 0;
        LoadingOn();
    }

    /*****************************Quick Search**************************************/

    function QuickDrawChart(chartData) {

        var chart = AmCharts.makeChart(

            "chart_1",
           {
               "type": "serial",
               "theme": "light",
               "fontFamily": 'Open Sans',
               "color": '#888888',
               "legend": {
                   "equalWidths": false,
                   "useGraphSettings": true,
                   "valueAlign": "left",
                   "valueWidth": 120
               },
               "dataProvider": chartData,
               "graphs": [{
                   "alphaField": "alpha",
                   "balloonText": "[[value]] ",
                   "dashLengthField": "dashLength",
                   "fillAlphas": 0.7,
                   "legendValueText": "[[value]]",
                   "title": "Volume",
                   "type": "column",
                   "valueField": "volume",
                   "valueAxis": "volumeAxis"
               }, {
                   "bullet": "square",
                   "bulletBorderAlpha": 1,
                   "bulletBorderThickness": 1,
                   "dashLengthField": "dashLength",
                   "legendValueText": "[[value]]",
                   "title": "Moving Average",
                   "fillAlphas": 0,
                   "valueField": "average",
                   "valueAxis": "averageAxis"
               }],
               "chartCursor": {
                   "categoryBalloonDateFormat": "DD",
                   "cursorAlpha": 0.1,
                   "cursorColor": "#000000",
                   "fullWidth": true,
                   "valueBalloonsEnabled": false,
                   "zoomable": false
               },
               "categoryField": "date",
               "exportConfig": {
                   "menuBottom": "20px",
                   "menuRight": "22px",
                   "menuItems": [{
                       "icon": App.getGlobalPluginsPath() + "amcharts/amcharts/images/export.png",
                       "format": 'png'
                   }]
               }
           });

        $('#chart_1').closest('.portlet').find('.fullscreen').click(function () {

            chart.invalidateSize();

        });
    }

    function QuickSearchInit() {

        $("#cbSaveQuickSearch").attr("checked", false);
        $("#cbSaveQuickSearch").attr('disabled', true);
        $("#txtEventId").attr('disabled', true);

        var cboQuickSearches = $("#cboQuickSearches");

        InitLoad(1);

        loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

        QuickDrawChart([]);
    }

    $("#getZones").click(function () {

        InitLoad(1);

        var eventId = $("#txtEventId").val();

        if (eventId != "") {

            ajaxRequest("get", "/api/eventzones/?eventId=" + eventId).done(function (data) {

                $.each(data, function (i, v) {

                    $("#PickZones").append("<option value='" + v["value"] + "'>" + v["text"] + "</option>")

                });


            });
        }
    });

    $("#cbDoNewQuickSearch").on("click", function () {

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

            QuickDrawChart([]);

        } else {

            $("#cbSaveQuickSearch").attr("checked", false);
            $("#cboQuickSearches").val("");
            $("#cbSaveQuickSearch").attr("disabled", true);
            $("#cboQuickSearches").attr("disabled", false);
            $("#txtEventId").attr("disabled", true);

        }
    });

    $("#btnQuickSearch").on("click", function () {

        if (!$("#cboQuickSearches").is(':disabled'))
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

        console.log("pickzones:" + zones);
        if (isChecked) isSave = 1;

        InitLoad(4);

        ajaxRequest("get", "/api/quicksearches/" + eventId + "?isNew=1&isSave=" + isSave + "&sectionFrom=" + sectionFrom + "&sectionTo=" + sectionTo + "&lastWeekSalesOnly=" + LastWeekSalesOnly + "&zones=" + zones).done(function (data) {

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
            var columnData = ["Zone", "Section", "Row", "Price", "Qty", "DateSold"];

            loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isSave=" + isSave, qsTab2Grid, columnData);

            var cboQuickSearches = $("#cboQuickSearches");
            cboQuickSearches.empty();
            loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

            ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {
                QuickDrawChart(data);
            });

        });

    });

    $("#btnExportToCSV").on("click", function () {

        var eventId = $("#txtEventId").val();
        var isChecked = $("#cbDoNewQuickSearch").is(':checked');
        var isNew = 0;

        if (isChecked) isNew = 1;

        window.location = "ExportToCSV/QuickSearchToCSV?eventid=" + eventId + "&isNew=" + isNew;
    });

    $("#cboQuickSearches").on("change", function () {

        if ($(this).val() != "") {

            InitLoad(4);

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
                    $("#AvgPrice_2").val(data.AvgPrice);
                    $("#FilterSales_2").val(data.NewFilterSales);
                    $("#FilterTickets_2").val(data.NewFilterTickets);
                    $("#FilterAvgPrice_2").val(data.NewFilterAvgPrice);

                    qsTab1Grid = $("#table_1");
                    qsTab2Grid = $("#table_2");
                    var columnData = ["Zone", "Section", "Row", "Price", "Qty", "DateSold"];

                    loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isNew=0", qsTab1Grid, columnData);
                    loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isNew=1", qsTab2Grid, columnData);

                    ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {

                        QuickDrawChart(data);

                    });

                }

                $("#PickZones").empty();

            });
        }
    });

    $("#txtEventId").on("change", function () {

        $("#PickZones").empty();

    });

    /*************************Create Search******************************************/

  

    function loadSearches() {

        var showArchivedSearches = $('#showArchivedSearches').is(':checked');
        var archived = 0;
        if (showArchivedSearches)
            archived = 1;

        var grid = $("#table_3");
        var columnData = ["Id", "Name", "ScheduleString", "ScanDayBefore", "Archived"];

        loadGridData("/api/search/?archived=" + archived, grid, columnData);
    }

    $("#table_3 tbody").on("click", "tr", function () {

        var searchId = $(this).find("td:first-child").html();
        selected_tableId = searchId;
        selected_tableEventGridId = null;

        var grid = $("#table_4");
        var columnData = ["Id", "EventId", "EventTitle", "EventVenue", "EventDate", "Active"];

        InitLoad(1);
        loadGridData("/api/searchevent/?searchId=" + searchId, grid, columnData);

        $("#Name").val($(this).find("td:nth-child(2)").html());
        $("#Schedule").val($(this).find("td:nth-child(3)").html());
        $("#ScanDayBefore").val($(this).find("td:nth-child(4)").html());

    });

    $("#table_4 tbody").on("click", "tr", function () {

        selected_tableEventGridId = $(this).find("td:first-child").html();


    });

    $("#btnReload").on("click", function () {
        InitLoad(1);
        loadSearches();
        selected_tableId = null;

    });

    $("#btnDeleteSelectedSearches").on("click", function () {

        if (selected_tableId != null) {
            InitLoad(2);
            ajaxRequest("delete", 'api/search/' + selected_tableId).done(function (data) {

                alert("The searchItem has been deleted!");
                selected_tableId = null;
                loadSearches();
            });
        }
        else
            alert("Please select a SearchItem!");
    });

    $("#btnDeleteSearchEvent").on("click", function () {

        if (selected_tableEventGridId != null) {
            InitLoad(2);
            ajaxRequest("delete", 'api/searchevent/' + selected_tableEventGridId).done(function (data) {

                alert("The SearchEvent has been delete!");

                var grid = $("#table_4");
                var columnData = ["Id", "EventId", "EventTitle", "EventVenue", "EventDate", "Active"];

                loadGridData("/api/searchevent/?searchId=" + searchId, grid, columnData);

                selected_tableEventGridId = null;

            });
        }
        else {
            alert("Please select a event.");
        }
    });

    $("#btnAddSearchEvent").on("click", function () {

        var eventId = Number($("#txtEventId").val());

        if (eventId == 0 || isNaN(eventId)) {
            alert("Invalid eventId");
        }
        else {

            var sTemp = { EventId: eventId, SearchId: searchId };

            InitLoad(2);
            ajaxRequest('post', '/api/searchevent/', sTemp).done(function (data) {

                alert("The event has been saved!");

                var grid = $("#table_4");
                var columnData = ["Id", "EventId", "EventTitle", "EventVenue", "EventDate", "Active"];

                loadGridData("/api/searchevent/?searchId=" + searchId, grid, columnData);

            });
        }
    });

    $("#btnScanLink").on("click", function () {

        

    });

    $("#btnAddSearch").on("click", function () {

        var sData = {
            Name: $("#Name").val(),
            Schedule: $("#Schedule").val(),
            ScanDayBefore: $("#ScanDayBefore").val(),
            Id: selected_tableGridId
        };
        InitLoad(2);
        ajaxRequest('post', '/api/search/', sData).done(function (data) {

            alert("The search has been saved!");
            loadSearches();

        });
    });

    $("#btnEditSearch").on("click", function () {

        var sData = {
            Name: $("#Name").val(),
            Schedule: $("#Schedule").val(),
            ScanDayBefore: $("#ScanDayBefore").val(),
            Id: selected_tableGridId
        };
        InitLoad(2);
        ajaxRequest('put', '/api/search/' + selected_tableGridId, sData).done(function (data) {
            alert("The search has been saved!");
            loadSearches();

        });
    });

    $("#btnClearSearchTemp").on("click", function () {

        var sData = {
            Name: $("#Name").val(),
            Schedule: $("#Schedule").val(),
            ScanDayBefore: $("#ScanDayBefore").val(),
            Id: selected_tableGridId
        };
        InitLoad(2);
        ajaxRequest("delete", 'api/searchevent/0').done(function (data) {

            alert("The SearchEvent has been empty!");

            var grid = $("#table_4");
            var columnData = ["Id", "EventId", "EventTitle", "EventVenue", "EventDate", "Active"];

            loadGridData("/api/searchevent/?searchId=" + searchId, grid, columnData);

            $("#Name").val("");
            $("#Schedule").val("");
            $("#ScanDayBefore").val(false);

        });
    });

    $("#btnSearchEvent").on("click", function () {
        var eventTitle = $("#txtEventTitle").val();
        var venue = $("#txtVenue").val();

        InitLoad(3);
        ajaxRequest("delete", 'api/bulksearch/0').done(function (data) {

            var eventsGrid = $("#bulkeventtable");
            var columnData = ["Scanned", "EventId", "EventTitle", "EventVenue", "EventDate"];

            var id_of_setinterval = setInterval(function () {
                loadGridData("/api/bulksearch", eventsGrid,columnData);
            }, 10000);

            $.ajax({
                url: "/api/bulksearch?title=" + eventTitle + "&venue=" + venue,
                type: "GET",
                success: function (data, textStatus, jqXHR) {
                    loadGridData("/api/bulksearch", eventsGrid, columnData);
                   
                    alert("Search complete!");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    LoadingOff()
                    if (jqXHR.responseJSON != undefined) {
                        alert(jqXHR.responseJSON.errors[0].message);
                    }
                },
                complete: function (XMLHttpRequest, status) {
                    LoadingOff()
                    clearInterval(id_of_setinterval);
                    if (status == 'timeout') {
                        //ajaxTimeoutTest.abort();
                        alert("timeout");
                    }
                }

            });
        });

    });

    $("#btnSearchSave").on("click", function () {
        var searchId = selected_tableId;
        var ids = "";

        /*
        eventsGrid.forEachRow(function (id) {

            var isChecked = eventsGrid.cells(id, 0).getValue();

            if (isChecked == 1) {
                ids += eventsGrid.cells(id, 1).getValue() + ",";
            }
        });
        if (ids == "") {
            alert("Please select at least 1 event.");
            return;
        }
        ajaxRequest('post', '/api/bulksearch/?searchId=' + searchId + '&ids=' + ids).done(function (data) {
            alert("Save successful!");

            var searchEventsGrid = $("#table_4");
            loadGridData("/api/searchevent/?searchId=" + searchId, searchEventsGrid);
            $('#bulksearch').modal('hide');
        });
        */
    });

    $("#btnSelectAll").on("click", function () {
       // eventsGrid.setCheckedRows(0, 1);
    });
    
    function CreateSearchInit() {

        InitLoad(1);
        loadSearches();

    }

    /*********************************Manual Scraping***********************************/

    function ManualScrapingInit() {

        $("#btnScrapingStop").attr("disabled", true);

        var cboSearches = $("#cboSearches");

        InitLoad(2);

        loadComboData(cboSearches, "/api/search/?archived=0", "Name", "Id", '');

        $("#btnScrapingStop_2").attr("disabled", true);

        ajaxRequest("get", "/api/scrapingmultisearches/").done(function (data) {

            $.each(data, function (i, v) {

                $("#multiSearches").append("<option value='" + v["value"] + "'>" + v["text"] + "</option>")

            });
        });
    }

    $("#cboSearches").on("change", function () {

        if ($(this).val() != "") {

            InitLoad(1);
            ajaxRequest("get", "/api/scrapingevent/?searchId=" + $(this).val()).done(function (data) {
                $.each(data, function (i, v) {
                 
                    $("#eventlist").append("<option value='" + v["value"] + "'>" + v["text"] + "</option>")
                });
            });
        }
        else {
            $("#eventlist").empty();
        }
    });

    $("#btnScrapingStart").on("click", function () {

        eventIds = $("#eventlist").val();

        $("#btnScrapingStop").attr("disabled", false);

        if (eventIds != "") {

            console.log(eventIds);
          
            ajaxRequest("get", "/api/scrapingevent/?ids=" + eventIds).done(function (data) {

                alert("Searching complete");
            });
        }
        else {

            alert("Please select at least 1 event.");
        }
    });

    $("#btnScrapingStop").on("click", function () {
        InitLoad(1);
        ajaxRequest("get", "/api/scrapingstop/").done(function (data) {

            alert("Searching stop");

        });
    });

    $("#btnDownload").on("click", function () {

        eventIds = $("#eventlist").val();

        if (eventIds != "")
            window.location = "ExportToCSV/ScrapingEventsToCSV?ids=" + eventIds;

    });

    $("#btnScrapingStart_2").on("click", function () {

        var searchIds = $("#multiSearches").val();

        if (searchIds != "") {

            //   InitLoad(1);
            ajaxRequest("get", "/api/scrapingmultisearches/?ids=" + searchIds).done(function (data) {

                alert("Searching complete");
            });
        }
        else {

            alert("Please select at least 1 searchItem");
        }
        $("#btnScrapingStop_2").attr("disabled", false);

    });

    $("#btnScrapingStop_2").on("click", function () {
        InitLoad(1);
        ajaxRequest("get", "/api/scrapingstop/").done(function (data) {
            alert("Searching stop");
        });
    });

    $("#btnDownload_2").on("click", function () {

        var searchIds = $("#multiSearches").val();

        if (searchIds != "")
            window.location = "ExportToCSV/ScrapingMultiSearchesToCSV?ids=" + searchIds;

    });

    /*******************************Ticket Data*****************************************/

    function TicketDrawChart(chartData) {

        var chart = AmCharts.makeChart(

            "chart_2",
           {
               "type": "serial",
               "theme": "light",
               "fontFamily": 'Open Sans',
               "color": '#888888',
               "legend": {
                   "equalWidths": false,
                   "useGraphSettings": true,
                   "valueAlign": "left",
                   "valueWidth": 120
               },
               "dataProvider": chartData,
               "graphs": [{
                   "alphaField": "alpha",
                   "balloonText": "[[value]] ",
                   "dashLengthField": "dashLength",
                   "fillAlphas": 0.7,
                   "legendValueText": "[[value]]",
                   "title": "Volume",
                   "type": "column",
                   "valueField": "volume",
                   "valueAxis": "volumeAxis"
               }, {
                   "bullet": "square",
                   "bulletBorderAlpha": 1,
                   "bulletBorderThickness": 1,
                   "dashLengthField": "dashLength",
                   "legendValueText": "[[value]]",
                   "title": "Moving Average",
                   "fillAlphas": 0,
                   "valueField": "average",
                   "valueAxis": "averageAxis"
               }],
               "chartCursor": {
                   "categoryBalloonDateFormat": "DD",
                   "cursorAlpha": 0.1,
                   "cursorColor": "#000000",
                   "fullWidth": true,
                   "valueBalloonsEnabled": false,
                   "zoomable": false
               },
               "categoryField": "date",
               "exportConfig": {
                   "menuBottom": "20px",
                   "menuRight": "22px",
                   "menuItems": [{
                       "icon": App.getGlobalPluginsPath() + "amcharts/amcharts/images/export.png",
                       "format": 'png'
                   }]
               }
           });

    }

    function TicketDataInit() {

        var searchlist = $("#SearchId");
        InitLoad(1);
        loadComboData(searchlist, "/api/search/?archived=0", "Name", "Id", '');

        TicketDrawChart([]);
    }

    $("#SearchId").on("change", function () {

        var eventlist = $("#EventId");

        if ($(this).val() != "") {

            eventlist.empty();
            InitLoad(1);
            loadComboData(eventlist, "/api/scrapingevent/?searchId=" + $(this).val(), "text", "value", '');
        }
        else {
            eventlist.empty();
        }

    });

    $("#btnLookupTickets").on("click", function () {

        var searchId = $("#SearchId").val();
        var eventId = $("#EventId").val();
        var eventTitle = $("#EventTitle").val();
        var eventVenue = $("#EventVenue").val();
        var startDate = $("#StartDate").val();
        var endDate = $("#EndDate").val();
        var zone = $("#Zone").val();
        var sectionForm = $("#SectionForm").val();
        var sectionTo = $("#SectionTo").val();
        var lastWeekSalesOnly = $("#LastWeekSalesOnly").val();
        var hidePastEvents = $("#HidePastEvents").val();
        var showArchivedSearches = $("#ShowArchivedSearches").val();

        if (searchId == "")
            searchId = 0;
        if (eventId == "")
            eventId = 0;

        var sdBtab1Grid = $("#table_5");
        var sdBtab2Grid = $("#table_6");
        var columnData1 = ["Id", "Title", "Venue", "Date", "Sales", "TicketsCount", " AvgPrice"];
        var columnData2 = ["Id", "EventId", "EventTitle", "EventVenue", "EventDate", "Zone", "Section", "Row", "Price", "Qty", "DateSold"];

        InitLoad(3);

        loadGridData("/api/lookupevents/?searchId=" + searchId + "&eventId=" + eventId
            + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
            + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
            + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches, sdBtab1Grid, columnData1);

        loadGridData("/api/lookuptickets/?searchId=" + searchId + "&eventId=" + eventId
            + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
            + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
            + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches, sdBtab2Grid, columnData2);

        ajaxRequest("get", "/api/eventschart/?searchId=" + searchId + "&eventId=" + eventId
            + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
            + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
            + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches).done(function (data) {

                TicketDrawChart(data);

            });

    });

    $("#btnExportTicketsToCSV").on("click", function () {

        var ids = "";

        sdBtab1Grid = $("#table_5");

        sdBtab1Grid.column(0)
                   .data()
                   .each(function (value, index) {

                       ids += value + ",";

                   });

        if (ids != "")

            window.location = "ExportToCSV/LookupTicketsToCSV?ids=" + ids;

    });

    $("#table_6 tbody").on("click", "tr", function () {

        selected_TicketId = $(this).find("td:first-child").html();

    });

    $("#btnDeleteSelectedTickets").on("click", function () {

        if (selected_TicketId != null) {
            InitLoad(2);
            ajaxRequest("delete", 'api/lookuptickets/' + selected_TicketId).done(function (data) {

                alert("The ticket has been deleted!");

                var searchId = $("#SearchId").val();
                var eventId = $("#EventId").val();
                var eventTitle = $("#EventTitle").val();
                var eventVenue = $("#EventVenue").val();
                var startDate = $("#StartDate").val();
                var endDate = $("#EndDate").val();
                var zone = $("#Zone").val();
                var sectionForm = $("#SectionForm").val();
                var sectionTo = $("#SectionTo").val();
                var lastWeekSalesOnly = $("#LastWeekSalesOnly").val();
                var hidePastEvents = $("#HidePastEvents").val();
                var showArchivedSearches = $("#ShowArchivedSearches").val();
                if (searchId == "")
                    searchId = 0;
                if (eventId == "")
                    eventId = 0;

                sdBtab2Grid = $("#table_6");
                var columnData2 = ["Id", "EventId", "EventTitle", "EventVenue", "EventDate", "Zone", "Section", "Row", "Price", "Qty", "DateSold"];

                loadGridData("/api/lookuptickets/?searchId=" + searchId + "&eventId=" + eventId
                    + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
                    + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
                    + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches, sdBtab2Grid, columnData2);

                selected_TicketId = null;

            });
        }
        else
            alert("Please select a ticket!");

    });

    /*******************************Searching Log*****************************************/

    function SearchingLogInit() {
        var appLogGrid = $("#table_7");
        var columnData = ["CreatedOnUtc", "Message"];
        InitLoad(1);
        loadGridData("/api/applog/", appLogGrid, columnData);
    }

    /**********************************User Mangement***********************************/
    function loadUsers() {
        InitLoad(1);
        var ColumnData = ["Id", "UserName", "Password", "IsAdmin", "ApiUserName", "ApiPassword", "Environment", "ConsumerKey", "ConsumerSecret", "ApplicationToken"];
        var userGrid = $("#table_9");

        loadGridData("/api/users/", userGrid, ColumnData);
    }

    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }

    function userformvalidate() {
        if (document.newForm.UserName.value == "") {

            document.newForm.UserName.focus();
            return false;

        } else {
            if (!validateEmail(document.newForm.UserName.value)) {

                document.newForm.UserName.focus();
                return false;
            }
        }

        if (document.newForm.Password.value == "") {

            document.newForm.Password.focus();
            return false;
        }
        if (document.newForm.APIUserName.value == "") {

            document.newForm.APIUserName.focus();
            return false;
        } else {
            if (!validateEmail(document.newForm.APIUserName.value)) {

                document.newForm.APIUserName.focus();
                return false;
            }
        }
        if (document.newForm.APIPassword.value == "") {

            document.newForm.APIPassword.focus();
            return false;
        }
        if (document.newForm.Environment.value == "") {

            document.newForm.Environment.focus();
            return false;
        }
        if (document.newForm.ConsumerKey.value == "") {

            document.newForm.ConsumerKey.focus();
            return false;
        }
        if (document.newForm.ConsumerSecretKey.value == "") {

            document.newForm.ConsumerSecretKey.focus();
            return false;
        }
        if (document.newForm.ApplicationToken.value == "") {

            document.newForm.ApplicationToken.focus();
            return false;
        }
        return (true);

    }

    function UserMangementInit() {
        loadUsers();
    }

    $("#btnnewuser").on("click", function () {
        $("#apipassword").val("");
        $("#apiusername").val("");
        $("#applicationtoken").val("");
        $("#consumerkey").val("");
        $("#consumersecretkey").val("");
        $("#environment").val("");
        $("#isadmin").prop('checked', false);
        $("#password").val("");
        $("#username").val("");
    });

    $("#btnCreateuser").on("click", function () {
        if (userformvalidate()) {
            var type = 'POST';
            var userData = {
                ApiPassword: $("#apipassword").val(),
                ApiUserName: $("#apiusername").val(),
                ApplicationToken: $("#applicationtoken").val(),
                ConsumerKey: $("#consumerkey").val(),
                ConsumerSecret: $("#consumersecretkey").val(),
                Environment: $("#environment").val(),
                IsAdmin: $("#isadmin").is(':checked') ? 1 : 0,
                Password: $("#password").val(),
                UserName: $("#username").val()
            };
            ajaxRequest('post', '/api/users/', userData).done(function (data) {
                alert("The user has been saved!");
                loadUsers();
                $('#new_user').modal('hide');
            });

        }
    });

    $("#table_9").on("click", "tr", function () {
      
        $("#update_user").modal('show');

        $("#updateuserid").val($(this).find("td:nth-child(1)").html());
        $("#updateusername").val($(this).find("td:nth-child(2)").html());
        $("#updatepassword").val($(this).find("td:nth-child(3)").html());
        $(this).find("td:nth-child(4)").html() == 'true' ? $("#updateisadmin").prop('checked', true) : $("#updateisadmin").prop('checked',false);
        $("#updateapiusername").val($(this).find("td:nth-child(5)").html());
        $("#updateapipassword").val($(this).find("td:nth-child(6)").html());
        $("#updateenvironment").val($(this).find("td:nth-child(7)").html());
        $("#updateconsumerkey").val($(this).find("td:nth-child(8)").html());
        $("#updateconsumersecretkey").val($(this).find("td:nth-child(9)").html());
        $("#updateapplicationtoken").val($(this).find("td:nth-child(10)").html());

        $("#updateisadmin").prop('checked', true);
      
    });
    $("#btnupdateuser").on("click", function (event) {
        event.preventDefault();
       
        var userData = {
            Id:$("#updateuserid").val(),
            ApiUserName: $("#updateapiusername").val(),            ApiPassword: $("#updateapipassword").val(),

            ApplicationToken: $("#updateapplicationtoken").val(),
            ConsumerKey: $("#updateconsumerkey").val(),
            ConsumerSecret: $("#updateconsumersecretkey").val(),
            Environment: $("#updateenvironment").val(),
            IsAdmin: $("#updateisadmin").is(':checked') ? 1 : 0,
            Password: $("#updatepassword").val(),
            UserName: $("#updateusername").val()
        };

        ajaxRequest("put", "/api/users/" + userData.ID, userData).done(function (data) {
            alert("This user has been updated!");
            $("#updateForm").modal('hide');
        });

    });

    /***********************************Other ********************************************/
  
    $("#logout").on("click", function (event) {
        event.preventDefault();
        $("#logoutForm").submit();

    });

    /***********************************Initionalize*************************************/

    switch ($("#currentpage").val()) {

        case "1":
            console.log("Here is QuickSearch");
            QuickSearchInit();
            break;
        case "2":
            console.log("Here is CreateSearch");
            CreateSearchInit();
            break;
        case "3":
            console.log("Here is ManualScraping");
            ManualScrapingInit();
            break;
        case "4":
            console.log("Here is TicketData");
            TicketDataInit();
            break;
        case "5":
            console.log("Here is SearingLog");
            SearchingLogInit();
            break;
        case "6":
            console.log("Here is UserManagement");
            UserMangementInit();
            break;
        default:
            break;
    }

    if (jQuery().datepicker) {
        $('.date-picker').datepicker({
            rtl: App.isRTL(),
            orientation: "left",
            autoclose: true
        });
    }

});