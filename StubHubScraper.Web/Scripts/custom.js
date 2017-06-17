

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
    function getSearchId() {
        //  var sIndex = searchesGrid.getSelectedRowId();
        //  var searchId = 0;
        //  if (sIndex != null) {
        //      searchId = searchesGrid.cells(sIndex, 0).getValue();
        //  }
        //  return searchId;
    }

    function loadGridData(url, grid) {
        ajaxRequest("get", url).done(function (data) {

            var tData = {};
            tData.total_count = data.length;
            tData.pos = 0;
            tData.data = data;

            //grid.clearAll();
            //grid.parse(tData, "js");

            console.log("init grid");

        }).fail(function () {
            alert("Error when loading data!");
        });
    }
    function loadSearches() {
        // var showArchivedSearches = $('#showArchivedSearches').is(':checked');
        // var archived = 0;
        // if (showArchivedSearches)
        //     archived = 1;
        // loadGridData("/api/search/?archived=" + archived, searchesGrid);
    }

    $("#getZones").click(function () {
        alert("Click GetZones");
    });
    $("#btnQuickSearch").click(function () {
        alert("Click btnQuickSearch");
    });
    $("#btnExportToCSV").click(function () {
        alert("Click btnExportToCSV");
    });
    $("#deleteQuickSearchItem").click(function () {
        alert("Click deleteQuickSearchItem");
    });

    $("#txtEventId").change(function () {
        alert("Change txtEventID");
    });
    $("#cbDoNewQuickSearch").click(function () {
      
        if ($(this).is(':checked')) {
                
                $("#cbSaveQuickSearch").attr('disabled', 'enabled');
                $("#cboQuickSearches").attr('disabled', 'disabled');
                $("#txtEventId").attr('disabled', 'enabled');
                $("#cboQuickSearches").val("");
                $("#txtEventId").val("");
                $("#SectionFrom").val("");
                $("#SectionTo").val("");
                $("#LastWeekSalesOnly").attr("checked",false);
                $("#AllSales_1").val("");
                $("#AllTickets_1").val("");
                $("#AvgPrice_1").val("");
                $("#FilterSales_1").val("");
                $("#FilterTickets_1").val("");
                $("#FilterAvgPrice_1").val|("");
                $("#AllSales_2").val("");
                $("#AllTickets_2").val("");
                $("#AvgPrice_2").val("");
                $("#FilterSales_2").val("");
                $("#FilterTickets_2").val("");
                $("#FilterAvgPrice_2").val | ("");

                $("#table_1 > tbody").empty();
                $("#table_2 > tbody").empty();
                $("#PickZones").empty();
             //   barChart.clearAll();
             //   barChart.parse([], "json");

        } else {
            $("cbSaveQuickSearch").attr("checked",false);
            $("cboQuickSearches").val("");
            $("cbSaveQuickSearch").attr("disabled","disabled");
            $("cboQuickSearches").attr("disabled","enabled");
            $("txtEventId").attr("disabled","disabled");
        }
    });   

    $("#cbSaveQuickSearch").click(function () {
        if ($(this).is(':checked')) {
           
        }
    });

    $("#cboQuickSearches").change(function () {
        if ($(this).val() != "") {
            ajaxRequest("get", "/api/quicksearches/" + value + "?isNew=0&isSave=0").done(function (data) {
                if (data.Id != undefined) {
                    qsAform.setFormData({
                        txtEventId: data.EventId,
                        SectionFrom: data.SectionFrom,
                        SectionTo: data.SectionTo,
                        LastWeekSalesOnly: data.LastWeekSalesOnly
                    });
                    qsTab1Form.setFormData({
                        AllSales: data.AllSales,
                        AllTickets: data.AllTickets,
                        AvgPrice: data.AvgPrice,
                        FilterSales: data.FilterSales,
                        FilterTickets: data.FilterTickets,
                        FilterAvgPrice: data.FilterAvgPrice
                    });
                    qsTab2Form.setFormData({
                        AllSales: data.AllSales,
                        AllTickets: data.AllTickets,
                        AvgPrice: data.AvgPrice,
                        FilterSales: data.NewFilterSales,
                        FilterTickets: data.NewFilterTickets,
                        FilterAvgPrice: data.NewFilterAvgPrice
                    });

                    loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isNew=0", qsTab1Grid);
                    loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isNew=1", qsTab2Grid);
                    ajaxRequest("get", "/api/chartdata/?quickId=" + data.Id).done(function (data) {
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
                }
                qsAform.reloadOptions("PickZones", []);

            });
        }
    });
   
    init();
   function  init(){
       $("#cbSaveQuickSearch").attr("checked",false);
       $("#cbSaveQuickSearch").attr('disabled', 'disabled');
       $("#txtEventId").attr('disabled', 'disabled');

       var cboQuickSearches =$("#cboQuickSearches");
       loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');
   }