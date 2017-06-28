//Global Settings
var imgPath = {
    'root': '/Content/imgs/',
    'grid': '/Content/imgs/',
    'toolbar': '/Content/imgs/toolbar/',
},
tabs,
searchesGrid,
searchEventsGrid,
mainLayout;

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
                dhtmlx.message({ type: "error", text: '<b>' + error + '</b>' });
            else
                dhtmlx.message({ type: "error", text: '<b>' + error + '</b>' + "</br>" + err.message });
        }
    };
    var antiForgeryToken = $("#antiForgeryToken").val();
    if (antiForgeryToken) {
        options.headers = {
            'RequestVerificationToken': antiForgeryToken
        }
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
            });
            combo.addOption(options);

            if (options.length > 0) combo.setComboValue(options[0][0]);

            if (val != "") combo.setComboValue(val);
        }
    }).fail(failCallback);
}

function showUsersWindow() {
    var windows = new dhtmlXWindows();
    var userId = 0;

    usersWindow = windows.createWindow('usersWindow', 0, 0, 960, 550);
    usersWindow.setText('All Users');
    usersWindow.centerOnScreen();

    //toolbar
    var userToolbar = usersWindow.attachToolbar();
    userToolbar.setIconsPath(imgPath.toolbar);
    var userToolbarXML = "<toolbar>";
    userToolbarXML += '<item type="button" id="addButton" img="add.png" title="Add User"/>';
    userToolbarXML += "</toolbar>";
    userToolbar.loadStruct(userToolbarXML);

    userToolbar.attachEvent("onClick", function (id) {
        if (id == "addButton") {
            loadAddUserWindow();
        }
    });

    //grid
    usersGrid = usersWindow.attachGrid();
    usersGrid.setIconsPath(imgPath.grid);
    usersGrid.setHeader(["Id", "UserName", "Password", "IsAdmin", "API UserName", "API Password", "Environment", "ConsumerKey", "ConsumerSecret", "Application Token"]);
    usersGrid.setColTypes("ro,ed,ed,ch,ed,ed,ed,ed,ed,ed");
    usersGrid.setColSorting('str,str,str,str,str,str,str,str,str,str');
    usersGrid.setColumnIds("Id,UserName,Password,IsAdmin,ApiUserName,ApiPassword,Environment,ConsumerKey,ConsumerSecret,ApplicationToken");
    usersGrid.setColumnHidden(0, true);
    usersGrid.setInitWidthsP("0,15,10,8,15,10,10,10,10,15");

    usersGrid.init();

    usersGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2) {
            if (nValue != oValue) {
                var user = { Id: usersGrid.cells(rId, 0).getValue() };

                user.UserName = usersGrid.cells(rId, 1).getValue();
                user.Password = usersGrid.cells(rId, 2).getValue();
                user.IsAdmin = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
                user.ApiUserName = usersGrid.cells(rId, 4).getValue();
                user.ApiPassword = usersGrid.cells(rId, 5).getValue();
                user.Environment = usersGrid.cells(rId, 6).getValue();
                user.ConsumerKey = usersGrid.cells(rId, 7).getValue();
                user.ConsumerSecret = usersGrid.cells(rId, 8).getValue();
                user.ApplicationToken = usersGrid.cells(rId, 9).getValue();
                //update the order
                ajaxRequest("put", "/api/users/" + usersGrid.cells(rId, 0).getValue(), user).done(function (data) {
                    dhtmlx.message("This user has been updated!");
                });

            }
            return true;
        }

        return true;
    });
    usersGrid.attachEvent("onCheck", function (rId, cInd, state) {
        var user = { Id: usersGrid.cells(rId, 0).getValue() };
        if (cInd == 3) {
            user.IsAdmin = state;
        }
        //update the order
        ajaxRequest("put", "/api/users/" + usersGrid.cells(rId, 0).getValue(), user).done(function (data) {
            dhtmlx.message("This user has been updated!");
        });
    });

    loadUsers();

}
function getSearchId() {
    var sIndex = searchesGrid.getSelectedRowId();
    var searchId = 0;
    if (sIndex != null) {
        searchId = searchesGrid.cells(sIndex, 0).getValue();
    }
    return searchId;
}
function loadAddUserWindow() {
    var windows = new dhtmlXWindows();
    var addUserWindow = windows.createWindow('addUserWindow', 400, 200, 453, 390);
    var addUserToolbar = addUserWindow.attachToolbar();
    addUserToolbar.setIconsPath(imgPath.toolbar);

    addUserToolbar.loadStruct('<toolbar><item type="button" id="saveUserBtn" img="up.png" title="Save"/><item type="button" id="cancelAccountBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addUserToolbar.attachEvent("onClick", function (id) {
        if (id == "saveUserBtn") {
            if (!userFrom.validate()) return false;

            var userData = userFrom.getFormData();
            addUserWindow.progressOn();
            addUserToolbar.disableItem("saveUserBtn");
            var type = 'POST';
            ajaxRequest('post', '/api/users/', userData).done(function (data) {
                dhtmlx.message("The user has been saved!");
                loadUsers();
                addUserWindow.progressOff();
                addUserWindow.close();
            });
        } else {
            addUserWindow.close();
        }
    });
    var str = [
        {
            type: "input",
            name: "UserName",
            label: "UserName:",
            labelWidth: 120,
            inputWidth: 200,
            validate: "ValidEmail",
            required: true
        }, {
            type: "password",
            name: "Password",
            label: "Password:",
            labelWidth: 120,
            inputWidth: 200,
            validate: "NotEmpty",
            required: true
        },
    {
        type: "checkbox",
        name: "IsAdmin",
        label: "Is Admin",
        //position: "label-right",
        labelWidth: 120,
        inputWidth: 200
        //offsetLeft: 120
    },
     {
         type: "input",
         name: "ApiUserName",
         label: "API UserName:",
         labelWidth: 120,
         inputWidth: 200,
         validate: "ValidEmail",
         required: true
     },
      {
          type: "input",
          name: "ApiPassword",
          label: "API Password:",
          labelWidth: 120,
          inputWidth: 200,
          required: true
      },
    {
        type: "input",
        name: "Environment",
        label: "Environment:",
        labelWidth: 120,
        inputWidth: 200,
        required: true
    },
    {
        type: "input",
        name: "ConsumerKey",
        label: "Consumer Key:",
        labelWidth: 120,
        inputWidth: 200,
        required: true
    },
        {
            type: "input",
            name: "ConsumerSecret",
            label: "Consumer Secret:",
            labelWidth: 120,
            inputWidth: 200,
            required: true
        },
    {
        type: "input",
        name: "ApplicationToken",
        label: "Application Token:",
        labelWidth: 120,
        inputWidth: 200,
        required: true
    }
    ];

    var userFrom = addUserWindow.attachForm(str);

    addUserWindow.setText('Add User');
}
function loadUsers() {
    usersWindow.progressOn();
    ajaxRequest("get", "/api/users/").done(function (data) {

        var userData = {};
        userData.total_count = data.length;
        userData.pos = 0;
        userData.data = data;

        usersGrid.clearAll();
        
        console.log(userData);

        usersGrid.parse(userData, "js");

        usersWindow.progressOff();

        //if (usersGrid.getRowsNum() > 0) {
        //    usersGrid.selectRow(0, true);
        //}

    }).fail(function () {
        usersWindow.progressOff();
        alert("Error when loading users!");
    });
}
function loadGridData(url, grid) {
    ajaxRequest("get", url).done(function (data) {

        var tData = {};
        tData.total_count = data.length;
        tData.pos = 0;
        tData.data = data;

        grid.clearAll();
        grid.parse(tData, "js");

    }).fail(function () {
        alert("Error when loading data!");
    });
}
function loadSearches() {
    var showArchivedSearches = $('#showArchivedSearches').is(':checked');
    var archived = 0;
    if (showArchivedSearches)
        archived = 1;
    loadGridData("/api/search/?archived=" + archived, searchesGrid);
}
function showBulkSearchWindow() {
    var windows = new dhtmlXWindows();
    searchWindow = windows.createWindow('BulkSearchWindow', 0, 0, 800, 450);
    searchWindow.setText('Bulk Search');
    searchWindow.centerOnScreen();
    var searchWindowLayout = searchWindow.attachLayout("2E");
    searchWindowLayout.cells("b").setHeight(38);
    searchWindowLayout.cells("a").hideHeader();
    searchWindowLayout.cells("b").hideHeader();
    var searchToolbar = searchWindowLayout.cells("a").attachToolbar();
    searchToolbar.setIconsPath(imgPath.toolbar);
    searchToolbar.addText('lblEventTitle', 100, 'Event title:');
    searchToolbar.addInput('txtEventTitle', 100, '', 300);
    searchToolbar.addText('lblVenue', 100, 'Venue:');
    searchToolbar.addInput('txtVenue', 100, '', 200);
    searchToolbar.addSeparator('Separator', 6);
    searchToolbar.addButton('btnSearchEvent', 100, 'Search', null, null);
    searchToolbar.attachEvent("onClick", function (id) {
        if (id == "btnSearchEvent") {
            searchWindow.progressOn();
            var eventTitle = searchToolbar.getValue("txtEventTitle");
            var venue = searchToolbar.getValue("txtVenue");
            ajaxRequest("delete", 'api/bulksearch/0').done(function (data) {
                var id_of_setinterval = setInterval(function () {
                    loadGridData("/api/bulksearch", eventsGrid);
                }, 10000);

                $.ajax({
                    url: "/api/bulksearch?title=" + eventTitle + "&venue=" + venue,
                    type: "GET",
                    success: function (data, textStatus, jqXHR) {
                        loadGridData("/api/bulksearch", eventsGrid);
                        searchWindow.progressOff();
                        dhtmlx.alert("Search complete!");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {

                        searchWindow.progressOff();
                        if (jqXHR.responseJSON != undefined) {
                            dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                        }
                    },
                    complete: function (XMLHttpRequest, status) {
                        searchWindow.progressOff();
                        clearInterval(id_of_setinterval);
                        if (status == 'timeout') {
                            ajaxTimeoutTest.abort();
                            dhtmlx.alert("timeout");
                        }
                    }

                });
            });
        }
    });

    //grid
    var eventsGrid = searchWindowLayout.cells("a").attachGrid();
    eventsGrid.setIconsPath(imgPath.grid);
    eventsGrid.setHeader(["", "Event Id", "Event Title", "Venue", "Event Date"]);
    eventsGrid.setColTypes("ch,ro,ro,ro,ro");
    eventsGrid.setColSorting('str,str,str,str,str');
    eventsGrid.setColumnIds("Scanned,EventId,EventTitle,EventVenue,EventDate");
    eventsGrid.setInitWidthsP("5,10,50,20,15");
    eventsGrid.init();
    var searchWindowButton = searchWindowLayout.cells("b").attachForm();
    var searchWindowButtonData = [

        {
            type: "button",
            value: "Select All",
            name: "btnSelectAll"
        },
        { type: "newcolumn" },
        {
            type: "button",
            value: "Save",
            name: "btnSave"
        },
    { type: "newcolumn" },
    {
        type: "button",
        value: "Cancel",
        name: "btnCancel"
    }];
    searchWindowButton.loadStruct(searchWindowButtonData, 'json');
    searchWindowButton.attachEvent("onButtonClick", function (name) {
        if (name == "btnSave") {
            var searchId = getSearchId();
            var ids = "";
            eventsGrid.forEachRow(function (id) {
                var isChecked = eventsGrid.cells(id, 0).getValue();
                if (isChecked == 1) {
                    ids += eventsGrid.cells(id, 1).getValue() + ",";
                }
            });
            if (ids == "") {
                dhtmlx.alert("Please select at least 1 event.");
                return;
            }
            ajaxRequest('post', '/api/bulksearch/?searchId=' + searchId + '&ids=' + ids).done(function (data) {
                dhtmlx.alert("Save successful!");
                loadGridData("/api/searchevent/?searchId=" + searchId, searchEventsGrid);
                searchWindow.close();
            });
        }
        if (name == "btnCancel") {
            searchWindow.close();
        }
        if (name == "btnSelectAll") {
            eventsGrid.setCheckedRows(0, 1);
        }
    })

}


function loadQuickSearchesTab() {
    var quickSearch = tabs.tabs("a1").attachLayout('3U');
    quickSearch.cells("a").hideHeader();
    quickSearch.cells("b").hideHeader();
    quickSearch.cells("c").hideHeader();
    quickSearch.cells("a").setHeight(270);
    quickSearch.cells("b").setWidth(480);
    quickSearch.cells("b").attachHTMLString('<div id="barChart" style="width:480px;height:270px;"></div>');
    var barChart = new dhtmlXChart({
        view: "bar",
        container: "barChart",
        value: "#volume#",
        color: "#a7ee70",
        gradient: "rising",
        tooltip: {
            template: "#volume#"
        },
        width: 40,
        xAxis: {
            template: "'#date#"
        },
        //yAxis: {
        //    start: 0,
        //    step: 20,
        //    end: 200
        //},
        legend: {
            values: [{ text: "Volume", color: "#a7ee70" }, { text: "Moving Average", color: "#58dccd", markerType: "item" }],
            valign: "bottom",
            align: "center",
            width: 90,
            layout: "x"
        }
    });

    barChart.addSeries({
        view: "line",
        item: {
            radius: 0
        },
        line: {
            color: "#58dccd"
        },
        value: "#average#",
        tooltip: {
            template: "#average#"
        }
    });
    barChart.parse([], "json");

    var qsAform = quickSearch.cells("a").attachForm();
    var qsAformData = [{
        type: "label",
        hidden: "true",
        list: [{
            type: "checkbox",
            label: "Do new quick search",
            name: "cbDoNewQuickSearch",
            position: "label-right"
        }, {
            type: "newcolumn"
        }, {
            type: "checkbox",
            label: "Save quick search",
            name: "cbSaveQuickSearch",
            position: "label-right"
        }]
    },
    {
        type: "label",
        hidden: "true",
        list: [
                {
                    type: 'fieldset',
                    label: 'Single Event Quick Scrape',
                    list: [
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "label",
                                    hidden: "true",
                                    list: [
                                        {
                                            type: "combo",
                                            labelWidth: 60,
                                            inputWidth: 500,
                                            name: "cboQuickSearches",
                                            label: "Select:"
                                        },
                                        { type: "newcolumn" },
                                        {
                                            type: "button",
                                            name: "deleteQuickSearchItem",
                                            value: "---"
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "label",
                                    hidden: "true",
                                    list: [
                                        {
                                            type: 'input',
                                            label: 'Event ID:',
                                            name: "txtEventId",
                                            validate: "NotEmpty,ValidNumeric",
                                            labelWidth: 60
                                        },
                                        { type: "newcolumn" },
                                        {
                                            type: "label",
                                            hidden: "true",
                                            label: "Please provide a valid event ID!"
                                        }
                                    ]
                                },
                         {
                             type: "label",
                             hidden: "true",
                             list: [
                                 {
                                     type: 'input',
                                     label: 'Section:',
                                     name: "SectionFrom",
                                     labelWidth: 60
                                 },
                          {
                              type: "newcolumn"
                          },
                          {
                              type: 'input',
                              name: "SectionTo",
                              label: 'To:'
                          }
                             ]
                         },
                         {
                             type: "label",
                             hidden: "true",
                             list: [
                                 {
                                     type: 'checkbox',
                                     label: 'Last week sales only',
                                     name: "LastWeekSalesOnly",
                                     position: 'label-right'
                                 }, {
                                     type: "newcolumn"
                                 }, {
                                     type: 'button',
                                     offsetLeft: 190,
                                     name: 'getZones',
                                     value: 'Get Zones'
                                 }
                             ]
                         }
                         , {
                             type: "newcolumn"
                         },
                         {
                             type: "multiselect",
                             label: "Pick Zones:",
                             name: 'PickZones',
                             position: "label-top",
                             inputHeight: 90,
                             inputWidth: 200
                         }
                            ]
                        }

                    ]
                },
    {
        type: "label",
        label: "TIP:Leave all filters blank to receive all tickets.",
        className: "formtips"
    },
    { type: "newcolumn" },
    {
        type: "label",
        hidden: "true",
        list: [
            {
                type: "button",
                value: "Quick Search",
                name: "btnQuickSearch",
                className: "formBtn"
            }, {
                type: "button",
                value: "Export to CSV",
                name: "btnExportToCSV",
                className: "formBtn"
            }
        ]
    }
        ]
    }
    ];
    qsAform.loadStruct(qsAformData, 'json');

    qsAform.uncheckItem("cbSaveQuickSearch");
    qsAform.disableItem("cbSaveQuickSearch");
    qsAform.disableItem("txtEventId");

    var cboQuickSearches = qsAform.getCombo("cboQuickSearches");
    loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

    qsAform.attachEvent("onChange", function (name, value, state) {
        if (name == "txtEventId") {
            qsAform.reloadOptions("PickZones", []);
        }
        if (name == "cbDoNewQuickSearch") {
            if (state == true) {
                qsAform.enableItem("cbSaveQuickSearch");
                qsAform.disableItem("cboQuickSearches");
                qsAform.enableItem("txtEventId");
                qsAform.setItemValue("cboQuickSearches", "");
                qsAform.setItemValue("txtEventId", "");
                qsAform.setItemValue("SectionFrom", "");
                qsAform.setItemValue("SectionTo", "");
                qsAform.uncheckItem("LastWeekSalesOnly");
                qsTab1Form.setItemValue("AllSales", "");
                qsTab1Form.setItemValue("AllTickets", "");
                qsTab1Form.setItemValue("AvgPrice", "");
                qsTab1Form.setItemValue("FilterSales", "");
                qsTab1Form.setItemValue("FilterTickets", "");
                qsTab1Form.setItemValue("FilterAvgPrice", "");
                qsTab2Form.setItemValue("AllSales", "");
                qsTab2Form.setItemValue("AllTickets", "");
                qsTab2Form.setItemValue("AvgPrice", "");
                qsTab2Form.setItemValue("FilterSales", "");
                qsTab2Form.setItemValue("FilterTickets", "");
                qsTab2Form.setItemValue("FilterAvgPrice", "");
                qsTab1Grid.clearAll();
                qsTab2Grid.clearAll();
                qsAform.reloadOptions("PickZones", []);
                barChart.clearAll();
                barChart.parse([], "json");

            }
            else {
                qsAform.uncheckItem("cbSaveQuickSearch");
                qsAform.setItemValue("cboQuickSearches", "");
                qsAform.disableItem("cbSaveQuickSearch");
                qsAform.enableItem("cboQuickSearches");
                qsAform.disableItem("txtEventId");
            }
        }
        if (name == "cboQuickSearches") {
            if (value != "") {
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

        }

    });
    qsAform.attachEvent("onButtonClick", function (name) {
        if (name == "deleteQuickSearchItem") {
            var quickSearchesCombo = qsAform.getCombo("cboQuickSearches");
            var quickId = quickSearchesCombo.getSelectedValue();
            if (quickId != "" && quickId != null) {
                dhtmlx.confirm({
                    type: "confirm-warning",
                    text: "Are you sure you want to remove this QuickSearchItem?",
                    callback: function () {
                        ajaxRequest("delete", 'api/quicksearches/' + quickId).done(function (data) {
                            dhtmlx.message("this QuickSearchItem has been deleted!");
                            cboQuickSearches.clearAll();
                            loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');
                        });
                    }
                });
            }
        }

        if (name == "getZones") {
            var eventId = qsAform.getItemValue("txtEventId");
            if (eventId != "") {
                ajaxRequest("get", "/api/eventzones/?eventId=" + eventId).done(function (data) {
                    qsAform.reloadOptions("PickZones", data);
                });
            }
        }
        if (name == "btnQuickSearch") {
            if (qsAform.isItemEnabled("cboQuickSearches"))
                return true;

            var eventId = qsAform.getItemValue("txtEventId");
            var isChecked = qsAform.isItemChecked("cbSaveQuickSearch");
            var isSave = 0;
            var sectionFrom = qsAform.getItemValue("SectionFrom");
            var sectionTo = qsAform.getItemValue("SectionTo");
            var LastWeekSalesOnly = 0;
            var lwso = qsAform.isItemChecked("LastWeekSalesOnly");
            if (lwso) LastWeekSalesOnly = 1;
            var zones = qsAform.getItemValue("PickZones");
            if (isChecked) isSave = 1;
            ajaxRequest("get", "/api/quicksearches/" + eventId + "?isNew=1&isSave=" + isSave + "&sectionFrom=" + sectionFrom + "&sectionTo=" + sectionTo + "&lastWeekSalesOnly=" + LastWeekSalesOnly + "&zones=" + zones).done(function (data) {
                qsAform.setFormData({
                    txtEventId: data.EventId,
                    SectionFrom: data.SectionFrom,
                    SectionTo: data.SectionTo,
                    LastWeekSalesOnly: data.LastWeekSalesOnly
                });
                qsTab2Form.setFormData({
                    AllSales: data.AllSales,
                    AllTickets: data.AllTickets,
                    AvgPrice: data.AvgPrice,
                    FilterSales: data.FilterSales,
                    FilterTickets: data.FilterTickets,
                    FilterAvgPrice: data.FilterAvgPrice
                });
                qsAform.setItemValue("PickZones", "");
                loadGridData("/api/quicktickets/?quickId=" + data.Id + "&isSave=" + isSave, qsTab2Grid);
                var cboQuickSearches = qsAform.getCombo("cboQuickSearches");
                cboQuickSearches.clearAll();
                loadComboData(cboQuickSearches, "/api/QuickSearches/", "Name", "Id", '');

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

            });
        }
        if (name == "btnExportToCSV") {
            var eventId = qsAform.getItemValue("txtEventId");
            var isChecked = qsAform.isItemChecked("cbDoNewQuickSearch");
            var isNew = 0;
            if (isChecked) isNew = 1;
            window.location = "ExportToCSV/QuickSearchToCSV?eventid=" + eventId + "&isNew=" + isNew;
        }
    });
    var qsB = quickSearch.cells('c').attachTabbar();
    qsB.addTab("qstab2", "New search results", null, null, true);
    qsB.addTab("qstab1", "Old search tickets");
    var qsBtab1 = qsB.tabs("qstab1").attachLayout("2U");
    qsBtab1.cells("a").hideHeader();
    qsBtab1.cells("b").hideHeader();
    var qsTab1Grid = qsBtab1.cells("a").attachGrid();
    qsTab1Grid.setIconsPath(imgPath.grid);
    qsTab1Grid.setHeader(["Zone", "Section", "Row", "Price", "Qty", "Sold Date"]);
    qsTab1Grid.setColTypes("ro,ro,ro,ro,ro,ro");
    qsTab1Grid.setColumnIds("Zone,Section,Row,Price,Qty,DateSold");
    qsTab1Grid.setColSorting('str,str,str,str,int,date');
    qsTab1Grid.setInitWidths("300,200,100,100,100,100");
    //qsTab1Grid.enablePaging(true, 150, 3, "pagingArea");
    qsTab1Grid.setPagingSkin("toolbar");
    qsTab1Grid.init();
    qsBtab1.cells("b").setWidth('400');
    var qsTab1Form = qsBtab1.cells("b").attachForm();
    var qsTab1FormData = [{
        type: 'settings',
        position: 'label-left',
        labelWidth: 150,
        inputWidth: 120
    }, {
        type: 'label',
        inputWidth: 'auto',
        list: [{
            type: 'input',
            name: 'AllSales',
            label: 'All sales:'
        }, {
            type: 'input',
            name: 'AllTickets',
            label: 'All tickets sold:'
        }, {
            type: 'input',
            name: 'AvgPrice',
            label: 'Average price:'
        }, {
            type: 'input',
            name: 'FilterSales',
            label: 'Filtered sales:'
        }, {
            type: 'input',
            name: 'FilterTickets',
            label: 'Filtered tickets:'
        },
         {
             type: 'input',
             name: 'FilterAvgPrice',
             label: 'Filtered average price:'
         }]
    }];
    qsTab1Form.loadStruct(qsTab1FormData, 'json');


    var qsBtab2 = qsB.tabs("qstab2").attachLayout("2U");
    qsBtab2.cells("a").hideHeader();
    qsBtab2.cells("b").hideHeader();
    var qsTab2Grid = qsBtab2.cells("a").attachGrid();
    qsTab2Grid.setIconsPath(imgPath.grid);
    qsTab2Grid.setHeader(["Zone", "Section", "Row", "Price", "Qty", "Sold Date"]);
    qsTab2Grid.setColTypes("ro,ro,ro,ro,ro,ro");
    qsTab2Grid.setColumnIds("Zone,Section,Row,Price,Qty,DateSold");
    qsTab2Grid.setColSorting('str,str,str,str,int,date');
    qsTab2Grid.setInitWidths("300,200,100,100,100,100");
    //qsTab2Grid.enablePaging(true, 150, 3, "pagingArea");
    qsTab2Grid.setPagingSkin("toolbar");
    qsTab2Grid.init();
    qsBtab2.cells("b").setWidth('400');
    var qsTab2Form = qsBtab2.cells("b").attachForm();
    var qsTab2FormData = [{
        type: 'settings',
        position: 'label-left',
        labelWidth: 150,
        inputWidth: 120
    }, {
        type: 'label',
        inputWidth: 'auto',
        list: [{
            type: 'input',
            name: 'AllSales',
            label: 'All sales:'
        }, {
            type: 'input',
            name: 'AllTickets',
            label: 'All tickets sold:'
        }, {
            type: 'input',
            name: 'AvgPrice',
            label: 'Average price:'
        }, {
            type: 'input',
            name: 'FilterSales',
            label: 'Filtered sales:'
        }, {
            type: 'input',
            name: 'FilterTickets',
            label: 'Filtered tickets:'
        },
         {
             type: 'input',
             name: 'FilterAvgPrice',
             label: 'Filtered average price:'
         }]
    }];
    qsTab2Form.loadStruct(qsTab2FormData, 'json');
}
function loadSearchManagementTab() {

    var searchManagement = tabs.tabs("a2").attachLayout('2E');
    searchManagement.cells('a').hideHeader();
    searchManagement.cells('b').hideHeader();
    searchManagement.cells('a').setHeight(200);
    var smA = searchManagement.cells('a').attachLayout("2U");
    smA.cells("a").hideArrow();
    smA.cells("a").setWidth(820);
    smA.cells("b").hideHeader();
    smA.cells("a").setText("<input type='checkbox' id='showArchivedSearches'/><label for='showArchivedSearches'>Show archived searches</label>");

    var searchContextMenu = new dhtmlXMenuObject();
    searchContextMenu.setIconsPath(imgPath.toolbar);
    searchContextMenu.renderAsContextMenu();
    searchContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var sIndex = searchesGrid.getSelectedRowId();
        var searchId = 0;
        if (sIndex != null) {
            searchId = searchesGrid.cells(sIndex, 0).getValue();
            switch (menuitemId) {
                case "archived":
                    ajaxRequest('put', '/api/search/' + searchId + '?archived=1', null).done(function (data) {
                        dhtmlx.message("The search has been updated!");
                        loadSearches();
                    });
                    break;
                case "unarchived":
                    ajaxRequest('put', '/api/search/' + searchId + '?archived=0', null).done(function (data) {
                        dhtmlx.message("The search has been updated!");
                        loadSearches();
                    });
                    break;
            }
        }
        else {
            dhtmlx.alert("Please select a SearchItem!");
        }
        return true;
    });
    var searchMenuXMLString = "<menu>";
    searchMenuXMLString += '<item type="item" id="archived" text="Archived Selected Searches" />';
    searchMenuXMLString += '<item type="item" id="unarchived" text="Unarchived Selected Searches" />';
    searchMenuXMLString += '</menu>';
    searchContextMenu.loadStruct(searchMenuXMLString);


    searchesGrid = smA.cells("a").attachGrid();
    searchesGrid.setIconsPath(imgPath.grid);
    searchesGrid.setHeader(["Id", "Name", "Schedule Date", "Run Once a Day", "Archived"]);
    searchesGrid.setColTypes("ro,ro,ro,ch,ch");
    searchesGrid.setColSorting('str,str,str,str');
    searchesGrid.setColumnIds("Id,Name,ScheduleString,ScanDayBefore,Archived");
    searchesGrid.enableMultiselect(false);
    searchesGrid.setColumnHidden(0, true);
    searchesGrid.setColumnHidden(4, true);
    searchesGrid.setInitWidths("0,500,150,150,0");
    //searchesGrid.enablePaging(true, 150, 3, "pagingArea");
    searchesGrid.setPagingSkin("toolbar");
    searchesGrid.enableContextMenu(searchContextMenu);

    searchesGrid.init();
    loadSearches();
    searchesGrid.attachEvent("onRowSelect", function (id, ind) {
        var searchId = searchesGrid.cells(id, 0).getValue();
        loadGridData("/api/searchevent/?searchId=" + searchId, searchEventsGrid);
        smBBform.setFormData({
            Name: searchesGrid.cells(id, 1).getValue(),
            Schedule: searchesGrid.cells(id, 2).getValue(),
            ScanDayBefore: searchesGrid.cells(id, 3).getValue()
        });
    });
    searchesGrid.attachEvent("onBeforeContextMenu", function (rowId, celInd, grid) {
        var archived = grid.cells(rowId, 4).getValue();
        switch (archived) {
            case "1":
                searchContextMenu.setItemDisabled('archived');
                searchContextMenu.setItemEnabled('unarchived');
                break;
            case "0":
                searchContextMenu.setItemEnabled('archived');
                searchContextMenu.setItemDisabled('unarchived');
                break;
        }
        return true;
    });


    var smAAbutton = smA.cells("b").attachForm();
    var smAAbuttonData = [{
        type: "button",
        value: "Reload",
        name: "btnReload",
        className: "formBtn"
    }, {
        type: "button",
        value: "Delete  selected searches",
        name: "btnDeleteSelectedSearches",
        className: "formBtn"
    }];
    smAAbutton.loadStruct(smAAbuttonData, 'json');

    smAAbutton.attachEvent("onButtonClick", function (name) {
        if (name == "btnReload") {
            loadSearches();
        }
        if (name == "btnDeleteSelectedSearches") {
            var sIndex = searchesGrid.getSelectedRowId();
            var searchId = 0;
            if (sIndex != null) {
                searchId = searchesGrid.cells(sIndex, 0).getValue();
                ajaxRequest("delete", 'api/search/' + searchId).done(function (data) {
                    dhtmlx.message("The searchItem has been deleted!");
                    loadSearches();
                });
            }
            else
                dhtmlx.alert("Please select a SearchItem!");
        }
    })

    var smTab = searchManagement.cells('b').attachTabbar();
    smTab.addTab("smTab1", "Details", null, null, true);
    var smTab1 = smTab.tabs("smTab1").attachLayout("2U");
    smTab1.cells("a").setText("Search events:");
    smTab1.cells("a").hideArrow();
    smTab1.cells("b").hideHeader();
    smTab1.cells("a").setWidth(820);
    var smToolbar = smTab1.cells("a").attachToolbar();
    smToolbar.setIconsPath(imgPath.toolbar);
    smToolbar.addButton('btnDeleteSearchEvent', 100, 'Delete');
    smToolbar.addSeparator('smSeparator1', 100);
    smToolbar.addInput('txtEventId', 100);
    smToolbar.addButton('btnAddSearchEvent', 100, 'Add', null, null);
    smToolbar.addSeparator('smSeparator2', 100);
    smToolbar.addButton('btnScanLink', 100, 'Search Event', null, null);
    smToolbar.attachEvent("onClick", function (id) {

        var sIndex = searchesGrid.getSelectedRowId();
        var searchId = 0;
        if (sIndex != null)
            searchId = searchesGrid.cells(sIndex, 0).getValue();
        if (id == "btnDeleteSearchEvent") {
            var seIndex = searchEventsGrid.getSelectedRowId();
            var sEventId = 0;
            if (seIndex != null) {
                sEventId = searchEventsGrid.cells(seIndex, 0).getValue();
                ajaxRequest("delete", 'api/searchevent/' + sEventId).done(function (data) {
                    dhtmlx.message("The SearchEvent has been delete!");
                    loadGridData("/api/searchevent/?searchId=" + searchId + "&sync=0", searchEventsGrid);
                });
            }
            else {
                dhtmlx.alert("Please select a event.");
            }
        }
        if (id == "btnAddSearchEvent") {
            var eventId = Number(smToolbar.getValue("txtEventId"));
            if (eventId == 0 || isNaN(eventId)) {
                dhtmlx.alert("Invalid eventId");
            }
            else {
                var sTemp = { EventId: eventId, SearchId: searchId };
                ajaxRequest('post', '/api/searchevent/', sTemp).done(function (data) {
                    dhtmlx.message("The event has been saved!");
                    loadGridData("/api/searchevent/?searchId=" + searchId, searchEventsGrid);
                });
            }
        }
        if (id == "btnScanLink") {
            showBulkSearchWindow();
        }
    });

    searchEventsGrid = smTab1.cells("a").attachGrid();
    searchEventsGrid.setIconsPath(imgPath.grid);
    searchEventsGrid.setHeader(["ID", "Event ID", "Event Title", "Venue", "Event Date", "Active"]);
    searchEventsGrid.setColTypes("ro,ro,ro,ro,ro,ch");
    searchEventsGrid.setColSorting('str,str,str,str,str,str');
    searchEventsGrid.setColumnIds("Id,EventId,EventTitle,EventVenue,EventDate,Active");
    searchEventsGrid.setInitWidths("0,100,300,200,100,100");
    //searchEventsGrid.enablePaging(true, 150, 3, "pagingArea");
    searchEventsGrid.setPagingSkin("toolbar");
    searchEventsGrid.init();

    var smBBform = smTab1.cells("b").attachForm();
    var smBBformData = [
        {
            type: "label",
            hidden: "true",
            list: [
                {
                    type: "input",
                    label: "Search name:",
                    name: "Name",
                    position: "label-top"
                }, {
                    type: "calendar",
                    label: "Search schedule date:",
                    name: "Schedule",
                    position: "label-top",
                    dateFormat: "%m/%d/%Y %H:%i"
                }
                , {
                    type: "checkbox",
                    label: "Run Once a Day",
                    name: "ScanDayBefore",
                    position: "label-right"
                }
            ]
        },
        { type: "newcolumn" },
        {
            type: "label",
            hidden: "true",
            list: [
                     {
                         type: "button",
                         className: "formBtn",
                         name: "btnAddSearch",
                         value: "Add Search"
                     },
                       {
                           type: "button",
                           className: "formBtn",
                           name: "btnEditSearch",
                           value: "Edit Search"
                       },
                       {
                           type: "button",
                           className: "formBtn",
                           name: "btnClearSearchTemp",
                           value: "Clear Details"
                       }
            ]
        }
    ];
    smBBform.loadStruct(smBBformData, 'json');
    smBBform.attachEvent("onButtonClick", function (name) {
        var sData = smBBform.getFormData();
        var sIndex = searchesGrid.getSelectedRowId();
        var searchId = 0;
        if (sIndex != null)
            var searchId = searchesGrid.cells(searchesGrid.getSelectedRowId(), 0).getValue();

        sData.Id = searchId;

        if (name == "btnAddSearch") {
            ajaxRequest('post', '/api/search/', sData).done(function (data) {
                dhtmlx.message("The search has been saved!");
                loadSearches();
            });
        }
        if (name == "btnEditSearch") {
            ajaxRequest('put', '/api/search/' + searchId, sData).done(function (data) {
                dhtmlx.message("The search has been saved!");
                loadSearches();
            });
        }
        if (name == "btnClearSearchTemp") {
            ajaxRequest("delete", 'api/searchevent/0').done(function (data) {
                dhtmlx.message("The SearchEvent has been empty!");
                loadGridData("/api/searchevent/?searchId=" + searchId + "&sync=0", searchEventsGrid);
                smBBform.setFormData({
                    Name: "",
                    Schedule: "",
                    ScanDayBefore: false
                });
            });
        }
    })
}

function loadManualScrapingCenterTab() {

    var manualScrapingCenter = tabs.tabs("a3").attachLayout('3U');
    manualScrapingCenter.cells("a").hideHeader();
    manualScrapingCenter.cells("b").hideHeader();
    manualScrapingCenter.cells("c").hideHeader();
    manualScrapingCenter.cells("c").setHeight(300);
    var scrapingSearchesform = manualScrapingCenter.cells("a").attachForm();
    var scrapingSearchesformData = [
        {
            type: 'fieldset',
            offsetTop: 10,
            label: 'Manual Searching',
            list: [
                {
                    type: "label",
                    hidden: "true",
                    list: [
                        {
                            type: "combo",
                            label: "Search list:",
                            labelWidth: 80,
                            inputWidth: 400,
                            name: 'cboSearches'
                        }
                    ]
                },
                {
                    type: "label",
                    hidden: "true",
                    list: [
                        {
                            type: "multiselect", label: "Events:", name: "eventlist", labelWidth: 80, inputHeight: 100, inputWidth: 400
                        },
                        { type: "newcolumn" },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "button",
                                    name: "btnScrapingStart",
                                    value: "Start"
                                }
                                , {
                                    type: "button",
                                    name: "btnScrapingStop",
                                    value: "Stop"
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "label",
                    hidden: "true",
                    list: [
                        {
                            type: "checkbox",
                            label: "Save to CSV",
                            position: "label-right",
                            offsetLeft: 80,
                            name: "cbsavetocsv"
                        }
                        , { type: 'newcolumn' }
                        ,
                        {
                            type: "button",
                            value: "Download CSV",
                            name: "btnDownload",
                            position: "label-right",
                            offsetLeft: 100
                        }
                    ]
                }

            ]
        }];
    scrapingSearchesform.loadStruct(scrapingSearchesformData, 'json');
    scrapingSearchesform.disableItem("btnScrapingStop");

    var cboSearches = scrapingSearchesform.getCombo("cboSearches");
    loadComboData(cboSearches, "/api/search/?archived=0", "Name", "Id", '');
    scrapingSearchesform.attachEvent("onChange", function (name, value, state) {
        if (name == "cboSearches") {
            if (value != "") {
                ajaxRequest("get", "/api/scrapingevent/?searchId=" + value).done(function (data) {
                    scrapingSearchesform.reloadOptions("eventlist", data);
                });
            }
            else {
                scrapingSearchesform.reloadOptions("eventlist", []);
            }
        }
    });
    scrapingSearchesform.attachEvent("onButtonClick", function (name) {
        var eventIds = scrapingSearchesform.getItemValue("eventlist");
        if (name == "btnScrapingStart") {
            scrapingSearchesform.enableItem("btnScrapingStop");
            manualScrapingCenter.cells('c').progressOn();
            if (eventIds != "") {

                console.log(eventIds);
                ajaxRequest("get", "/api/scrapingevent/?ids=" + eventIds).done(function (data) {
                    manualScrapingCenter.cells('c').progressOff();
                    dhtmlx.alert("Searching complete");
                });
            }
            else {
                manualScrapingCenter.cells('c').progressOff();
                dhtmlx.alert("Please select at least 1 event.");
            }

        }
        if (name == "btnScrapingStop") {
            ajaxRequest("get", "/api/scrapingstop/").done(function (data) {
                manualScrapingCenter.cells("c").progressOff();
                dhtmlx.alert("Searching stop");
            });
        }
        if (name == "btnDownload") {
            if (eventIds != "")
                window.location = "ExportToCSV/ScrapingEventsToCSV?ids=" + eventIds;
        }
    });
    var scrapingMultipleSearchesform = manualScrapingCenter.cells("b").attachForm();
    var scrapingMultipleSearchesformData = [
        {
            type: 'fieldset',
            offsetTop: 10,
            label: 'Manual Searching multiple searches',
            list: [
                {
                    type: "label",
                    hidden: "true",
                    list: [
                        {
                            type: "multiselect", label: "Searches:", name: "multiSearches", labelWidth: 60, inputHeight: 100, inputWidth: 400
                        },
                        { type: "newcolumn" },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "button",
                                    name: "btnScrapingStart",
                                    value: "Start"
                                }
                                , {
                                    type: "button",
                                    name: "btnScrapingStop",
                                    value: "Stop"
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "label",
                    hidden: "true",
                    list: [
                         {
                             type: "checkbox",
                             label: "Save to CSV",
                             position: "label-right",
                             offsetLeft: 62,
                             name: "savetocsv"
                         }
                        , { type: 'newcolumn' }
                        ,
                        {
                            type: "button",
                            value: "Download CSV",
                            name: "btnDownload",
                            position: "label-right",
                            offsetLeft: 100
                        }
                    ]
                }

            ]
        }];
    scrapingMultipleSearchesform.loadStruct(scrapingMultipleSearchesformData, 'json');
    scrapingMultipleSearchesform.disableItem("btnScrapingStop");

    ajaxRequest("get", "/api/scrapingmultisearches/").done(function (data) {
        scrapingMultipleSearchesform.reloadOptions("multiSearches", data);
    });
    scrapingMultipleSearchesform.attachEvent("onButtonClick", function (name) {
        var searchIds = scrapingMultipleSearchesform.getItemValue("multiSearches");
        if (name == "btnScrapingStart") {
            if (searchIds != "") {
                manualScrapingCenter.cells("c").progressOn();
                ajaxRequest("get", "/api/scrapingmultisearches/?ids=" + searchIds).done(function (data) {
                    manualScrapingCenter.cells("c").progressOff();
                    dhtmlx.alert("Searching complete");
                });
            }
            else {
                manualScrapingCenter.cells("c").progressOff();
                dhtmlx.alert("Please select at least 1 searchItem");
            }
            scrapingMultipleSearchesform.enableItem("btnScrapingStop");
        }
        if (name == "btnScrapingStop") {
            ajaxRequest("get", "/api/scrapingstop/").done(function (data) {
                manualScrapingCenter.cells("c").progressOff();
                dhtmlx.alert("Searching stop");
            });
        }
        if (name == "btnDownload") {

            if (searchIds != "")
                window.location = "ExportToCSV/ScrapingMultiSearchesToCSV?ids=" + searchIds;

        }
    });
}

function loadStubHubDatabaseTab() {

    var stubhubDatabase = tabs.tabs("a4").attachLayout("2E");
    stubhubDatabase.cells("a").hideHeader();
    stubhubDatabase.cells("a").setHeight(240);
    var sEventForm = stubhubDatabase.cells("a").attachForm();
    var sEventFormData = [
        {
            type: "label",
            hidden: "true",
            list: [
                {
                    type: "fieldset",
                    label: "Tickets filter options",
                    list: [
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "combo",
                                    label: "Search list:",
                                    name: "SearchId",
                                    labelWidth: 80,
                                    inputWidth: 300
                                },
                                {
                                    type: "combo",
                                    label: "Event:",
                                    name: "EventId",
                                    labelWidth: 80,
                                    inputWidth: 300
                                },
                                {
                                    type: "input",
                                    label: "Event title:",
                                    name: "EventTitle",
                                    labelWidth: 80,
                                    inputWidth: 300
                                },
                                {
                                    type: "input",
                                    label: "Venue:",
                                    name: "EventVenue",
                                    labelWidth: 80,
                                    inputWidth: 300
                                }
                            ]
                        },
                        { type: "newcolumn" },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "calendar",
                                    label: "Event Date:",
                                    name: "StartDate",
                                    dateFormat: "%m/%d/%Y",
                                    labelWidth: 80,
                                    inputWidth: 150
                                },
                                { type: "newcolumn" },
                                {
                                    type: "calendar",
                                    label: "To:",
                                    name: "EndDate",
                                    dateFormat: "%m/%d/%Y",
                                    inputWidth: 150
                                }

                            ]
                        },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "input",
                                    label: "Zone:",
                                    name: "Zone",
                                    labelWidth: 80,
                                    inputWidth: 325
                                }
                            ]
                        },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "input",
                                    label: "Section:",
                                    name: "SectionForm",
                                    labelWidth: 80,
                                    inputWidth: 150
                                },
                                { type: "newcolumn" },
                                {
                                    type: "input",
                                    label: "To:",
                                    name: "SectionTo",
                                    inputWidth: 150
                                }
                            ]
                        },
                        {
                            type: "label",
                            hidden: "true",

                            list: [
                                {
                                    type: "checkbox",
                                    offsetLeft: 75,
                                    name: "LastWeekSalesOnly",
                                    label: "Last week sales only",
                                    position: "label-right"
                                },
                                { type: "newcolumn" },
                                {
                                    type: "checkbox",
                                    offsetLeft: 35,
                                    label: "Hide Past Events",
                                    name: "HidePastEvents",
                                    position: "label-right"
                                }
                            ]
                        },
                        {
                            type: "label",
                            hidden: "true",
                            list: [
                                {
                                    type: "checkbox",
                                    offsetLeft: 75,
                                    name: "ShowArchivedSearches",
                                    label: "Show Archived Searches",
                                    position: "label-right"
                                }
                            ]
                        }
                    ]
                },
                {
                    type: "label",
                    label: "TIP:Leave all filters blank to load all tickets.",
                    className: "formtips"
                },
                { type: "newcolumn" },
                {
                    type: "label",
                    hidden: "true",
                    list: [
                        {
                            type: "button",
                            className: "formBtn",
                            name: "btnLookupTickets",
                            value: "Lookup tickets"
                        },
                        {
                            type: "button",
                            className: "formBtn",
                            name: "btnExportTicketsToCSV",
                            value: "Export tickets to CSV"
                        },
                        {
                            type: "button",
                            className: "formBtn",
                            name: "btnDeleteSelectedTickets",
                            value: "Delete selected tickets"
                        }
                    ]
                }
            ]
        }
    ];
    sEventForm.loadStruct(sEventFormData, 'json');

    var searchlist = sEventForm.getCombo("SearchId");
    loadComboData(searchlist, "/api/search/?archived=0", "Name", "Id", '');

    sEventForm.attachEvent("onChange", function (name, value, state) {
        if (name == "SearchId") {
            var eventlist = sEventForm.getCombo("EventId");
            if (value != "") {
                eventlist.clearAll();
                loadComboData(eventlist, "/api/scrapingevent/?searchId=" + value, "text", "value", '');
            }
            else {
                eventlist.clearAll();
            }
        }
    });

    sEventForm.attachEvent("onButtonClick", function (name) {
        if (name == "btnLookupTickets") {
            //var sEventData = sEventForm.getFormData();
            var searchId = sEventForm.getItemValue("SearchId");
            var eventId = sEventForm.getItemValue("EventId");
            var eventTitle = sEventForm.getItemValue("EventTitle");
            var eventVenue = sEventForm.getItemValue("EventVenue");
            var startDate = sEventForm.getCalendar("StartDate").getDate(true);
            var endDate = sEventForm.getCalendar("EndDate").getDate(true);
            var zone = sEventForm.getItemValue("Zone");
            var sectionForm = sEventForm.getItemValue("SectionForm");
            var sectionTo = sEventForm.getItemValue("SectionTo");
            var lastWeekSalesOnly = sEventForm.getItemValue("LastWeekSalesOnly");
            var hidePastEvents = sEventForm.getItemValue("HidePastEvents");
            var showArchivedSearches = sEventForm.getItemValue("ShowArchivedSearches");
            if (searchId == "")
                searchId = 0;
            if (eventId == "")
                eventId = 0;

            loadGridData("/api/lookupevents/?searchId=" + searchId + "&eventId=" + eventId
                + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
                + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
                + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches, sdBtab1Grid);

            loadGridData("/api/lookuptickets/?searchId=" + searchId + "&eventId=" + eventId
                + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
                + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
                + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches, sdBtab2Grid);

            ajaxRequest("get", "/api/eventschart/?searchId=" + searchId + "&eventId=" + eventId
                + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
                + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
                + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches).done(function (data) {
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
        if (name == "btnExportTicketsToCSV") {
            var ids = "";
            sdBtab1Grid.forEachRow(function (id) {
                ids += sdBtab1Grid.cells(id, 0).getValue() + ",";
            });
            if (ids != "")
                window.location = "ExportToCSV/LookupTicketsToCSV?ids=" + ids;
        }
        if (name == "btnDeleteSelectedTickets") {
            var sIndex = sdBtab2Grid.getSelectedRowId();
            var ticketId = 0;
            if (sIndex != null) {
                ticketId = sdBtab2Grid.cells(sIndex, 0).getValue();
                ajaxRequest("delete", 'api/lookuptickets/' + ticketId).done(function (data) {
                    dhtmlx.message("The ticket has been deleted!");

                    var searchId = sEventForm.getItemValue("SearchId");
                    var eventId = sEventForm.getItemValue("EventId");
                    var eventTitle = sEventForm.getItemValue("EventTitle");
                    var eventVenue = sEventForm.getItemValue("EventVenue");
                    var startDate = sEventForm.getCalendar("StartDate").getDate(true);
                    var endDate = sEventForm.getCalendar("EndDate").getDate(true);
                    var zone = sEventForm.getItemValue("Zone");
                    var sectionForm = sEventForm.getItemValue("SectionForm");
                    var sectionTo = sEventForm.getItemValue("SectionTo");
                    var lastWeekSalesOnly = sEventForm.getItemValue("LastWeekSalesOnly");
                    var hidePastEvents = sEventForm.getItemValue("HidePastEvents");
                    var showArchivedSearches = sEventForm.getItemValue("ShowArchivedSearches");
                    if (searchId == "")
                        searchId = 0;
                    if (eventId == "")
                        eventId = 0;

                    loadGridData("/api/lookuptickets/?searchId=" + searchId + "&eventId=" + eventId
                        + "&title=" + eventTitle + "&venue=" + eventVenue + "&startDate=" + startDate + "&endDate=" + endDate
                        + "&zone=" + zone + "&sectionForm=" + sectionForm + "&sectionTo=" + sectionTo
                        + "&lastWeekSalesOnly=" + lastWeekSalesOnly + "&hidePastEvents=" + hidePastEvents + "&showArchivedSearches=" + showArchivedSearches, sdBtab2Grid);

                });
            }
            else
                dhtmlx.alert("Please select a ticket!");
        }
    });
    var sdBtab = stubhubDatabase.cells("b").attachTabbar();
    sdBtab.addTab("sdBtab1", "Condensed View", null, null, true);
    sdBtab.addTab("sdBtab2", "Normal View");
    var sdbLayout = sdBtab.tabs("sdBtab1").attachLayout("2U");
    sdbLayout.cells("a").hideHeader();
    sdbLayout.cells("b").hideHeader();
    sdbLayout.cells("b").setWidth(480);
    sdbLayout.cells("b").attachHTMLString('<div id="sdBarChart" style="width:480px;height:270px;"></div>');
    var barChart = new dhtmlXChart({
        view: "bar",
        container: "sdBarChart",
        value: "#volume#",
        color: "#a7ee70",
        gradient: "rising",
        tooltip: {
            template: "#volume#"
        },
        width: 40,
        xAxis: {
            template: "'#date#"
        },
        //yAxis: {
        //    start: 0,
        //    step: 20,
        //    end: 200
        //},
        legend: {
            values: [{ text: "Volume", color: "#a7ee70" }, { text: "Moving Average", color: "#58dccd", markerType: "item" }],
            valign: "bottom",
            align: "center",
            width: 90,
            layout: "x"
        }
    });

    barChart.addSeries({
        view: "line",
        item: {
            radius: 0
        },
        line: {
            color: "#58dccd"
        },
        value: "#average#",
        tooltip: {
            template: "#average#"
        }
    });
    barChart.parse([], "json");
    var sdBtab1Grid = sdbLayout.cells("a").attachGrid();
    sdBtab1Grid.setIconsPath(imgPath.grid);
    sdBtab1Grid.setHeader(["Event ID", "Event Title", "Venue", "Date", "Sales", "Tickets Sold", "Average Price"]);
    sdBtab1Grid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
    sdBtab1Grid.setColSorting('str,str,str,date,int,int,int');
    sdBtab1Grid.setColumnIds("Id,Title,Venue,Date,Sales,TicketsCount,AvgPrice");
    sdBtab1Grid.setInitWidths("80,300,150,80,50,90,100");

    sdBtab1Grid.setPagingSkin("toolbar");
    sdBtab1Grid.init();


    var sdBtab2Grid = sdBtab.tabs("sdBtab2").attachGrid();
    sdBtab2Grid.setIconsPath(imgPath.grid);
    sdBtab2Grid.setHeader(["ID", "Event ID", "Event Title", "Venue", "Event Date", "Zone", "Section", "Row", "Price", "Qty", "Sold Date"]);
    sdBtab2Grid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro,ro,ro,ro");
    sdBtab2Grid.setColSorting('str,str,str,str,str,str,str,str,int,int,date');
    sdBtab2Grid.setColumnIds("Id,EventId,EventTitle,EventVenue,EventDate,Zone,Section,Row,Price,Qty,DateSold");
    sdBtab2Grid.setInitWidths("0,100,300,200,100,100,100,100,100,100,100");

    sdBtab2Grid.setPagingSkin("toolbar");
    sdBtab2Grid.init();
}
function loadScrapingLogTab() {


    var scrapingLog = tabs.tabs("a5").attachLayout("2E");
    scrapingLog.cells("a").setText("Application Log");
    scrapingLog.cells("b").setText("Automatic Searching Progress");
    var appLogGrid = scrapingLog.cells("a").attachGrid();
    appLogGrid.setIconsPath(imgPath.grid);
    appLogGrid.setHeader(["Date/Time", "Message"]);
    appLogGrid.setColTypes("ro,ro");
    appLogGrid.setColumnIds("CreatedOnUtc,Message");
    appLogGrid.setInitWidths("100,900");
    //appLogGrid.enablePaging(true, 150, 3, "pagingArea");
    appLogGrid.setPagingSkin("toolbar");
    appLogGrid.init();
    loadGridData("/api/applog/", appLogGrid);

    var autoScrapingLogGrid = scrapingLog.cells("b").attachGrid();
    autoScrapingLogGrid.setIconsPath(imgPath.grid);
    autoScrapingLogGrid.setHeader(["Date/Time", "Search", "Step", "Zone"]);
    autoScrapingLogGrid.setColTypes("ro,ro,ro,ro");
    autoScrapingLogGrid.setColumnIds("date,search,step,zone");
    autoScrapingLogGrid.setInitWidths("100,400,200,200");
    //autoScrapingLogGrid.enablePaging(true, 150, 3, "pagingArea");
    autoScrapingLogGrid.setPagingSkin("toolbar");
    autoScrapingLogGrid.init();
}

function init() {
    mainLayout = new dhtmlXLayoutObject(document.body, '1C');
    var a = mainLayout.cells('a');
    var welcomeToolbar = a.attachToolbar();
    welcomeToolbar.setIconsPath(imgPath.toolbar);
    welcomeToolbar.addText("welcom_text", 0, "Welcome " + $('#currentUsername').val() + "!");
    if ($('#adminUser').val() == "True") welcomeToolbar.addButton("manageUsers", 1, "Manage Users");
    welcomeToolbar.addButton("logout", 10, "Logout");
    welcomeToolbar.attachEvent("onClick", function (id) {
        if (id == "logout") $('#logoutForm').submit();
        if (id == "manageUsers") showUsersWindow();
    });

    //content
    var contentLayout = a.attachLayout('1C');
    tabs = contentLayout.cells('a').attachTabbar();
    tabs.addTab("a1", "Quick Search", null, null, true);
    tabs.addTab("a2", "Create Search");
    tabs.addTab("a3", "Execute Search");
    tabs.addTab("a4", "Ticket Data");
    tabs.addTab("a5", "Searching Log");
    tabs.enableAutoReSize(true);
    loadQuickSearchesTab();
    tabs.attachEvent("onTabClick", function (id, lastId) {
        switch (id) {
            case "a1":
                loadQuickSearchesTab();
                break;
            case "a2":
                loadSearchManagementTab();
                break;
            case "a3":
                loadManualScrapingCenterTab();
                break;
            case "a4":
                loadStubHubDatabaseTab();
                break;
            case "a5":
                loadScrapingLogTab();
                break;
        }
    });

}