    function getSearchId() {
       
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
   
/*****************************Quick Search**********************************/
    function drawChart(chartData) {
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

    function loadGridData(url, grid) {
        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            grid.DataTable().clear();
            grid.DataTable().draw();

            $.each(data, function (i, v) {
                grid.DataTable().row.add([v["Zone"], v["Section"], v["Row"], v["Price"], v["Qty"], v["DateSold"]]);
                grid.DataTable().draw();
            });


        }).fail(function () {
            alert("Error when loading data!");
        });
    }

    function QuickSearchInit() {

        $("#cbSaveQuickSearch").attr("checked", false);
        $("#cbSaveQuickSearch").attr('disabled', true);
        $("#txtEventId").attr('disabled', true);

        var cboQuickSearches = $("#cboQuickSearches");
        loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

        var chartData = [];
        drawChart(chartData);
    }

    $("#getZones").click(function () {
        var l = Ladda.create(this);
        l.start();

        var eventId = $("#txtEventId").val();
        if (eventId != "") {
            ajaxRequest("get", "/api/eventzones/?eventId=" + eventId).done(function (data) {
              
                $.each(data, function (i, v) {
                    console.log(v);
                    $("#PickZones").append("<option value='" + v["value"] + "'>" + v["text"] + "</option>")
                });

                l.stop();
            });
        }
    });
    $("#cbDoNewQuickSearch").on("click",function () {

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
         
            drawChart([]);

        } else {
            $("cbSaveQuickSearch").attr("checked", false);
            $("cboQuickSearches").val("");
            $("cbSaveQuickSearch").attr("disabled", true);
            $("cboQuickSearches").attr("disabled", false);
            $("txtEventId").attr("disabled", true);
        }
    });
    $("#btnQuickSearch").on("click",function () {
       
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

        var l = Ladda.create(this);
        l.start();
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
            loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isSave=" + isSave, qsTab2Grid);

            var cboQuickSearches = $("#cboQuickSearches");
            cboQuickSearches.empty();
            loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

            ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {
                drawChart(data);
                l.stop();
            });
            
        });

    });
    $("#btnExportToCSV").on("click",function () {
        var eventId = $("#txtEventId").val();
        var isChecked = $("#cbDoNewQuickSearch").is(':checked');
        var isNew = 0;
        if (isChecked) isNew = 1;
        window.location = "ExportToCSV/QuickSearchToCSV?eventid=" + eventId + "&isNew=" + isNew;
    });
    $("#cboQuickSearches").on("change",function () {
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

                    ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {
                     drawChart(data);
                    });

                }
                $("#PickZones").empty();

            });
        }
    });
    $("#txtEventId").on("change",function () {
        $("#PickZones").empty();
    });
    
/*************************Create Search*************************************/
    function showBulkSearchWindow() {

    }
    function loadSearchGridData(url) {
        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            grid = $("#table_3");
            grid.DataTable().clear();
            grid.DataTable().draw();

            $.each(data, function (i, v) {
                grid.DataTable().row.add([v["Id"], v["Name"], v["ScheduleString"], v["ScanDayBefore"], v["Archived"]]);
                grid.DataTable().draw();
            });

        }).fail(function () {
            alert("Error when loading data!");
        });
    }
    function loadSearchEventsGridData(url) {
        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            grid = $("#table_4");
            grid.DataTable().clear();
            grid.DataTable().draw();

            $.each(data, function (i, v) {
                grid.DataTable().row.add([v["Id"],v["EventId"], v["EventTitle"], v["EventVenue"], v["EventDate"], v["Active"]]);
                grid.DataTable().draw();
            });
           
        }).fail(function () {
            alert("Error when loading data!");
        });
    }
    function loadSearches() {
        var showArchivedSearches = $('#showArchivedSearches').is(':checked');
        var archived = 0;
        if (showArchivedSearches)
            archived = 1;
      
        loadSearchGridData("/api/search/?archived=" + archived);
    }
   
    
    var selected_tableGridId = null;
    var selected_tableEventGridId = null;
    $("#table_3 tbody").on("click","tr",function () {
        var searchId = $(this).find("td:first-child").html();
        selected_tableId = searchId;
        selected_tableEventGridId=null;
        // loadSearchEventsGridData("/api/searchevent/?searchId=" + searchId);

        $("#Name").val($(this).find("td:nth-child(1)").html());
        $("#Schedule").val($(this).find("td:nth-child(2)").html());
        $("#ScanDayBefore").val($(this).find("td:nth-child(3)").html());
      
    });

    $("#table_4 tbody").on("click", "tr", function () {
       selected_tableEventGridId =  $(this).find("td:first-child").html();
    });

   //searchesGrid.attachEvent("onBeforeContextMenu", 
    $("#btnReload").on("click", function () {
        loadSearches();
        selected_tableId = null;
    });

    $("#btnDeleteSelectedSearches").on("click", function () {
        if (selected_tableId != null) {          
            ajaxRequest("delete", 'api/search/' + selected_tableId).done(function (data) {
                alert("The searchItem has been deleted!");
                selected_tableId=null;
                loadSearches();
            });
            
        }
        else
           alert("Please select a SearchItem!");
    });


   
    $("#btnDeleteSearchEvent").on("click",function() {
        
        if (selected_tableEventGridId != null) {           
            ajaxRequest("delete", 'api/searchevent/' + selected_tableEventGridId).done(function (data) {
                alert("The SearchEvent has been delete!");
                loadSearchEventsGridData("/api/searchevent/?searchId=" + selected_tableGridId + "&sync=0");
                selected_tableEventGridId=null;
            });
        }
        else {
            alert("Please select a event.");
        }
    });

    $("#btnAddSearchEvent").on("click",function() {
        var eventId = Number($("#txtEventId").val());
        if (eventId == 0 || isNaN(eventId)) {
            alert("Invalid eventId");
        }
        else {
            var sTemp = { EventId: eventId, SearchId: searchId };
            ajaxRequest('post', '/api/searchevent/', sTemp).done(function (data) {
                alert("The event has been saved!");
                loadSearchEventsGridData("/api/searchevent/?searchId=" + selected_tableGridId);
            });
        }


    });

    $("#btnScanLink").on("click",function() {
        showBulkSearchWindow();
    });

    $("#btnAddSearch").on("click", function () {
        var sData = {
            Name: $("#Name").val(),
            Schedule: $("#Schedule").val(),
            ScanDayBefore: $("#ScanDayBefore").val(),
            Id: selected_tableGridId
        };

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

        ajaxRequest("delete", 'api/searchevent/0').done(function (data) {
            alert("The SearchEvent has been empty!");
            loadSearchEventsGridData("/api/searchevent/?searchId=" + selected_tableGridId + "&sync=0");

            $("#Name").val("");
            $("#Schedule").val("");
            $("#ScanDayBefore").val(false);
        });
    });

    function CreateSearchInit() {
        loadSearches();
    }
/*********************************Manual Scraping*******************************************/
    function ManualScrapingInit() {
        $("#btnScrapingStop").attr("disabled",true);
        var cboSearches = $("#cboSearches");
        loadComboData(cboSearches, "/api/search/?archived=0", "Name", "Id", '');

        $("#btnScrapingStop_2").attr("disabled", true);
        ajaxRequest("get", "/api/scrapingmultisearches/").done(function (data) {
            $.each(data, function (i, v) {
                console.log(v);
                $("#multiSearches").append("<option value='" + v["value"] + "'>" + v["text"] + "</option>")
            });
        });
    }

    $("#cboSearches").on("click", function () {
        if ($(this).val() != "") {
            ajaxRequest("get", "/api/scrapingevent/?searchId=" + $(this).val()).done(function (data) {
                $.each(data, function (i, v) {
                    console.log(v);
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
        $("#btnScrapingStop").attr("disabled",false);
        //   manualScrapingCenter.cells('c').progressOn();
        if (eventIds != "") {
            ajaxRequest("get", "/api/scrapingevent/?ids=" + eventIds).done(function (data) {
               //manualScrapingCenter.cells('c').progressOff();
               alert("Searching complete");
            });
        }
        else {
            //manualScrapingCenter.cells('c').progressOff();
            alert("Please select at least 1 event.");
        }
    });

    $("#btnScrapingStop").on("click", function () {
        ajaxRequest("get", "/api/scrapingstop/").done(function (data) {
            //manualScrapingCenter.cells("c").progressOff();
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
           // manualScrapingCenter.cells("c").progressOn();
            ajaxRequest("get", "/api/scrapingmultisearches/?ids=" + searchIds).done(function (data) {
                //manualScrapingCenter.cells("c").progressOff();
                alert("Searching complete");
            });
        }
        else {
           // manualScrapingCenter.cells("c").progressOff();
            alert("Please select at least 1 searchItem");
        }
        $("#btnScrapingStop").attr("disabled",false);
    });
    $("#btnScrapingStop_2").on("click", function () {
        ajaxRequest("get", "/api/scrapingstop/").done(function (data) {
           // manualScrapingCenter.cells("c").progressOff();
            alert("Searching stop");
        });
    });
    $("#btnDownload_2").on("click", function () {
        var searchIds = $("#multiSearches").val();
        if (searchIds != "")
            window.location = "ExportToCSV/ScrapingMultiSearchesToCSV?ids=" + searchIds;

    });

/*******************************Ticket Data*****************************************/
    function TicketDataInit() {

    }

/*******************************Searching Log*****************************************/
    function SearchingLogInit() {

    }


   

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
           loadScrapingLogTab();
           break;
   }