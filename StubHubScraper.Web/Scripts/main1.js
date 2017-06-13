//Global Settings
var imgPath = {
    'root': '/Content/imgs/',
    'grid': '/Content/imgs/',
    'toolbar': '/Content/imgs/toolbar/',
},
	mainLayout,
    ordersGrid,
    orderContextMenu,
    orderToolbar,
    orderLineItemsGrid,
    accountsWindow, usersWindow,
    accountsGrid, usersGrid,
    creditCardsGrid, proxiesGrid,
    currentCat = 0,
    logsWindow, processingWindow,
    logsGrid, processingGrid,
    buyersGrid, buyersWindow,
    processingErrorWindow,
    processingErrorGrid,
    autoPOerLogWindow,
    autoPOerLogGrid,
    mapOrdersWindow,
    mapOrdersGrid,
    mapOrdersPopup,
    headlinersCombo,
    eventsCombo,
    processType = -1,
    orderRequestUrl = '/api/order/?categoryId=0';

var ORDERS_COLS = {
    ID: 0,
    ORD_ID: 1,
    ORD_CAT_ID: 2,
    INHAND: 3,
    POSTED: 4,
    EVENT: 5,
    VENUE: 6,
    DATE: 7,
    QTY: 8,
    SECTION: 9,
    ROW: 10,
    LOW: 11,
    HIGH: 12,
    COST: 13,
    TAX: 14,
    SHIP: 15,
    STATUS: 16,
    CONF_NO: 17,
    CONF_DATE: 18,
    CC: 19,
    USER: 20,
    LAST4: 21,
    SELLER_NAME: 22
};

var MAP_ORDERS_COLS = {
    ORDER_ID: 0,
    INSTR: 1,
    IMG: 2,
    LINK_H: 3,
    LINK_E: 4,
    CONFNO: 5,
    EVENT_NAME: 6,
    EVENT_DATE: 7,
    VENUE: 8,
    HEAD_ID: 9,
    HEADLINER: 10,
    EV_ID: 11,
    POS_EVENT: 12
};

var SET_CUST_ID = {
    ORDER_LINES: 0,
    ALL_CREDIT_CARDS: 1
};

var checkProcessing_setinterval = setInterval(function () {
    ajaxRequest("get", "/api/users/" + $('#userId').val()).done(function (data) {
        if (data.isProcessing) {
            orderToolbar.disableItem('ProcessNew');
            orderToolbar.disableItem('UpdateOld');
            orderToolbar.disableItem('ProcessAll');
            orderToolbar.disableItem('ProcessRetry');
        } else {
            orderToolbar.enableItem('ProcessNew');
            orderToolbar.enableItem('UpdateOld');
            orderToolbar.enableItem('ProcessAll');
            orderToolbar.enableItem('ProcessRetry');
        }
    });
}, 10000);

function failCallback(elem) {
    elem.progressOff();
    alert("Connetion error");
}

function loadAccounts() {
    accountsWindow.progressOn();
    ajaxRequest("get", "/api/account/").done(function (data) {

        var accountData = {};
        accountData.total_count = data.length;
        accountData.pos = 0;
        accountData.data = data;

        accountsGrid.clearAll();
        accountsGrid.parse(accountData, "js");

        accountsWindow.progressOff();

        if (accountsGrid.getRowsNum() > 0) {
            accountsGrid.selectRow(0, true);
        }

    }).fail(function () {
        accountsWindow.progressOff();
        alert("Error when loading accounts!");
    });
}

function loadNewAccounts() {
    accountsWindow.progressOn();
    ajaxRequest("get", "/api/accountgroup/").done(function (data) {

        var accountData = {};
        accountData.total_count = data.length;
        accountData.pos = 0;
        accountData.data = data;

        accountsGrid.clearAll();
        accountsGrid.parse(accountData, "js");

        accountsWindow.progressOff();

        if (accountsGrid.getRowsNum() > 0) {
            accountsGrid.selectRow(0, true);
        }

    }).fail(function () {
        accountsWindow.progressOff();
        alert("Error when loading accounts!");
    });
}

function loadUsers() {
    usersWindow.progressOn();
    ajaxRequest("get", "/api/users/").done(function (data) {

        var userData = {};
        userData.total_count = data.length;
        userData.pos = 0;
        userData.data = data;

        usersGrid.clearAll();
        usersGrid.parse(userData, "js");

        usersWindow.progressOff();

        if (usersGrid.getRowsNum() > 0) {
            usersGrid.selectRow(0, true);
        }

    }).fail(function () {
        usersWindow.progressOff();
        alert("Error when loading users!");
    });
}

function loadComboData(combo, url, showKey, valKey, val) {
    ajaxRequest("get", url).done(function (data) {
        if (data.length > 0) {
            var options = [];
            $.each(data, function (i, v) {
                options.push([v[valKey], v[showKey]]);
            });
            combo.addOption(options);

            if (options.length > 0) combo.setComboValue(options[0][0]);

            if (val != "") combo.setComboValue(val);
        }
    }).fail(failCallback);
}

function loadSellersForAccounts(toolbar, grid) {
    var sellerCList = [];
    var activateOpts = [];
    var deactivateOpts = [];
    ajaxRequest("get", '/api/seller/').done(function (data) {
        if (data.length > 0) {
            $.each(data, function (i, v) {
                sellerCList.push(v.name);

                activateOpts.push(["act_" + v.name, "obj", v.name, null, null]);
                deactivateOpts.push(["deact_" + v.name, "obj", v.name, null, null]);
            });

            toolbar.addButtonSelect("activeButton", 2, "Activate", activateOpts, null, null);
            toolbar.setWidth("activeButton", 110);
            toolbar.addButtonSelect("deActiveButton", 3, "Deactivate", deactivateOpts, null, null);
            toolbar.setWidth("deActiveButton", 110);
            grid.registerCList(3, sellerCList);
        }
    }).fail(failCallback);
}

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

function showAccountsWindow() {
    var windows = new dhtmlXWindows();
    var accountId = 0;

    accountsWindow = windows.createWindow('accountWindow', 0, 0, 960, 550);
    accountsWindow.setText('My Accounts');
    accountsWindow.centerOnScreen();

    var accountsLayout = accountsWindow.attachLayout("2U");

    //Accounts context menu
    var accountsContextMenu = new dhtmlXMenuObject();
    accountsContextMenu.setIconsPath(imgPath.toolbar);
    accountsContextMenu.renderAsContextMenu();
    var accountMenuXMLString = '<menu>';
    accountMenuXMLString += '<item type="item" id="delAccount" text="Delete"/>';
    accountMenuXMLString += '<item type="item" id="creditCards" text="Credit Cards"/>';
    accountMenuXMLString += '</menu>';
    accountsContextMenu.loadStruct(accountMenuXMLString);
    accountsContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = accountsGrid.contextID.split("_");
        //Get the id of the account
        var id = data[0];
        switch (menuitemId) {
            case 'delAccount':
                deleteAccount(id);
                break;
            case 'creditCards':
                loadCreditCardWindow(id);
                break;
            case '':
                break;
        }
        return true;
    });

    var left = accountsLayout.cells('a');
    left.setText("Accounts");
    //toolbar
    var accountToolbar = left.attachToolbar();
    accountToolbar.setIconsPath(imgPath.toolbar);
    var accountToolbarXML = "<toolbar>";
    accountToolbarXML += '<item type="button" id="addButton" img="add.png" title="Add account"/>';
    accountToolbarXML += '<item type="separator"/>';
    accountToolbarXML += '<item type="button" id="activeButton" text="Active"/>';
    accountToolbarXML += '<item type="button" id="deActiveButton" text="Deactive"/>';
    accountToolbarXML += '<item type="button" id="deleteButton" text="Delete"/>';
    accountToolbarXML += '<item type="button" id="popButton" text="POP"/>';
    if ($('#adminUser').val() == "True" || $('#setCustID').val() == "True") accountToolbarXML += '<item type="button" id="setCustID" text="Set Customer ID"/>';
    accountToolbarXML += "</toolbar>";
    accountToolbar.loadStruct(accountToolbarXML);

    accountToolbar.attachEvent("onClick", function (id) {
        if (id == "addButton") {
            loadAddAccountWindow();
        }
        if (id == "popButton") {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            else {
                data = data.split(",");
            }
            loadEditPOPWindow(data);
        }
        if (id == "setCreditCardButton") {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            loadAddCreditCardWindow(data);
        }
        if (id == "setCustID") {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            showSetCustomerIdWindow(data, SET_CUST_ID.ALL_CREDIT_CARDS);
        }

        if (id == 'activeButton' || id == 'deActiveButton') {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            else {
                data = data.split(",");
            }

            var active = 'false';
            if (id == 'activeButton') active = 'true';
            if (id == 'deActiveButton') active = 'false';


            $.each(data, function (k, v) {
                var account = { Id: v };
                account.Username = accountsGrid.cells(v, 2).getValue();
                account.Password = accountsGrid.cells(v, 3).getValue();
                account.IsActive = active;

                //update the account
                ajaxRequest("put", "/api/account/" + v, account).done(function (data) {
                    loadAccounts();
                });
            });

            return true;
        }
        if (id == 'deleteButton') {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            else {
                data = data.split(",");
            }

            $.each(data, function (k, v) {
                ajaxRequest("delete", "/api/account/" + v).done(function (data) {
                    loadAccounts();
                });
            });

            return true;
        }
    });

    //grid
    accountsGrid = left.attachGrid();
    accountsGrid.setIconsPath(imgPath.grid);
    if ($('#adminUser').val() == "True" || $('#setCCID').val() == "True") {
        accountsGrid.setHeader(["Id", "Seller", "Username", "Password", "Is Active?", "CC ID"]);
        accountsGrid.setColTypes("ro,coro,ed,ed,ch,ed");
        accountsGrid.setColSorting('str,str,str,str,str,str');
        accountsGrid.setColumnIds("id,sellerName,username,password,isActive,cC_ID");
        accountsGrid.setInitWidthsP("0,25,30,20,15,10");
    }
    else {
        accountsGrid.setHeader(["Id", "Seller", "Username", "Password", "Is Active?"]);
        accountsGrid.setColTypes("ro,coro,ed,ed,ch");
        accountsGrid.setColSorting('str,str,str,str,str');
        accountsGrid.setColumnIds("id,sellerName,username,password,isActive");
        accountsGrid.setInitWidthsP("0,25,30,20,15");
    }
    accountsGrid.enableMultiselect(true);
    accountsGrid.setColumnHidden(0, true);
    //accountsGrid.enableContextMenu(accountsContextMenu);

    var combo = accountsGrid.getCombo(1);
    ajaxRequest("get", '/api/seller/').done(function (data) {
        if (data.length > 0) {
            var options = [];
            $.each(data, function (i, v) {
                combo.put(v.id, v.name);
            });
        }
    }).fail(failCallback);

    accountsGrid.init();

    accountsGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2 && (cInd == 1 || cInd == 2 || cInd == 3 || cInd == 5)) {
            if (nValue != oValue) {
                var account = { Id: rId };

                account.SellerId = accountsGrid.cells(rId, 1).getValue();
                account.Username = accountsGrid.cells(rId, 2).getValue();
                account.Password = accountsGrid.cells(rId, 3).getValue();
                account.IsActive = accountsGrid.cells(rId, 4).getValue() == 1 ? 'true' : 'false';
                if (accountsGrid.getColumnsNum() == 6) account.CC_ID = accountsGrid.cells(rId, 5).getValue();
                //update the order
                ajaxRequest("put", "/api/account/" + rId, account).done(function (data) {
                    dhtmlx.message("Your account has been updated!");
                });

            }
            return true;
        }

        if (stage == 1 && cInd == 4) {
            var account = { Id: rId };
            account.Username = accountsGrid.cells(rId, 2).getValue();
            account.Password = accountsGrid.cells(rId, 3).getValue();
            account.IsActive = accountsGrid.cells(rId, 4).getValue() == 1 ? 'true' : 'false';
            if (accountsGrid.getColumnsNum() == 6) account.CC_ID = accountsGrid.cells(rId, 5).getValue();

            //update the order
            ajaxRequest("put", "/api/account/" + rId, account).done(function (data) {
                dhtmlx.message("Your account has been updated!");
            });
        }
        return true;
    });
    accountsGrid.attachEvent("onRowSelect", function (rid, cInd) {
        accountId = rid;

        loadCreditCards(accountId);
    });

    loadAccounts();

    var right = accountsLayout.cells('b');
    right.setText("Credit Cards");
    right.setWidth(300);
    var creditCardsToolbar = right.attachToolbar();
    creditCardsToolbar.setIconsPath(imgPath.toolbar);

    var creditCardsToolbarXMLString = '<toolbar>';
    creditCardsToolbarXMLString += '<item type="button" id="add" img="add.png" title="Add CreditCard"/>';
    creditCardsToolbarXMLString += '</toolbar>';
    creditCardsToolbar.loadStruct(creditCardsToolbarXMLString);
    creditCardsToolbar.attachEvent("onClick", function (id) {
        if (id == "add" && accountId != 0) {
            loadAddCreditCardWindow(accountId);
        }
    });

    var creditCardsContextMenu = new dhtmlXMenuObject();
    creditCardsContextMenu.setIconsPath(imgPath.toolbar);
    creditCardsContextMenu.renderAsContextMenu();
    creditCardsContextMenu.loadStruct('<menu><item type="item" id="del" text="Delete"/></menu>');
    creditCardsContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = creditCardsGrid.contextID.split("_");
        //Get the id of the account
        var id = data[0];
        switch (menuitemId) {
            case 'del':
                dhtmlx.confirm({
                    type: "confirm-warning",
                    text: "Are you sure you want to remove this creditcard?",
                    callback: function () {
                        ajaxRequest("delete", 'api/creditcard/' + id).done(function (data) {
                            dhtmlx.message("Your creditcard has been deleted!");
                            loadCreditCards(accountId);
                        });
                    }
                });
                break;
        }
        return true;
    });

    creditCardsGrid = right.attachGrid();
    creditCardsGrid.setIconsPath(imgPath.grid);

    creditCardsGrid.setHeader(["Id", "Name", "CreditCard4", "Customer ID"]);
    creditCardsGrid.setColTypes("ro,ed,ed,ed");
    creditCardsGrid.setColSorting('int,str,str,int');
    creditCardsGrid.setColumnIds("id,name,creditCard4,customerId");
    creditCardsGrid.enableContextMenu(creditCardsContextMenu);
    creditCardsGrid.setColumnHidden(0, true);
    creditCardsGrid.setInitWidthsP("0,50,20,30");
    creditCardsGrid.init();
    creditCardsGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2) {
            var creditCard = { Id: rId };
            creditCard.Name = creditCardsGrid.cells(rId, 1).getValue();
            creditCard.CreditCard4 = creditCardsGrid.cells(rId, 2).getValue();
            creditCard.CustomerId = creditCardsGrid.cells(rId, 3).getValue();

            //update the order
            ajaxRequest("put", "/api/creditcard/" + rId, creditCard).done(function (data) {
                dhtmlx.message("Your creditcard has been updated!");
            });

            return true;
        }
    });
}

function showNewAccountsWindow() {
    var windows = new dhtmlXWindows();
    var accountId = 0;

    accountsWindow = windows.createWindow('accountWindow', 0, 0, 960, 550);
    accountsWindow.setText('My Accounts');
    accountsWindow.centerOnScreen();

    var accountsLayout = accountsWindow.attachLayout("2U");

    //Accounts context menu
    var accountsContextMenu = new dhtmlXMenuObject();
    accountsContextMenu.setIconsPath(imgPath.toolbar);
    accountsContextMenu.renderAsContextMenu();
    var accountMenuXMLString = '<menu>';
    accountMenuXMLString += '<item type="item" id="delAccount" text="Delete"/>';
    accountMenuXMLString += '<item type="item" id="creditCards" text="Credit Cards"/>';
    accountMenuXMLString += '</menu>';
    accountsContextMenu.loadStruct(accountMenuXMLString);
    accountsContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = accountsGrid.contextID.split("_");
        //Get the id of the account
        var id = data[0];
        switch (menuitemId) {
            case 'delAccount':
                //deleteAccount(id);
                break;
            case 'creditCards':
                //loadCreditCardWindow(id);
                break;
            case '':
                break;
        }
        return true;
    });

    var left = accountsLayout.cells('a');
    left.setText("Accounts");
    //toolbar
    var accountToolbar = left.attachToolbar();
    accountToolbar.setIconsPath(imgPath.toolbar);
    var accountToolbarXML = "<toolbar>";
    accountToolbarXML += '<item type="button" id="addButton" img="add.png" title="Add account"/>';
    accountToolbarXML += '<item type="separator"/>';
    accountToolbarXML += '<item type="separator"/>';
    accountToolbarXML += '<item type="button" id="deleteButton" text="Delete"/>';
    accountToolbarXML += '<item type="button" id="popButton" text="POP"/>';
    if ($('#adminUser').val() == "True" || $('#setCustID').val() == "True") accountToolbarXML += '<item type="button" id="setCustID" text="Set Customer ID"/>';
    accountToolbarXML += "</toolbar>";
    accountToolbar.loadStruct(accountToolbarXML);

    accountToolbar.attachEvent("onClick", function (id) {
        if (id == "addButton") {
            loadNewAddAccountWindow();
        }
        if (id == "popButton") {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            else {
                data = data.split(",");
            }
            loadNewEditPOPWindow(data);
        }

        if (id == "setCustID") {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            showNewSetCustomerIdWindow(data);
        }

        if (id.indexOf("act_") == 0 || id.indexOf("deact_") == 0) {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            else {
                data = data.split(",");
            }

            var seller = id.substring(id.indexOf("_") + 1, id.length);
            var active = 'false';
            if (id.indexOf("act_") == 0) active = 'true';
            if (id.indexOf("deact_") == 0) active = 'false';

            ajaxRequest("put", "/api/accountgroup?ids=" + data + "&seller=" + seller + "&active=" + active).done(function (data) {
                loadNewAccounts();
            });

            return true;
        }

        if (id == 'deleteButton') {
            var data = accountsGrid.getSelectedId();
            if (data == null) {
                var rowId = accountsGrid.contextID.split("_");
                data = [rowId[0]];
            }
            else {
                data = data.split(",");
            }

            $.each(data, function (k, v) {
                ajaxRequest("delete", "/api/accountgroup/" + v).done(function (data) {
                    loadNewAccounts();
                });
            });

            return true;
        }
    });

    //grid
    accountsGrid = left.attachGrid();
    accountsGrid.setIconsPath(imgPath.grid);
    if ($('#adminUser').val() == "True" || $('#setCCID').val() == "True") {
        accountsGrid.setHeader(["Id", "Username", "Password", "Active", "CC ID"]);
        accountsGrid.setColTypes("ro,ed,ed,clist,ed");
        accountsGrid.setColSorting('str,str,str,str,str');
        accountsGrid.setColumnIds("id,username,password,activeSellers,cC_ID");
        accountsGrid.setInitWidthsP("0,30,20,40,10");
    }
    else {
        accountsGrid.setHeader(["Id", "Username", "Password", "Active"]);
        accountsGrid.setColTypes("ro,ed,ed,clist");
        accountsGrid.setColSorting('str,str,str,str');
        accountsGrid.setColumnIds("id,username,password,activeSellers");
        accountsGrid.setInitWidthsP("0,30,20,50");
    }
    accountsGrid.enableMultiselect(true);
    accountsGrid.setColumnHidden(0, true);
    accountsGrid.init();

    loadSellersForAccounts(accountToolbar, accountsGrid);

    accountsGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2 && (cInd == 1 || cInd == 2 || cInd == 4)) {
            if (nValue != oValue) {
                var accountGroup = { Id: rId };

                accountGroup.Username = accountsGrid.cells(rId, 1).getValue();
                accountGroup.Password = accountsGrid.cells(rId, 2).getValue();
                if (accountsGrid.getColumnsNum() == 5) accountGroup.CC_ID = accountsGrid.cells(rId, 4).getValue();
                //update the order
                ajaxRequest("put", "/api/accountgroup/" + rId, accountGroup).done(function (data) {
                    dhtmlx.message("Your account has been updated!");
                });

            }
            return true;
        }

        if (stage == 2 && cInd == 3) {
            if (nValue != oValue) {
                var accountGroup = { Id: rId };
                accountGroup.ActiveSellers = accountsGrid.cells(rId, 3).getValue();
                //update the order
                ajaxRequest("put", "/api/accountgroup/" + rId, accountGroup).done(function (data) {
                    dhtmlx.message("Your account has been updated!");
                });

            }
            return true;
        }

        return true;
    });
    accountsGrid.attachEvent("onRowSelect", function (rid, cInd) {
        accountId = rid;

        loadNewCreditCards(accountId);
    });

    loadNewAccounts();

    var right = accountsLayout.cells('b');
    right.setText("Credit Cards");
    right.setWidth(300);
    var creditCardsToolbar = right.attachToolbar();
    creditCardsToolbar.setIconsPath(imgPath.toolbar);

    var creditCardsToolbarXMLString = '<toolbar>';
    creditCardsToolbarXMLString += '<item type="button" id="add" img="add.png" title="Add CreditCard"/>';
    creditCardsToolbarXMLString += '</toolbar>';
    creditCardsToolbar.loadStruct(creditCardsToolbarXMLString);
    creditCardsToolbar.attachEvent("onClick", function (id) {
        if (id == "add" && accountId != 0) {
            loadNewAddCreditCardWindow(accountId);
        }
    });

    var creditCardsContextMenu = new dhtmlXMenuObject();
    creditCardsContextMenu.setIconsPath(imgPath.toolbar);
    creditCardsContextMenu.renderAsContextMenu();
    creditCardsContextMenu.loadStruct('<menu><item type="item" id="del" text="Delete"/></menu>');
    creditCardsContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = creditCardsGrid.contextID.split("_");
        //Get the id of the account
        var id = data[0];
        switch (menuitemId) {
            case 'del':
                dhtmlx.confirm({
                    type: "confirm-warning",
                    text: "Are you sure you want to remove this creditcard?",
                    callback: function () {
                        ajaxRequest("delete", 'api/creditcard/' + id).done(function (data) {
                            dhtmlx.message("Your creditcard has been deleted!");
                            loadNewCreditCards(accountId);
                        });
                    }
                });
                break;
        }
        return true;
    });

    creditCardsGrid = right.attachGrid();
    creditCardsGrid.setIconsPath(imgPath.grid);

    creditCardsGrid.setHeader(["Id", "Name", "CreditCard4", "Customer ID"]);
    creditCardsGrid.setColTypes("ro,ed,ed,ed");
    creditCardsGrid.setColSorting('int,str,str,int');
    creditCardsGrid.setColumnIds("id,name,creditCard4,customerId");
    creditCardsGrid.enableContextMenu(creditCardsContextMenu);
    creditCardsGrid.setColumnHidden(0, true);
    creditCardsGrid.setInitWidthsP("0,50,20,30");
    creditCardsGrid.init();
    creditCardsGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2) {
            var creditCard = { Id: rId };
            creditCard.Name = creditCardsGrid.cells(rId, 1).getValue();
            creditCard.CreditCard4 = creditCardsGrid.cells(rId, 2).getValue();
            creditCard.CustomerId = creditCardsGrid.cells(rId, 3).getValue();

            //update the order
            ajaxRequest("put", "/api/creditcard/" + rId, creditCard).done(function (data) {
                dhtmlx.message("Your creditcard has been updated!");
            });

            return true;
        }
    });
}

function showUsersWindow() {
    var windows = new dhtmlXWindows();
    var userId = 0;

    usersWindow = windows.createWindow('usersWindow', 0, 0, 960, 550);
    usersWindow.setText('All Users');
    usersWindow.centerOnScreen();

    var usersLayout = usersWindow.attachLayout("2U");

    var left = usersLayout.cells('a');
    left.setText("Users");

    //toolbar
    var userToolbar = left.attachToolbar();
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

    var userContextMenu = new dhtmlXMenuObject();
    userContextMenu.setIconsPath(imgPath.toolbar);
    userContextMenu.renderAsContextMenu();
    userContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = usersGrid.getSelectedId();
        switch (menuitemId) {
            case "edit":
                loadEditUserWindow(data);
                break;
            case "setskybox":
                loadSetSkyBoxWindow(data);
                break;
        }

        return true;
    });
    var userMenuXMLString = "<menu>";
    userMenuXMLString += '<item type="item" id="edit" text="Edit" />';
    userMenuXMLString += '<item type="item" id="setskybox" text="Set SkyBox" />';
    userMenuXMLString += '</menu>';
    userContextMenu.loadStruct(userMenuXMLString);

    //grid
    usersGrid = left.attachGrid();
    usersGrid.setIconsPath(imgPath.grid);
    usersGrid.setHeader(["Id", "Username", "Password", "Can AutoPOer?", "Mark PDF?", "Buyer Commission", "POSConnection", "Taxable", "Not Share", "POS", "CC ID?", "CustomerID?"]);
    usersGrid.setColTypes("ro,ed,ed,ch,ch,ch,ch,ch,ch,coro,ch,ch");
    usersGrid.setColSorting('str,str,str,str,str,str,str,str,str,str,str,str');
    usersGrid.setColumnIds("id,username,password,canAutoPOer,markPDF,buyerCommission,posConnection,taxable,notShare,selectedPos,setCCID,setCustID");
    usersGrid.setColumnHidden(0, true);
    usersGrid.setInitWidthsP("0,20,13,18,15,20,15,10,15,10,10,15");
    usersGrid.enableMultiselect(true);
    usersGrid.enableContextMenu(userContextMenu);

    var combo = usersGrid.getCombo(9);
    ajaxRequest("get", '/api/postype/').done(function (data) {
        if (data.length > 0) {
            var options = [];
            $.each(data, function (i, v) {
                combo.put(v.id, v.name);
            });
        }
    }).fail(failCallback);

    usersGrid.init();

    usersGrid.attachEvent("onChange", function (rId, cInd, state) {
        alert("onChange");
    })
    usersGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2 && (cInd == 1 || cInd == 2 || cInd == 9)) {
            if (nValue != oValue) {
                var user = { Id: rId };

                user.Username = usersGrid.cells(rId, 1).getValue();
                user.Password = usersGrid.cells(rId, 2).getValue();
                user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
                user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
                user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
                user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
                user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
                user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
                user.SelectedPos = usersGrid.cells(rId, 9).getValue();
                user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
                user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
                //update the order
                ajaxRequest("put", "/api/users/" + rId, user).done(function (data) {
                    dhtmlx.message("This user has been updated!");
                });

            }
            return true;
        }

        return true;
    });
    usersGrid.attachEvent("onCheck", function (rId, cInd, state) {
        var user = { Id: rId };
        if (cInd == 3) {
            user.CanAutoPOer = state;
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 4) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = state;
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 5) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = state;
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 6) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = state;
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 7) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = state;
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 8) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = state;
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 10) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = state;
            user.SetCustID = usersGrid.cells(rId, 11).getValue() == 1 ? "true" : "false";
        }
        if (cInd == 11) {
            user.CanAutoPOer = usersGrid.cells(rId, 3).getValue() == 1 ? "true" : "false";
            user.MarkPDF = usersGrid.cells(rId, 4).getValue() == 1 ? "true" : "false";
            user.BuyerCommission = usersGrid.cells(rId, 5).getValue() == 1 ? "true" : "false";
            user.POSConnection = usersGrid.cells(rId, 6).getValue() == 1 ? "true" : "false";
            user.Taxable = usersGrid.cells(rId, 7).getValue() == 1 ? "true" : "false";
            user.NotShare = usersGrid.cells(rId, 8).getValue() == 1 ? "true" : "false";
            user.SetCCID = usersGrid.cells(rId, 10).getValue() == 1 ? "true" : "false";
            user.SetCustID = state;
        }
        //update the order
        ajaxRequest("put", "/api/users/" + rId, user).done(function (data) {
            dhtmlx.message("This user has been updated!");
        });
    });
    usersGrid.attachEvent("onRowSelect", function (rid, cInd) {
        userId = rid;

        loadProxies(userId);
    });

    loadUsers();


    var right = usersLayout.cells('b');
    right.setText("Proxies");
    right.setWidth(300);

    var proxiesToolbar = right.attachToolbar();
    proxiesToolbar.setIconsPath(imgPath.toolbar);

    var proxiesToolbarXMLString = '<toolbar>';
    proxiesToolbarXMLString += '<item type="button" id="add" img="add.png" title="Assign Proxy"/>';
    proxiesToolbarXMLString += '</toolbar>';
    proxiesToolbar.loadStruct(proxiesToolbarXMLString);
    proxiesToolbar.attachEvent("onClick", function (id) {
        if (id == "add" && userId != 0) {
            loadAddProxyWindow(userId);
        }
    });

    var proxyContextMenu = new dhtmlXMenuObject();
    proxyContextMenu.setIconsPath(imgPath.toolbar);
    proxyContextMenu.renderAsContextMenu();
    proxyContextMenu.loadStruct('<menu><item type="item" id="del" text="Delete"/></menu>');
    proxyContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = proxiesGrid.contextID.split("_");
        //Get the id of the account
        var id = data[0];
        switch (menuitemId) {
            case 'del':
                dhtmlx.confirm({
                    type: "confirm-warning",
                    text: "Are you sure you want to remove this proxy?",
                    callback: function () {
                        ajaxRequest("delete", 'api/proxy/' + id).done(function (data) {
                            dhtmlx.message("The proxy has been deleted!");
                            loadProxies(userId);
                        });
                    }
                });
                break;
        }
        return true;
    });

    proxiesGrid = right.attachGrid();
    proxiesGrid.setIconsPath(imgPath.grid);

    proxiesGrid.setHeader(["Id", "IP", "Port"]);
    proxiesGrid.setColTypes("ro,ed,ed");
    proxiesGrid.setColSorting('int,str,int');
    proxiesGrid.setColumnIds("id,ip,port");
    proxiesGrid.enableContextMenu(proxyContextMenu);
    proxiesGrid.setColumnHidden(0, true);
    proxiesGrid.setInitWidthsP("0,80,20");
    proxiesGrid.init();
    proxiesGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2) {
            var proxy = { Id: rId };
            proxy.IP = proxiesGrid.cells(rId, 1).getValue();
            proxy.Port = proxiesGrid.cells(rId, 2).getValue();

            //update the order
            ajaxRequest("put", "/api/proxy/" + rId, proxy).done(function (data) {
                dhtmlx.message("The Proxy has been updated!");
            });

            return true;
        }
    });
}

function loadEditUserWindow(id) {
    var windows = new dhtmlXWindows();
    var editUserWindow = windows.createWindow('editUserWindow', 400, 250, 453, 300);
    var editUserToolbar = editUserWindow.attachToolbar();
    editUserToolbar.setIconsPath(imgPath.toolbar);

    var userid = id;
    editUserToolbar.loadStruct('<toolbar><item type="button" id="saveUserBtn" img="up.png" title="Save"/><item type="button" id="cancelAccountBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    editUserToolbar.attachEvent("onClick", function (id) {
        if (id == "saveUserBtn") {
            if (!userFrom.validate()) return false;

            var userData = userFrom.getFormData();
            editUserWindow.progressOn();
            editUserToolbar.disableItem("saveUserBtn");
            userData.Id = userid;
            ajaxRequest('put', '/api/users/' + userid + "?edituser=1", userData).done(function (data) {
                dhtmlx.message("The user has been saved!");
                loadUsers();
                editUserWindow.progressOff();
                editUserWindow.close();
            });
        } else {
            editUserWindow.close();
        }
    });

    var str = [{
        type: "input",
        name: "POSConnectionString",
        label: "POS Connection:",
        labelWidth: 150,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }, {
        type: "input",
        name: "POSPDFPath",
        label: "POS PDF Path:",
        labelWidth: 150,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }, {
        type: "input",
        name: "CustomerId",
        label: "Customer Id:",
        labelWidth: 150,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }, {
        type: "input",
        name: "Loc",
        label: "Loc:",
        labelWidth: 150,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }
    //, {
    //    type: "checkbox",
    //    name: "CanAutoPOer",
    //    label: "Can AutoPOer:",
    //    labelWidth: 150
    //}
    //, {
    //    type: "checkbox",
    //    name: "MarkPDF",
    //    label: "Mark PDF:",
    //    labelWidth: 150
    //}
    ];

    var userFrom = editUserWindow.attachForm(str);

    ajaxRequest("get", "/api/users/" + id).done(function (data) {
        userFrom.setFormData({
            POSConnectionString: data.posConnectionString,
            POSPDFPath: data.pospdfPath,
            CustomerId: data.customerId,
            Loc: data.loc,
            //CanAutoPOer: data.CanAutoPOer,
            //MarkPDF: data.MarkPDF
        });
    });

    editUserWindow.setText('Edit User');
}

function loadSetSkyBoxWindow(id) {
    var windows = new dhtmlXWindows();
    var setSkyBoxWindow = windows.createWindow('setSkyBoxWindow', 400, 250, 453, 300);
    var setSkyBoxToolbar = setSkyBoxWindow.attachToolbar();
    setSkyBoxToolbar.setIconsPath(imgPath.toolbar);

    var userid = id;
    setSkyBoxToolbar.loadStruct('<toolbar><item type="button" id="saveSkyBoxBtn" img="up.png" title="Save"/><item type="button" id="canceSkyBoxBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    setSkyBoxToolbar.attachEvent("onClick", function (id) {
        if (id == "saveSkyBoxBtn") {
            if (!skyboxFrom.validate()) return false;

            var skyboxData = skyboxFrom.getFormData();
            setSkyBoxWindow.progressOn();
            setSkyBoxToolbar.disableItem("saveSkyBoxBtn");
            skyboxData.Id = userid;
            ajaxRequest('put', '/api/users/' + userid + "?edituser=1", skyboxData).done(function (data) {
                dhtmlx.message("The skybox has been saved!");
                loadUsers();
                setSkyBoxWindow.progressOff();
                setSkyBoxWindow.close();
            });
        } else {
            setSkyBoxWindow.close();
        }
    });

    var str = [{
        type: "input",
        name: "SkyBoxAccount",
        label: "SkyBox Account:",
        labelWidth: 150,
        inputWidth: 200,
        validate: "NotEmpty,ValidNumeric",
        required: true
    }, {
        type: "input",
        name: "SkyBoxApiToken",
        label: "SkyBox ApiToken:",
        labelWidth: 150,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }
    ];

    var skyboxFrom = setSkyBoxWindow.attachForm(str);

    ajaxRequest("get", "/api/users/" + id).done(function (data) {
        skyboxFrom.setFormData({
            SkyBoxAccount: data.skyBoxAccount,
            SkyBoxApiToken: data.skyBoxApiToken
        });
    });

    setSkyBoxWindow.setText('Set SkyBox');
}

function loadProxies(id) {
    ajaxRequest("get", "/api/proxy/" + id).done(function (data) {
        var ccData = {};
        ccData.total_count = data.length;
        ccData.pos = 0;
        ccData.data = data;

        proxiesGrid.clearAll();
        proxiesGrid.parse(ccData, "js");
    });
}



function showLogsWindow() {
    var windows = new dhtmlXWindows();

    logsWindow = windows.createWindow('logWindow', 0, 0, 800, 450);
    logsWindow.setText('Audit Logs');
    logsWindow.centerOnScreen();

    //toolbar
    var logToolbar = logsWindow.attachToolbar();
    logToolbar.addText('orderNumberText', 100, 'Order #:');
    logToolbar.addInput('orderNumberInput', 200);
    logToolbar.addButton('searchOrderNumber', 100, 'Search', null, null);
    logToolbar.attachEvent("onClick", function (id) {
        if (id == "searchOrderNumber") {
            logsGrid.clearAll();
            var number = logToolbar.getInput("orderNumberInput").value;
            logsGrid.load("/api/log/?orderNumber=" + number, function () {
                logsWindow.progressOff();
            }, "js");
        }
    });

    //grid
    logsGrid = logsWindow.attachGrid();
    logsGrid.setIconsPath(imgPath.grid);
    logsGrid.setHeader(["Id", "Seller", "Account", "Order Status", "Date", "Message"]);
    logsGrid.setColTypes("ro,ro,ro,ro,ro,ro");
    logsGrid.setColSorting('str,str,str,str,str,str');
    logsGrid.setColumnIds("id,sellerName,accountName,orderStatusName,createdDate,message");
    logsGrid.setColumnHidden(0, true);
    logsGrid.setInitWidthsP("0,15,20,18,18,29");

    logsGrid.init();

    logsGrid.enableSmartRendering(true, 30);
    logsGrid.setAwaitedRowHeight(20);
    logsWindow.progressOn();
    logsGrid.load("/api/log/", function () {
        logsWindow.progressOff();
    }, "js");
}

function showBuyersWindow() {
    var windows = new dhtmlXWindows();

    buyersWindow = windows.createWindow('buyersWindow', 0, 0, 800, 450);
    buyersWindow.setText('My Buyers');
    buyersWindow.centerOnScreen();

    //toolbar
    var buyersToolbar = buyersWindow.attachToolbar();
    buyersToolbar.setIconsPath(imgPath.toolbar);
    var buyersToolbarXML = "<toolbar>";
    buyersToolbarXML += '<item type="button" id="addButton" img="add.png" title="Add Buyer"/>';
    buyersToolbarXML += "</toolbar>";
    buyersToolbar.loadStruct(buyersToolbarXML);
    buyersToolbar.attachEvent("onClick", function (id) {
        if (id == "addButton") {
            loadAddBuyerWindow();
        }
    });

    //grid
    buyersGrid = buyersWindow.attachGrid();
    buyersGrid.setIconsPath(imgPath.grid);
    buyersGrid.setHeader(["Id", "UserId", "Name"]);
    buyersGrid.setColTypes("ro,ro,ed");
    buyersGrid.setColSorting('str,str,str');
    buyersGrid.setColumnIds("id,userId,name");
    buyersGrid.setColumnHidden(0, true);
    buyersGrid.setColumnHidden(1, true);
    buyersGrid.setInitWidthsP("0,0,100");

    buyersGrid.init();

    buyersGrid.enableSmartRendering(true, 30);
    buyersGrid.setAwaitedRowHeight(20);
    buyersWindow.progressOn();
    buyersGrid.load("/api/buyer/", function () {
        buyersWindow.progressOff();
    }, "js");

    buyersGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2) {
            if (nValue != oValue) {
                var buyer = { Id: rId };
                buyer.Name = nValue;

                ajaxRequest("put", "/api/buyer/" + rId, buyer).done(function (data) {
                    dhtmlx.message("this buyer has been updated!");
                });

            }
            return true;
        }
        return true;
    });
}

function showMyConnectionWindow() {
    var windows = new dhtmlXWindows();

    myConnectionWindow = windows.createWindow('myConnectionWindow', 0, 0, 400, 250);
    myConnectionWindow.setText('My Connection');
    myConnectionWindow.centerOnScreen();

    //toolbar
    var myConnectionToolbar = myConnectionWindow.attachToolbar();
    myConnectionToolbar.setIconsPath(imgPath.toolbar);
    var myConnectionToolbarXML = "<toolbar>";
    myConnectionToolbarXML += '<item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/>';
    myConnectionToolbarXML += "</toolbar>";
    myConnectionToolbar.loadStruct(myConnectionToolbarXML);
    myConnectionToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            if (!myConnectionFrom.validate()) return false;

            var myConnectionData = myConnectionFrom.getFormData();
            myConnectionWindow.progressOn();
            myConnectionToolbar.disableItem("saveBtn");
            ajaxRequest('get', "/api/myconnection?dbuser=" + myConnectionData['dbuser'] + '&password=' + myConnectionData['password']).done(function (data) {
                dhtmlx.message("Your Connection has been saved!");
                myConnectionWindow.progressOff();
                myConnectionWindow.close();
            });
        } else {
            myConnectionWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "dbuser",
        label: "POS User:",
        labelWidth: 90,
        inputWidth: 200,
        required: true,
        validate: 'NotEmpty'
    },
    {
        type: "input",
        name: "password",
        label: "Password:",
        labelWidth: 90,
        inputWidth: 200,
        required: true,
        validate: 'NotEmpty'
    }];

    var myConnectionFrom = myConnectionWindow.attachForm(str);
}

function showAssignBuyerWindow(lineitemids) {
    var windows = new dhtmlXWindows();

    assignBuyerWindow = windows.createWindow('assignBuyerWindow', 0, 0, 500, 300);
    assignBuyerWindow.setText('Assign Buyer');
    assignBuyerWindow.centerOnScreen();

    //toolbar
    var assignBuyerToolbar = assignBuyerWindow.attachToolbar();
    assignBuyerToolbar.setIconsPath(imgPath.toolbar);
    var assignBuyerToolbarXML = "<toolbar>";
    assignBuyerToolbarXML += '<item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/>';
    assignBuyerToolbarXML += "</toolbar>";
    assignBuyerToolbar.loadStruct(assignBuyerToolbarXML);
    assignBuyerToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            var buyerid = assignBuyerGrid.getSelectedId();
            if (buyerid == null) {
                alert("Please choose a buyer")
                return true;
            }
            assignBuyerWindow.progressOn();
            assignBuyerToolbar.disableItem("saveBtn");
            $.ajax({
                url: "/api/buyer?buyerid=" + buyerid + "&lineitemids=" + lineitemids,
                type: "GET",
                success: function (data, textStatus, jqXHR) {
                    dhtmlx.message("The assign buyer has been saved!");
                    assignBuyerWindow.progressOff();
                    assignBuyerWindow.close();
                }
            });
        } else {
            assignBuyerWindow.close();
        }
    });

    //grid
    var assignBuyerGrid = assignBuyerWindow.attachGrid();
    assignBuyerGrid.setIconsPath(imgPath.grid);
    assignBuyerGrid.setHeader(["Id", "UserId", "Buyer Name"]);
    assignBuyerGrid.setColTypes("ro,ro,ro");
    assignBuyerGrid.setColSorting('str,str,str');
    assignBuyerGrid.setColumnIds("id,userId,name");
    assignBuyerGrid.setColumnHidden(0, true);
    assignBuyerGrid.setColumnHidden(1, true);
    assignBuyerGrid.setInitWidthsP("0,0,100");

    assignBuyerGrid.init();

    assignBuyerGrid.enableSmartRendering(true, 30);
    assignBuyerGrid.setAwaitedRowHeight(20);
    assignBuyerWindow.progressOn();
    assignBuyerGrid.load("/api/buyer/", function () {
        assignBuyerWindow.progressOff();
    }, "js");
}

function showAssignCommissionWindow(lineitemids) {
    var windows = new dhtmlXWindows();

    assignCommissionWindow = windows.createWindow('assignCommissionWindow', 0, 0, 300, 200);
    assignCommissionWindow.setText('Assign Commission');
    assignCommissionWindow.centerOnScreen();

    //toolbar
    var assignCommissionToolbar = assignCommissionWindow.attachToolbar();
    assignCommissionToolbar.setIconsPath(imgPath.toolbar);
    var assignCommissionToolbarXML = "<toolbar>";
    assignCommissionToolbarXML += '<item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/>';
    assignCommissionToolbarXML += "</toolbar>";
    assignCommissionToolbar.loadStruct(assignCommissionToolbarXML);
    assignCommissionToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            if (!commissionFrom.validate()) return false;

            var commissionData = commissionFrom.getFormData();
            assignCommissionWindow.progressOn();
            assignCommissionToolbar.disableItem("saveBtn");
            ajaxRequest('get', "/api/commission?lineitemids=" + lineitemids + '&commission=' + commissionData['commission'], commissionData).done(function (data) {
                dhtmlx.message("The commission has been saved!");
                assignCommissionWindow.progressOff();
                assignCommissionWindow.close();
            });
        } else {
            assignCommissionWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "commission",
        label: "Commission:",
        labelWidth: 90,
        inputWidth: 200,
        required: true,
        validate: 'ValidNumeric'
    }];

    var commissionFrom = assignCommissionWindow.attachForm(str);
}

function showSetCustomerIdWindow(ids, type) {
    var windows = new dhtmlXWindows();

    setCustomerIdWindow = windows.createWindow('setCustomerIdWindow', 0, 0, 300, 200);
    setCustomerIdWindow.setText('Set Customer ID');
    setCustomerIdWindow.centerOnScreen();

    //toolbar
    var customerIdToolbar = setCustomerIdWindow.attachToolbar();
    customerIdToolbar.setIconsPath(imgPath.toolbar);
    var customerIdToolbarXML = "<toolbar>";
    customerIdToolbarXML += '<item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/>';
    customerIdToolbarXML += "</toolbar>";
    customerIdToolbar.loadStruct(customerIdToolbarXML);
    customerIdToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            if (type == SET_CUST_ID.ORDER_LINES) {
                if (!customerIdFrom.validate()) return false;

                var customerIdData = customerIdFrom.getFormData();
                setCustomerIdWindow.progressOn();
                customerIdToolbar.disableItem("saveBtn");
                ajaxRequest('put', "/api/orderlineitem?lineitemids=" + ids + '&customerid=' + customerIdData['customerId'], null).done(function (data) {
                    dhtmlx.message("The customer id has been saved!");
                    setCustomerIdWindow.progressOff();
                    setCustomerIdWindow.close();
                });
            }
            else if (type == SET_CUST_ID.ALL_CREDIT_CARDS) {
                if (!customerIdFrom.validate()) return false;

                var customerIdData = customerIdFrom.getFormData();
                setCustomerIdWindow.progressOn();
                customerIdToolbar.disableItem("saveBtn");
                ajaxRequest('put', "/api/account?accids=" + ids + '&customerid=' + customerIdData['customerId'], null).done(function (data) {
                    dhtmlx.message("The customer id has been saved!");
                    setCustomerIdWindow.progressOff();
                    setCustomerIdWindow.close();

                    var arrIds = ids.split(",");
                    loadCreditCards(arrIds[arrIds.length -1]);
                });
            }
        } else {
            setCustomerIdWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "customerId",
        label: "Customer ID:",
        labelWidth: 90,
        inputWidth: 200,
        required: true,
        validate: 'ValidNumeric'
    }];

    var customerIdFrom = setCustomerIdWindow.attachForm(str);
}

function showNewSetCustomerIdWindow(ids) {
    var windows = new dhtmlXWindows();

    setCustomerIdWindow = windows.createWindow('setCustomerIdWindow', 0, 0, 300, 200);
    setCustomerIdWindow.setText('Set Customer ID');
    setCustomerIdWindow.centerOnScreen();

    //toolbar
    var customerIdToolbar = setCustomerIdWindow.attachToolbar();
    customerIdToolbar.setIconsPath(imgPath.toolbar);
    var customerIdToolbarXML = "<toolbar>";
    customerIdToolbarXML += '<item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/>';
    customerIdToolbarXML += "</toolbar>";
    customerIdToolbar.loadStruct(customerIdToolbarXML);
    customerIdToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            if (!customerIdFrom.validate()) return false;

            var customerIdData = customerIdFrom.getFormData();
            setCustomerIdWindow.progressOn();
            customerIdToolbar.disableItem("saveBtn");
            ajaxRequest('put', "/api/accountgroup?ids=" + ids + '&customerid=' + customerIdData['customerId'], null).done(function (data) {
                dhtmlx.message("The customer id has been saved!");
                setCustomerIdWindow.progressOff();
                setCustomerIdWindow.close();

                var arrIds = ids.split(",");
                loadNewCreditCards(arrIds[arrIds.length - 1]);
            });
        } else {
            setCustomerIdWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "customerId",
        label: "Customer ID:",
        labelWidth: 90,
        inputWidth: 200,
        required: true,
        validate: 'ValidNumeric'
    }];

    var customerIdFrom = setCustomerIdWindow.attachForm(str);
}

function showSetSharePriceWindow(lineitemids) {
    var windows = new dhtmlXWindows();

    setSharePriceWindow = windows.createWindow('setSharePriceWindow', 0, 0, 300, 200);
    setSharePriceWindow.setText('Set Share Price');
    setSharePriceWindow.centerOnScreen();

    //toolbar
    var sharePriceToolbar = setSharePriceWindow.attachToolbar();
    sharePriceToolbar.setIconsPath(imgPath.toolbar);
    var sharePriceToolbarXML = "<toolbar>";
    sharePriceToolbarXML += '<item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/>';
    sharePriceToolbarXML += "</toolbar>";
    sharePriceToolbar.loadStruct(sharePriceToolbarXML);
    sharePriceToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            if (!sharePriceFrom.validate()) return false;

            var sharePriceData = sharePriceFrom.getFormData();
            setSharePriceWindow.progressOn();
            sharePriceToolbar.disableItem("saveBtn");
            ajaxRequest('put', "/api/orderlineitem?lineitemids=" + lineitemids + '&sharePrice=' + sharePriceData['sharePrice'], null).done(function (data) {
                dhtmlx.message("The share price has been saved!");
                setSharePriceWindow.progressOff();
                setSharePriceWindow.close();
            });
        } else {
            setSharePriceWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "sharePrice",
        label: "Share Price:",
        labelWidth: 90,
        inputWidth: 200,
        required: true,
        validate: 'ValidNumeric'
    }];

    var sharePriceFrom = setSharePriceWindow.attachForm(str);
}

function showProcessingWindow() {
    var windows = new dhtmlXWindows();

    processingWindow = windows.createWindow('processingWindow', 0, 0, 800, 450);
    processingWindow.setText('Processing Orders...');
    processingWindow.centerOnScreen();
    //processingWindow.button("close").hide();

    //grid
    processingGrid = processingWindow.attachGrid();
    processingGrid.setIconsPath(imgPath.grid);
    processingGrid.setHeader(["Id", "Seller", "Account", "Date", "Message"]);
    processingGrid.setColTypes("ro,ro,ro,ro,ro");
    processingGrid.setColSorting('str,str,str,str,str');
    processingGrid.setColumnIds("id,sellerName,accountName,createdDate,message");
    processingGrid.setColumnHidden(0, true);
    processingGrid.setInitWidthsP("0,12,20,15,50");

    processingGrid.init();

    //processingGrid.enableSmartRendering(true, 30);
    //processingGrid.setAwaitedRowHeight(20);
    processingWindow.progressOn();
    //processingGrid.load("/api/logDebug/", function () {
    //}, "js");
}

function onSetHeadlinerLink(orderId) {
    var windows = new dhtmlXWindows();

    var selectHeadlinerWindow = windows.createWindow('headlinersWindow', 400, 200, 453, 270);
    selectHeadlinerWindow.setModal(true);
    selectHeadlinerWindow.setText('Select Headliner');

    var selectHeadlinerToolbar = selectHeadlinerWindow.attachToolbar();
    selectHeadlinerToolbar.setIconsPath(imgPath.toolbar);
    selectHeadlinerToolbar.addText('headlinerText', 100, 'Headliner:');
    selectHeadlinerToolbar.addInput('headlinerInput', 100);
    selectHeadlinerToolbar.addButton('searchHeadliner', 100, 'Search', null, null);
    selectHeadlinerToolbar.loadStruct('<toolbar><item type="button" id="saveHeadliner" img="up.png" title="Save"/><item type="button" id="cancelHeadliner" img="cross.png" title="Cancel"/></toolbar>', function () { });

    selectHeadlinerToolbar.attachEvent("onClick", function (id) {
        if (id == "searchHeadliner") {
            headlinersGrid.clearAll();
            var headliner = selectHeadlinerToolbar.getInput("headlinerInput").value;
            headlinersGrid.load("/api/headliners?search=" + headliner, function () {
                selectHeadlinerWindow.progressOff();
            }, "js");
        }
        if (id == "saveHeadliner") {
            var headlinerId = headlinersGrid.getSelectedId();
            if (headlinerId == null) {
                dhtmlx.alert("Please select a headliner!");
            }
            else {
                var rId = orderId; // map orders grid row id
                var eventName = mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.EVENT_NAME).getValue();

                var val = headlinerId;
                var txt = headlinersGrid.cells(headlinerId, 1).getValue();

                // save the had. id and head. name back in mapOrdersGrid
                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.HEAD_ID).setValue(val);
                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.HEADLINER).setValue(txt);
                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.EV_ID).setValue(null);
                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.POS_EVENT).setValue("");

                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.IMG).setValue("app/red.gif");
                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.INSTR).setValue("Order is not mapped.<br/>Please select both headliner and event!");

                mapOrdersGrid.forEachRow(function (id) {
                    if (id != rId) {
                        var ev_nm = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.EVENT_NAME).getValue();
                        var h_id = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.HEAD_ID).getValue();

                        if (h_id == '' && ev_nm == eventName) {
                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.HEADLINER).setValue(txt);
                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.HEAD_ID).setValue(val);

                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.EV_ID).setValue(null);
                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.POS_EVENT).setValue("");

                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.IMG).setValue("app/red.gif");
                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.INSTR).setValue("Order is not mapped.<br/>Please select both headliner and event!");
                        }
                    }
                });

                selectHeadlinerWindow.close();
            }
        }
        if (id == "cancelHeadliner") {
            selectHeadlinerWindow.close();
        }
    });

    headlinersGrid = selectHeadlinerWindow.attachGrid();
    headlinersGrid.setIconsPath(imgPath.grid);
    headlinersGrid.setHeader(["Headliner Id", "Headliner"]);
    headlinersGrid.setColTypes("ro,ro");
    headlinersGrid.setColSorting('str,str');
    headlinersGrid.setColumnIds("id,headliner");
    headlinersGrid.enableMultiselect(false);
    headlinersGrid.setInitWidthsP("20,80");

    headlinersGrid.init();
    headlinersGrid.enableSmartRendering(true, 30);
    headlinersGrid.setAwaitedRowHeight(20);

    selectHeadlinerWindow.progressOn();
    headlinersGrid.load("/api/headliners", function () {
        selectHeadlinerWindow.progressOff();
    }, "js");
}

function onSetEventLink(orderId) {
    var rId = orderId;
    var hId = mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.HEAD_ID).getValue();

    if (hId == '') {
        dhtmlx.alert("Please set the headliner first!");
        return false;
    }

    var windows = new dhtmlXWindows();

    var selectEventWindow = windows.createWindow('selectEventWindow', 400, 200, 453, 270);
    selectEventWindow.setModal(true);
    selectEventWindow.setText('Select Event');

    var selectEventToolbar = selectEventWindow.attachToolbar();
    selectEventToolbar.setIconsPath(imgPath.toolbar);
    selectEventToolbar.loadStruct('<toolbar><item type="button" id="saveEvent" img="up.png" title="Save"/><item type="button" id="cancelEvent" img="cross.png" title="Cancel"/></toolbar>', function () { });

    selectEventToolbar.attachEvent("onClick", function (id) {
        if (id == "saveEvent") {
            var eventId = eventsGrid.getSelectedId();
            if (eventId == null) {
                dhtmlx.alert("Please select an event!");
            }
            else {
                var eventDt = mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.EVENT_DATE).getValue();

                var val = eventId;
                var txt = eventsGrid.cells(eventId, 1).getValue();

                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.EV_ID).setValue(val);
                mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.POS_EVENT).setValue(txt);

                if (val == '') {
                    mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.IMG).setValue("app/red.gif");
                    mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.INSTR).setValue("Order is not mapped.<br/>Please select both headliner and event!");
                }
                else {
                    mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.IMG).setValue("app/green.gif");
                    mapOrdersGrid.cells(rId, MAP_ORDERS_COLS.INSTR).setValue("Order is mapped.");
                }

                mapOrdersGrid.forEachRow(function (id) {
                    if (id != rId) {
                        var ev_dt = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.EVENT_DATE).getValue();
                        var h_id = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.HEAD_ID).getValue();
                        var e_id = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.EV_ID).getValue();

                        if (e_id == '' && h_id == hId && ev_dt == eventDt) {

                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.EV_ID).setValue(val);
                            mapOrdersGrid.cells(id, MAP_ORDERS_COLS.POS_EVENT).setValue(txt);

                            if (val == '') {
                                mapOrdersGrid.cells(id, MAP_ORDERS_COLS.IMG).setValue("app/red.gif");
                                mapOrdersGrid.cells(id, MAP_ORDERS_COLS.INSTR).setValue("Order is not mapped.<br/>Please select both headliner and event!");
                            }
                            else {
                                mapOrdersGrid.cells(id, MAP_ORDERS_COLS.IMG).setValue("app/green.gif");
                                mapOrdersGrid.cells(id, MAP_ORDERS_COLS.INSTR).setValue("Order is mapped.");
                            }
                        }
                    }
                });

                selectEventWindow.close();
            }
        }
        if (id == "cancelEvent") {
            selectEventWindow.close();
        }
    });

    eventsGrid = selectEventWindow.attachGrid();
    eventsGrid.setIconsPath(imgPath.grid);
    eventsGrid.setHeader(["Event Id", "Event"]);
    eventsGrid.setColTypes("ro,ro");
    eventsGrid.setColSorting('str,str');
    eventsGrid.setColumnIds("id,eventName");
    eventsGrid.enableMultiselect(false);
    eventsGrid.setInitWidthsP("15,85");

    eventsGrid.init();

    eventsGrid.enableSmartRendering(true, 30);
    eventsGrid.setAwaitedRowHeight(20);

    selectEventWindow.progressOn();
    eventsGrid.load("/api/events?orderId=" + orderId + "&headlinerId=" + hId, function () {
        selectEventWindow.progressOff();
    }, "js");
}

function showMapOrdersWindow(data, lineIds) {
    var windows = new dhtmlXWindows();

    // window
    mapOrdersWindow = windows.createWindow('mapOrdersWindow', 0, 0, 1100, 450);
    mapOrdersWindow.setText('Map orders');
    mapOrdersWindow.centerOnScreen();
    mapOrdersWindow.autoClosed = false;

    mapOrdersWindow.attachEvent("onClose", function (win) {
        if (mapOrdersWindow.autoClosed == false) {
            processingWindow.setText('Cancelled!');

            orderToolbar.enableItem("ProcessNew");
            orderToolbar.enableItem("UpdateOld");
            orderToolbar.enableItem("ProcessAll");
            orderToolbar.enableItem("ProcessRetry");
            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                orderToolbar.enableItem("AutoPOer");
                orderToolbar.enableItem("PDFsAttach");
            }
        }
        if (mapOrdersPopup != null && mapOrdersPopup.isVisible()) {
            mapOrdersPopup.hide();
        }
        return true;
    });

    // toolbar
    var mapOrdersToolbar = mapOrdersWindow.attachToolbar();
    mapOrdersToolbar.setIconsPath(imgPath.toolbar);
    mapOrdersToolbar.loadStruct('<toolbar><item type="button" id="saveMappings" img="up.png" title="Save and Continue POing"/><item type="button" id="cancelMappings" img="cross.png" title="Cancel"/></toolbar>', function () { });
    mapOrdersToolbar.attachEvent("onClick", function (id) {
        if (id == "saveMappings") {
            var mappings = [];
            var ok = true;

            mapOrdersGrid.forEachRow(function (id) {
                var hId = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.HEAD_ID).getValue();
                var eId = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.EV_ID).getValue();
                if (hId == null || hId == 0 || eId == null || eId == 0) ok = false;

                mappings[mappings.length] = {
                    orderId: mapOrdersGrid.cells(id, MAP_ORDERS_COLS.ORDER_ID).getValue(),
                    headlinerId: hId,
                    headlinerText: mapOrdersGrid.cells(id, MAP_ORDERS_COLS.HEADLINER).getTitle(),
                    eventId: eId,
                    eventText: mapOrdersGrid.cells(id, MAP_ORDERS_COLS.POS_EVENT).getTitle()
                };
            });

            if (ok) {
                var sendData = { data: mappings, orderLineIds: lineIds };

                ajaxRequest('post', '/api/maporders/', sendData).done(function (data) {
                    mapOrdersWindow.autoClosed = true;
                    mapOrdersWindow.close();

                    processingWindow.progressOn();

                    var options = {
                        dataType: "json",
                        contentType: "application/json",
                        cache: false,
                        type: 'post',
                        data: JSON.stringify(sendData),

                        success: function (data, textStatus, jqXHR) {
                            processingGrid.clearAll();
                            processingGrid.load("/api/logDebug", function () {
                            }, "js");

                            processingWindow.progressOff();
                            processingWindow.setText('Done!');

                            dhtmlx.alert("POing complete!");

                            orderToolbar.enableItem("ProcessNew");
                            orderToolbar.enableItem("UpdateOld");
                            orderToolbar.enableItem("ProcessAll");
                            orderToolbar.enableItem("ProcessRetry");
                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                orderToolbar.enableItem("AutoPOer");
                                orderToolbar.enableItem("PDFsAttach");
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            processingGrid.clearAll();
                            processingGrid.load("/api/logDebug", function () {
                            }, "js");

                            processingWindow.progressOff();
                            processingWindow.setText('Error!');

                            if (jqXHR.responseText != undefined) {
                                var errJson = jQuery.parseJSON(jqXHR.responseText);
                                dhtmlx.alert({
                                    title: errJson.message,
                                    text: errJson.exceptionMessage + "<br/>" + errJson.exceptionType
                                });
                            }

                            orderToolbar.enableItem("ProcessNew");
                            orderToolbar.enableItem("UpdateOld");
                            orderToolbar.enableItem("ProcessAll");
                            orderToolbar.enableItem("ProcessRetry");
                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                orderToolbar.enableItem("AutoPOer");
                                orderToolbar.enableItem("PDFsAttach");
                            }
                        },
                        complete: function (XMLHttpRequest, status) {
                            if (status == 'timeout') {
                                ajaxTimeoutTest.abort();
                                dhtmlx.alert("timeout");
                            }
                        }
                    };

                    var antiForgeryToken = $("#antiForgeryToken").val();
                    if (antiForgeryToken) {
                        options.headers = {
                            'RequestVerificationToken': antiForgeryToken
                        }
                    }
                    $.ajax('/api/autopoing', options);

                }).fail(function () {
                    dhtmlx.alert("Try again!");
                });
            }
            else {
                dhtmlx.alert("Please select the right headliner and event for each of the orders!");
            }
        }
        if (id == "cancelMappings") {
            mapOrdersWindow.close();
        }
    });

    //grid
    mapOrdersGrid = mapOrdersWindow.attachGrid();
    mapOrdersGrid.setIconsPath(imgPath.grid);
    mapOrdersGrid.setHeader(["OrderId", "Instructions", "Ready", "Set head.", "Set event", "Conf. No.", "Event Name", "Event Date", "Venue", "Head. Id", "POS Headliner", "Event  Id", "POS Event Name"]);
    mapOrdersGrid.setColumnIds("orderId,instructions,actionImage,headLink,eventLink,confirmationNumber,eventName,eventDateString,venue,headlinerId,headlinerText,eventId,eventText");
    mapOrdersGrid.setColTypes("ro,ro,img,link,link,ro,ro,ro,ro,ro,ro,ro,ro");
    mapOrdersGrid.setColAlign("left,left,center,center,center,left,left,left,left,left,left,left,left")
    mapOrdersGrid.setColSorting('int,str,str,str,str,str,str,str,str,str,str,str,str');
    mapOrdersGrid.setInitWidths("0,0,50,70,70,100,150,100,150,0,150,0,200");
    mapOrdersGrid.setColumnHidden(MAP_ORDERS_COLS.ORDER_ID, true);
    mapOrdersGrid.setColumnHidden(MAP_ORDERS_COLS.INSTR, true);
    mapOrdersGrid.setColumnHidden(MAP_ORDERS_COLS.HEAD_ID, true);
    mapOrdersGrid.setColumnHidden(MAP_ORDERS_COLS.EV_ID, true);

    mapOrdersGrid.init();

    mapOrdersGrid.enableSmartRendering(true, 30);
    mapOrdersGrid.setAwaitedRowHeight(20);

    mapOrdersGrid.attachEvent("onMouseOver", function (id, ind) {
        if (ind == MAP_ORDERS_COLS.IMG) {
            var myArea = mapOrdersGrid.cells(id, MAP_ORDERS_COLS.IMG).cell;

            // collect coords and dimension
            var x = window.dhx4.absLeft(myArea);
            var y = window.dhx4.absTop(myArea);
            var width = myArea.offsetWidth;
            var height = myArea.offsetHeight;

            // show popup
            if (!mapOrdersPopup) {
                mapOrdersPopup = new dhtmlXPopup();
                mapOrdersPopup.attachEvent("onContentClick", function () {
                    mapOrdersPopup.hide();
                });
            }
            mapOrdersPopup.attachHTML(mapOrdersGrid.cells(id, MAP_ORDERS_COLS.INSTR).getValue());
            mapOrdersPopup.show(x, y, width, height);
        }
        return true;
    });

    mapOrdersGrid.parse(data, "js");
}

function showProcessingErrorWindow() {
    var windows = new dhtmlXWindows();

    processingErrorWindow = windows.createWindow('processingErrorWindow', 0, 0, 800, 450);
    processingErrorWindow.setText('Processing Error');
    processingErrorWindow.centerOnScreen();

    //toolbar
    var processingErrorToolbar = processingErrorWindow.attachToolbar();
    processingErrorToolbar.addButton("recheck", 1, "Recheck Missed Orders");
    processingErrorToolbar.addButton("archive", 2, "Archive");
    processingErrorToolbar.attachEvent("onClick", function (id) {
        if (id == "recheck") {
            // delete all debug logs now.
            ajaxRequest("delete", 'api/logDebug/0').done(function (data) {

                showProcessingWindow();

                var id_of_setinterval = setInterval(function () {
                    processingGrid.clearAll();
                    processingGrid.load("/api/logDebug", function () {
                    }, "js");
                }, 10000);


                $.ajax({
                    url: "/api/recheckorders",
                    type: "GET",
                    success: function (data, textStatus, jqXHR) {

                        processingGrid.clearAll();
                        processingGrid.load("/api/logDebug", function () {}, "js");
                        processingWindow.progressOff();

                        dhtmlx.alert("Process Orders complete!");
                        processingWindow.setText('Done!');
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        //if fails
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");

                        processingWindow.progressOff();
                        clearInterval(id_of_setinterval);

                        processingWindow.setText('Error!');
                        if (jqXHR.responseJSON != undefined) {
                            dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                        }
                    },
                    complete: function (XMLHttpRequest, status) {
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");

                        processingWindow.progressOff();
                        clearInterval(id_of_setinterval);
                        if (status == 'timeout') {
                            ajaxTimeoutTest.abort();
                            dhtmlx.alert("timeout");
                        }
                    }

                });
            });
        }
        if (id == "archive") {
            var orderIds = processingErrorGrid.getSelectedId();
            if (orderIds == null) {
                dhtmlx.alert("Please choose orders!");
            }
            else {
                ajaxRequest("put", "/api/processingerror/?orderIds=" + orderIds).done(function () {
                    processingErrorGrid.clearAll();
                    processingErrorGrid.load("/api/processingerror/", 'js');
                });
            }
        }
    });

    //grid
    processingErrorGrid = processingErrorWindow.attachGrid();
    processingErrorGrid.setIconsPath(imgPath.grid);
    processingErrorGrid.setHeader(["Id", "Event Name", " Venue", "Event Date", "Confirmation Number", " Confirm Date", "Username"]);
    processingErrorGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro");
    processingErrorGrid.setColSorting('str,str,str,str,str,str,str');
    processingErrorGrid.setColumnIds("id,eventName,venue,eventDateString,confirmationNumber,confirmDateString,username");
    processingErrorGrid.setColumnHidden(0, true);
    processingErrorGrid.enableMultiselect(true);
    processingErrorGrid.setInitWidthsP("0,25,15,15,20,15,10");

    processingErrorGrid.init();

    processingErrorGrid.enableSmartRendering(true, 30);
    processingErrorGrid.setAwaitedRowHeight(20);
    processingErrorWindow.progressOn();
    processingErrorGrid.load("/api/processingerror/", function () {
        processingErrorWindow.progressOff();
    }, "js");
}

function showAutoPOerLogWindow(lineItemIds) {
    var windows = new dhtmlXWindows();

    autoPOerLogWindow = windows.createWindow('autoPOerLogsWindow', 0, 0, 800, 450);
    autoPOerLogWindow.setText('PO Logs');
    autoPOerLogWindow.centerOnScreen();

    var statusBar = autoPOerLogWindow.attachStatusBar({
        height: 25,
        text: "<div> Green: Success; Yellow: Un-map Headliner; Red: Multiple Events.</div>"
    });

    var errorToolbar = autoPOerLogWindow.attachToolbar();
    errorToolbar.setIconsPath(imgPath.toolbar);
    errorToolbar.addButton('reAutoPOer', 100, 'Retry PO');
    errorToolbar.attachEvent("onClick", function (id) {
        if (id == "reAutoPOer") {

            orderToolbar.disableItem("ProcessNew");
            orderToolbar.disableItem("UpdateOld");
            orderToolbar.disableItem("ProcessAll");
            orderToolbar.disableItem("ProcessRetry");
            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                orderToolbar.disableItem("AutoPOer");
                orderToolbar.disableItem("PDFsAttach");
            }
            // delete all debug logs now.
            ajaxRequest("delete", 'api/logDebug/0').done(function (data1) {

                showProcessingWindow();

                var id_of_setinterval = setInterval(function () {
                    processingGrid.clearAll();
                    processingGrid.load("/api/logDebug", function () {
                    }, "js");
                }, 10000);

                $.ajax({
                    url: "/api/processorders?type=4&orders=0",
                    type: "GET",
                    success: function (data, textStatus, jqXHR) {
                        processingGrid.clearAll();
                        processingGrid.load("/api/logDebug", function () { }, "js");
                        processingWindow.progressOff();

                        dhtmlx.alert("Re-AutoPOer complete!");
                        processingWindow.setText('Done!');
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        //if fails
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }

                        processingWindow.progressOff();

                        processingWindow.setText('Error!');
                        if (jqXHR.responseJSON != undefined) {
                            dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                        }
                    },
                    complete: function (XMLHttpRequest, status) {
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }
                        processingWindow.progressOff();
                        clearInterval(id_of_setinterval);
                        if (status == 'timeout') {
                            ajaxTimeoutTest.abort();
                            dhtmlx.alert("timeout");
                        }
                    }

                });
            });

            autoPOerLogGrid.clearAll();
            autoPOerLogWindow.progressOn();
            autoPOerLogGrid.load("/api/autopoerlog", function () {
                autoPOerLogWindow.progressOff();
            }, "js");
        }
    });

    var autoPOerContextMenu = new dhtmlXMenuObject();
    autoPOerContextMenu.setIconsPath(imgPath.toolbar);
    autoPOerContextMenu.renderAsContextMenu();
    autoPOerContextMenu.loadStruct('<menu><item type="item" id="headliner" text="Select Headliner"/><item type="item" id="event" text="Select Event"/></menu>');
    autoPOerContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = autoPOerLogGrid.contextID.split("_");
        var id = data[0];
        switch (menuitemId) {
            case 'headliner':
                loadSelectHeadlinerWindow(id);
                break;
            case 'event':
                loadSelectEventWindow(id);
                break;
        }
        return true;
    });
    //grid
    autoPOerLogGrid = autoPOerLogWindow.attachGrid();
    autoPOerLogGrid.setIconsPath(imgPath.grid);
    autoPOerLogGrid.setHeader(["Id", "CategoryId", "Posted", "Event Name", " Venue", "Event Date", "Confirmation Number", " Confirm Date"]);
    autoPOerLogGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    autoPOerLogGrid.setColSorting('str,str,str,str,str,str,str,str');
    autoPOerLogGrid.setColumnIds("id,orderCategoryId,posted,eventName,venue,eventDateString,confirmationNumber,confirmDateString");
    autoPOerLogGrid.setColumnHidden(0, true);
    autoPOerLogGrid.setColumnHidden(1, true);
    autoPOerLogGrid.setColumnHidden(2, true);
    autoPOerLogGrid.enableMultiselect(false);
    autoPOerLogGrid.setInitWidthsP("0,0,0,30,20,15,20,15");
    autoPOerLogGrid.enableContextMenu(autoPOerContextMenu);

    autoPOerLogGrid.attachEvent("onRowCreated", function (rId, rObj, rXml) {
        var orderCategoryId = autoPOerLogGrid.cells(rId, 1).getValue();
        var posted = autoPOerLogGrid.cells(rId, 2).getValue();
        if (orderCategoryId == "8" && posted != "true")
            autoPOerLogGrid.setRowTextStyle(rId, "background-color: #fffee2;");
        if (orderCategoryId == "9" && posted != "true")
            autoPOerLogGrid.setRowTextStyle(rId, "background-color: #fde3e1;");
        if (posted == "true")
            autoPOerLogGrid.setRowTextStyle(rId, "background-color: #d9ffeb;");
    });

    autoPOerLogGrid.attachEvent("onBeforeContextMenu", function (rowId, celInd, grid) {
        var orderCategoryId = grid.cells(rowId, 1).getValue();
        var posted = grid.cells(rowId, 2).getValue();

        autoPOerContextMenu.setItemEnabled('headliner');
        autoPOerContextMenu.setItemEnabled('event');

        if (orderCategoryId == "8" && posted != "true")
            autoPOerContextMenu.setItemDisabled('event');
        if (orderCategoryId == "9" && posted != "true")
            autoPOerContextMenu.setItemDisabled('headliner');
        if (posted == "true") {
            autoPOerContextMenu.setItemDisabled('headliner');
            autoPOerContextMenu.setItemDisabled('event');
        }

        return true;
    });

    autoPOerLogGrid.init();

    autoPOerLogGrid.enableSmartRendering(true, 30);
    autoPOerLogGrid.setAwaitedRowHeight(20);
    autoPOerLogWindow.progressOn();
    if (lineItemIds == "")
        autoPOerLogGrid.load("/api/autopoerlog", function () {
            autoPOerLogWindow.progressOff();
        }, "js");
    else
        autoPOerLogGrid.load("/api/autopoerlog/?lineitemIds=" + lineItemIds, function () {
            autoPOerLogWindow.progressOff();
        }, "js");
}

function showReloadOrdersWindow() {

    var windows = new dhtmlXWindows();
    reloadOrdersWindow = windows.createWindow('reloadOrdersWindow', 0, 0, 450, 250);
    reloadOrdersWindow.setText('Reload Orders');
    reloadOrdersWindow.centerOnScreen();

    var form = reloadOrdersWindow.attachForm();
    var formData = [
        {
            type: "label",
            label: "Reload tickets.com orders from specified date to last loaded order."
        },
        {
            type: 'calendar',
            dateFormat: '%Y-%m-%d',
            enableTime: false,
            name: 'fromdate',
            label: 'From Date'
        },
       {
           type: "label",
           list: [{
               type: "button",
               value: "Start",
               name: 'start',
           }, {
               type: "newcolumn"
           }, {
               type: "button",
               value: "Cancel",
               name: 'cancel',
               offsetLeft: 15
           }]
       }];
    form.loadStruct(formData, 'json');
    form.attachEvent("onButtonClick", function (name) {
        if (name == 'start') {
            var fromData = form.getFormData();
            var options = [];

            for (var k in fromData) {
                var s = fromData[k];
                if (s instanceof Date)
                    s = $.format.date(s, "MM/dd/yyyy")
                if (s == null)
                    s = "01/01/1970";
                options.push(k + "=" + s);
            }
            orderToolbar.disableItem("ProcessNew");
            orderToolbar.disableItem("UpdateOld");
            orderToolbar.disableItem("ProcessAll");
            orderToolbar.disableItem("ProcessRetry");
            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                orderToolbar.disableItem("AutoPOer");
                orderToolbar.disableItem("PDFsAttach");
            }

            // delete all debug logs now.
            ajaxRequest("delete", 'api/logDebug/0').done(function (data1) {

                showProcessingWindow();

                var id_of_setinterval = setInterval(function () {
                    processingGrid.clearAll();
                    processingGrid.load("/api/logDebug", function () {
                    }, "js");
                }, 10000);

                $.ajax({
                    url: "/api/processorders?type=5&" + options,
                    type: "GET",
                    success: function (data, textStatus, jqXHR) {
                        processingGrid.clearAll();
                        processingGrid.load("/api/logDebug", function () { }, "js");
                        processingWindow.progressOff();

                        dhtmlx.alert("Reload orders complete!");

                        processingWindow.setText('Done!');
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        //if fails
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }

                        processingWindow.progressOff();

                        processingWindow.setText('Error!');
                        if (jqXHR.responseJSON != undefined) {
                            dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                        }
                    },
                    complete: function (XMLHttpRequest, status) {
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }

                        processingWindow.progressOff();
                        clearInterval(id_of_setinterval);
                        if (status == 'timeout') {
                            ajaxTimeoutTest.abort();
                            dhtmlx.alert("timeout");
                        }
                    }

                });
            });

        }
        if (name == 'cancel') {
            reloadOrdersWindow.close();
        }
    });
}
//Delete account
function deleteAccount(id) {
    dhtmlx.confirm({
        type: "confirm-warning",
        text: "Are you sure you want to remove this account?",
        callback: function () {
            ajaxRequest("delete", 'api/account/' + id).done(function (data) {
                dhtmlx.message("Your account has been deleted!");
                loadAccounts();
            });
        }
    });
}

function loadAddUserWindow() {
    var windows = new dhtmlXWindows();
    var addUserWindow = windows.createWindow('addUserWindow', 400, 200, 453, 270);
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
    var str = [{
        type: "input",
        name: "Username",
        label: "Username:",
        labelWidth: 90,
        inputWidth: 200,
        validate: "ValidEmail",
        required: true
    }, {
        type: "password",
        name: "Password",
        label: "Password:",
        labelWidth: 90,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }];

    var userFrom = addUserWindow.attachForm(str);

    addUserWindow.setText('Add User');
}

function loadAddBuyerWindow() {
    var windows = new dhtmlXWindows();
    var addBuyerWindow = windows.createWindow('addBuyerWindow', 400, 200, 453, 270);
    var addBuyerToolbar = addBuyerWindow.attachToolbar();
    addBuyerToolbar.setIconsPath(imgPath.toolbar);

    addBuyerToolbar.loadStruct('<toolbar><item type="button" id="saveBtn" img="up.png" title="Save"/><item type="button" id="cancelBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addBuyerToolbar.attachEvent("onClick", function (id) {
        if (id == "saveBtn") {
            if (!buyerFrom.validate()) return false;

            var buyerData = buyerFrom.getFormData();
            addBuyerWindow.progressOn();
            addBuyerToolbar.disableItem("saveBtn");
            var type = 'POST';
            ajaxRequest('post', '/api/buyer/', buyerData).done(function (data) {
                dhtmlx.message("The buyer has been saved!");
                buyersGrid.clearAll();
                buyersGrid.load("/api/buyer/", function () {
                    buyersWindow.progressOff();
                }, "js");
                addBuyerWindow.progressOff();
                addBuyerWindow.close();
            });
        } else {
            addBuyerWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "name",
        label: "Buyer Name:",
        labelWidth: 90,
        inputWidth: 200,
        required: true
    }];

    var buyerFrom = addBuyerWindow.attachForm(str);

    addBuyerWindow.setText('Add Buyer');
}

function loadSelectHeadlinerWindow(lineitemId) {
    var windows = new dhtmlXWindows();
    var selectHeadlinerWindow = windows.createWindow('selectHeadlinerWindow', 400, 200, 453, 270);
    selectHeadlinerWindow.setText('Select Headliner');

    var selectHeadlinerToolbar = selectHeadlinerWindow.attachToolbar();
    selectHeadlinerToolbar.setIconsPath(imgPath.toolbar);
    selectHeadlinerToolbar.addText('headlinerText', 100, 'Headliner:');
    selectHeadlinerToolbar.addInput('headlinerInput', 100);
    selectHeadlinerToolbar.addButton('searchHeadliner', 100, 'Search', null, null);
    selectHeadlinerToolbar.loadStruct('<toolbar><item type="button" id="saveHeadliner" img="up.png" title="Save"/><item type="button" id="cancelHeadliner" img="cross.png" title="Cancel"/></toolbar>', function () { });
    selectHeadlinerToolbar.attachEvent("onClick", function (id) {
        if (id == "searchHeadliner") {
            headlinersGrid.clearAll();
            var headliner = selectHeadlinerToolbar.getInput("headlinerInput").value;
            headlinersGrid.load("/api/mapper/?headliner=" + headliner, function () {
                selectHeadlinerWindow.progressOff();
            }, "js");
        }
        if (id == "saveHeadliner") {
            var headlinerId = headlinersGrid.getSelectedId();
            if (headlinerId == null) {
                alert("Please choose headliner to order mapper!");
            }
            else {
                ajaxRequest('post', '/api/mapperchecker/?lineItemId=' + lineitemId + '&headlinerId=' + headlinerId).done(function (data) {
                    dhtmlx.alert("Mapper save complete!");
                    selectHeadlinerWindow.progressOff();
                    selectHeadlinerWindow.close();
                }).fail(function () {
                    selectHeadlinerWindow.progressOff();
                });
            }
        }
        if (id == "cancelHeadliner") {
            selectHeadlinerWindow.close();
        }
    });

    //grid
    headlinersGrid = selectHeadlinerWindow.attachGrid();
    headlinersGrid.setIconsPath(imgPath.grid);
    headlinersGrid.setHeader(["Headliner Id", "Headliner"]);
    headlinersGrid.setColTypes("ro,ro");
    headlinersGrid.setColSorting('str,str');
    headlinersGrid.setColumnIds("id,headliner");
    headlinersGrid.enableMultiselect(false);
    headlinersGrid.setInitWidthsP("20,80");

    headlinersGrid.init();

    headlinersGrid.enableSmartRendering(true, 30);
    headlinersGrid.setAwaitedRowHeight(20);
    selectHeadlinerWindow.progressOn();
    headlinersGrid.load("/api/mapper/", function () {
        selectHeadlinerWindow.progressOff();
    }, "js");


}

function loadSelectEventWindow(lineitemId) {
    var windows = new dhtmlXWindows();
    var selectEventWindow = windows.createWindow('selectEventWindow', 400, 200, 453, 270);
    selectEventWindow.setText('Select Event');

    var selectEventToolbar = selectEventWindow.attachToolbar();
    selectEventToolbar.setIconsPath(imgPath.toolbar);
    selectEventToolbar.loadStruct('<toolbar><item type="button" id="saveEvent" img="up.png" title="Save"/><item type="button" id="cancelEvent" img="cross.png" title="Cancel"/></toolbar>', function () { });
    selectEventToolbar.attachEvent("onClick", function (id) {
        if (id == "saveEvent") {
            var eventId = eventsGrid.getSelectedId();
            if (eventId == null) {
                alert("Please choose Event to order mapper!");
            }
            else {
                ajaxRequest('post', '/api/mapperevent/?lineItemId=' + lineitemId + '&eventId=' + eventId).done(function (data) {
                    dhtmlx.alert("Mapper save complete!");
                    selectEventWindow.progressOff();
                    selectEventWindow.close();
                }).fail(function () {
                    selectEventWindow.progressOff();
                });
            }
        }
        if (id == "cancelEvent") {
            selectEventWindow.close();
        }
    });

    //grid
    eventsGrid = selectEventWindow.attachGrid();
    eventsGrid.setIconsPath(imgPath.grid);
    eventsGrid.setHeader(["Event Id", "Event", "Venue", "Address"]);
    eventsGrid.setColTypes("ro,ro,ro,ro");
    eventsGrid.setColSorting('str,str,str,str');
    eventsGrid.setColumnIds("id,eventName,venueName,address");
    eventsGrid.enableMultiselect(false);
    eventsGrid.setInitWidthsP("15,30,30,25");

    eventsGrid.init();

    eventsGrid.enableSmartRendering(true, 30);
    eventsGrid.setAwaitedRowHeight(20);
    selectEventWindow.progressOn();
    eventsGrid.load("/api/mapperevent/?lineItemId=" + lineitemId, function () {
        selectEventWindow.progressOff();
    }, "js");


}

function loadAddAccountWindow() {
    var windows = new dhtmlXWindows();
    var addAccountWindow = windows.createWindow('addAccountWindow', 450, 200, 453, 350);
    var addAccountToolbar = addAccountWindow.attachToolbar();
    addAccountToolbar.setIconsPath(imgPath.toolbar);

    addAccountToolbar.loadStruct('<toolbar><item type="button" id="saveAccountBtn" img="up.png" title="Save"/><item type="button" id="cancelAccountBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addAccountToolbar.attachEvent("onClick", function (id) {
        if (id == "saveAccountBtn") {
            if (!accountFrom.validate()) return false;
            var accountData = accountFrom.getFormData();
            addAccountWindow.progressOn();
            addAccountToolbar.disableItem("saveAccountBtn");
            var type = 'POST';
            ajaxRequest('post', '/api/account/', accountData).done(function (data) {
                dhtmlx.message("Your account has been saved!");
                loadAccounts();
                addAccountWindow.progressOff();
                addAccountWindow.close();
            }).fail(function (data) {
                addAccountToolbar.enableItem("saveAccountBtn");
                addAccountWindow.progressOff();
                var err = eval("(" + data.responseText + ")");
                if (err.username != undefined) {
                    dhtmlx.message({ type: "error", text: err.username.errors[0].errorMessage });
                }
            });
        } else {
            addAccountWindow.close();
        }
    });
    var str = [{
        type: "combo",
        name: "SellerId",
        label: "Seller",
        labelWidth: 90,
        inputWidth: 200,
        validate: "NotEmpty"
    }, {
        type: "input",
        name: "Username",
        label: "Username:",
        labelWidth: 90,
        inputWidth: 200,
        validate: "ValidEmail",
        required: true
    }, {
        type: "password",
        name: "Password",
        label: "Password:",
        labelWidth: 90,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }, {
        type: "input",
        name: "POPServer",
        label: "POP3 Server:",
        value: "pop.gmail.com",
        labelWidth: 90,
        inputWidth: 200
    }, {
        type: "input",
        name: "POPPort",
        label: "POP3 Port:",
        value: "995",
        labelWidth: 90,
        inputWidth: 200,
        validate: 'ValidNumeric',
    }, {
        type: "checkbox",
        name: "SSL",
        label: "SSL:",
        checked: true,
        labelWidth: 90
    }];

    var accountFrom = addAccountWindow.attachForm(str);
    var sellerCombo = accountFrom.getCombo("SellerId");
    loadComboData(sellerCombo, "/api/Seller/", "name", "id", '');


    addAccountWindow.setText('Add Account');
}

function loadNewAddAccountWindow() {
    var windows = new dhtmlXWindows();
    var addAccountWindow = windows.createWindow('addAccountWindow', 450, 200, 453, 350);
    var addAccountToolbar = addAccountWindow.attachToolbar();
    addAccountToolbar.setIconsPath(imgPath.toolbar);

    addAccountToolbar.loadStruct('<toolbar><item type="button" id="saveAccountBtn" img="up.png" title="Save"/><item type="button" id="cancelAccountBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addAccountToolbar.attachEvent("onClick", function (id) {
        if (id == "saveAccountBtn") {
            if (!accountFrom.validate()) return false;
            var accountData = accountFrom.getFormData();
            addAccountWindow.progressOn();
            addAccountToolbar.disableItem("saveAccountBtn");
            var type = 'POST';
            ajaxRequest('post', '/api/accountgroup/', accountData).done(function (data) {
                dhtmlx.message("Your account has been saved!");
                loadNewAccounts();
                addAccountWindow.progressOff();
                addAccountWindow.close();
            }).fail(function (data) {
                addAccountToolbar.enableItem("saveAccountBtn");
                addAccountWindow.progressOff();
                var err = eval("(" + data.responseText + ")");
                if (err.username != undefined) {
                    dhtmlx.message({ type: "error", text: err.username.errors[0].errorMessage });
                }
            });
        } else {
            addAccountWindow.close();
        }
    });
    var str = [{
        type: "combo",
        name: "SellerId",
        label: "Seller",
        labelWidth: 90,
        inputWidth: 200,
        validate: "NotEmpty"
    }, {
        type: "input",
        name: "Username",
        label: "Username:",
        labelWidth: 90,
        inputWidth: 200,
        validate: "ValidEmail",
        required: true
    }, {
        type: "password",
        name: "Password",
        label: "Password:",
        labelWidth: 90,
        inputWidth: 200,
        validate: "NotEmpty",
        required: true
    }, {
        type: "input",
        name: "POPServer",
        label: "POP3 Server:",
        value: "pop.gmail.com",
        labelWidth: 90,
        inputWidth: 200
    }, {
        type: "input",
        name: "POPPort",
        label: "POP3 Port:",
        value: "995",
        labelWidth: 90,
        inputWidth: 200,
        validate: 'ValidNumeric',
    }, {
        type: "checkbox",
        name: "SSL",
        label: "SSL:",
        checked: true,
        labelWidth: 90
    }];

    var accountFrom = addAccountWindow.attachForm(str);
    var sellerCombo = accountFrom.getCombo("SellerId");
    loadComboData(sellerCombo, "/api/Seller/", "name", "id", '');


    addAccountWindow.setText('Add Account');
}

function loadEditPOPWindow(aid) {
    var windows = new dhtmlXWindows();
    var editPOPWindow = windows.createWindow('editPOPWindow', 450, 200, 453, 350);
    var editPOPToolbar = editPOPWindow.attachToolbar();
    editPOPToolbar.setIconsPath(imgPath.toolbar);

    editPOPToolbar.loadStruct('<toolbar><item type="button" id="savePOPBtn" img="up.png" title="Save"/><item type="button" id="cancelPOPBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    editPOPToolbar.attachEvent("onClick", function (id) {
        if (id == "savePOPBtn") {
            if (!popFrom.validate()) return false;
            var popData = popFrom.getFormData();
            popData.Id = aid;
            editPOPWindow.progressOn();
            editPOPToolbar.disableItem("savePOPBtn");
            ajaxRequest('put', '/api/account/' + aid, popData).done(function (data) {
                dhtmlx.message("Your pop has been saved!");
                loadAccounts();
                editPOPWindow.progressOff();
                editPOPWindow.close();
            });
        } else {
            editPOPWindow.close();
        }
    });
    var str = [
        {
            type: "input",
            name: "POPServer",
            label: "POP3 Server:",
            labelWidth: 100,
            inputWidth: 200,
            required: true
        }, {
            type: "input",
            name: "POPPort",
            label: "POP3 Port:",
            labelWidth: 100,
            inputWidth: 200,
            validate: 'ValidNumeric',
            required: true
        }, {
            type: "checkbox",
            name: "SSL",
            label: "SSL:",
            labelWidth: 100,
            required: true
        }];

    var popFrom = editPOPWindow.attachForm(str);
    ajaxRequest("get", "/api/account/" + aid).done(function (data) {
        popFrom.setFormData({
            POPServer: data.popServer,
            POPPort: data.popPort,
            SSL: data.ssl
        });
    });
    editPOPWindow.setText('Edit POP');
}

function loadNewEditPOPWindow(aid) {
    var windows = new dhtmlXWindows();
    var editPOPWindow = windows.createWindow('editPOPWindow', 450, 200, 453, 350);
    var editPOPToolbar = editPOPWindow.attachToolbar();
    editPOPToolbar.setIconsPath(imgPath.toolbar);

    editPOPToolbar.loadStruct('<toolbar><item type="button" id="savePOPBtn" img="up.png" title="Save"/><item type="button" id="cancelPOPBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    editPOPToolbar.attachEvent("onClick", function (id) {
        if (id == "savePOPBtn") {
            if (!popFrom.validate()) return false;
            var popData = popFrom.getFormData();
            popData.Id = aid;
            editPOPWindow.progressOn();
            editPOPToolbar.disableItem("savePOPBtn");
            ajaxRequest('put', '/api/accountgroup/' + aid, popData).done(function (data) {
                dhtmlx.message("Your pop has been saved!");
                loadNewAccounts();
                editPOPWindow.progressOff();
                editPOPWindow.close();
            });
        } else {
            editPOPWindow.close();
        }
    });
    var str = [
        {
            type: "input",
            name: "POPServer",
            label: "POP3 Server:",
            labelWidth: 100,
            inputWidth: 200,
            required: true
        }, {
            type: "input",
            name: "POPPort",
            label: "POP3 Port:",
            labelWidth: 100,
            inputWidth: 200,
            validate: 'ValidNumeric',
            required: true
        }, {
            type: "checkbox",
            name: "SSL",
            label: "SSL:",
            labelWidth: 100,
            required: false
        }];

    var popFrom = editPOPWindow.attachForm(str);
    ajaxRequest("get", "/api/accountgroup/" + aid).done(function (data) {
        popFrom.setFormData({
            POPServer: data.popServer,
            POPPort: data.popPort,
            SSL: data.ssl
        });
    });
    editPOPWindow.setText('Edit POP');
}

function loadCreditCardWindow(accountId) {
    var windows = new dhtmlXWindows();

    var creditCardsWindow = windows.createWindow('creditCardsWindow', 0, 0, 400, 300);
    creditCardsWindow.setText('Credit Cards');
    creditCardsWindow.centerOnScreen();

    var creditCardsToolbar = creditCardsWindow.attachToolbar();
    creditCardsToolbar.setIconsPath(imgPath.toolbar);

    var creditCardsToolbarXMLString = '<toolbar>';
    creditCardsToolbarXMLString += '<item type="button" id="add" img="add.png" title="Add CreditCard"/>';
    creditCardsToolbarXMLString += '</toolbar>';
    creditCardsToolbar.loadStruct(creditCardsToolbarXMLString);
    creditCardsToolbar.attachEvent("onClick", function (id) {
        if (id == "add") {
            loadAddCreditCardWindow(accountId);
        }
    });

    var creditCardsContextMenu = new dhtmlXMenuObject();
    creditCardsContextMenu.setIconsPath(imgPath.toolbar);
    creditCardsContextMenu.renderAsContextMenu();
    creditCardsContextMenu.loadStruct('<menu><item type="item" id="del" text="Delete"/></menu>');
    creditCardsContextMenu.attachEvent("onClick", function (menuitemId, type) {
        var data = creditCardsGrid.contextID.split("_");
        //Get the id of the account
        var id = data[0];
        switch (menuitemId) {
            case 'del':
                dhtmlx.confirm({
                    type: "confirm-warning",
                    text: "Are you sure you want to remove this creditcard?",
                    callback: function () {
                        ajaxRequest("delete", 'api/creditcard/' + id).done(function (data) {
                            dhtmlx.message("Your creditcard has been deleted!");
                            loadCreditCards(accountId);
                        });
                    }
                });
                break;
        }
        return true;
    });

    creditCardsGrid = creditCardsWindow.attachGrid();
    creditCardsGrid.setIconsPath(imgPath.grid);

    creditCardsGrid.setHeader(["Id", "Name", "CreditCard4", "Customer ID"]);
    creditCardsGrid.setColTypes("ro,ed,ed,ed");
    creditCardsGrid.setColSorting('int,str,str,int');
    creditCardsGrid.setColumnIds("id,name,creditCard4,customerId");
    creditCardsGrid.enableContextMenu(creditCardsContextMenu);
    creditCardsGrid.setColumnHidden(0, true);
    creditCardsGrid.setInitWidthsP("0,50,20,30");
    creditCardsGrid.init();
    creditCardsGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2) {
            var creditCard = { Id: rId };
            creditCard.Name = creditCardsGrid.cells(rId, 1).getValue();
            creditCard.CreditCard4 = creditCardsGrid.cells(rId, 2).getValue();
            creditCard.CustomerId = creditCardsGrid.cells(rId, 3).getValue();

            //update the order
            ajaxRequest("put", "/api/creditcard/" + rId, creditCard).done(function (data) {
                dhtmlx.message("Your creditcard has been updated!");
            });

            return true;
        }
    });


    loadCreditCards(accountId);
}

function loadCreditCards(id) {
    ajaxRequest("get", "/api/creditcard/" + id).done(function (data) {
        var ccData = {};
        ccData.total_count = data.length;
        ccData.pos = 0;
        ccData.data = data;

        creditCardsGrid.clearAll();
        creditCardsGrid.parse(ccData, "js");
    });
}

function loadNewCreditCards(id) {
    ajaxRequest("get", "/api/creditcardgroup/" + id).done(function (data) {
        var ccData = {};
        ccData.total_count = data.length;
        ccData.pos = 0;
        ccData.data = data;

        creditCardsGrid.clearAll();
        creditCardsGrid.parse(ccData, "js");
    });
}

function loadAddCreditCardWindow(accountId) {
    var windows = new dhtmlXWindows();
    var addCreditCardWindow = windows.createWindow('addCreditCardWindow', 400, 200, 453, 270);
    var addCreditCardToolbar = addCreditCardWindow.attachToolbar();
    addCreditCardToolbar.setIconsPath(imgPath.toolbar);

    addCreditCardToolbar.loadStruct('<toolbar><item type="button" id="saveCCBtn" img="up.png" title="Save"/><item type="button" id="cancelCCBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addCreditCardToolbar.attachEvent("onClick", function (id) {
        if (id == "saveCCBtn") {
            if (!creditCardFrom.validate()) return false;
            var data = creditCardFrom.getFormData();
            data.AccountId = accountId;

            addCreditCardWindow.progressOn();
            ajaxRequest('post', '/api/creditcard/', data).done(function (data) {
                loadCreditCards(accountId);
                addCreditCardWindow.progressOff();
                addCreditCardWindow.close();
            }).fail(function () {
                addCreditCardWindow.progressOff();
            });
        } else {
            addCreditCardWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "Name",
        label: "Name:",
        labelWidth: 90,
        inputWidth: 200,
        required: true
    }, {
        type: "input",
        name: "CreditCard4",
        label: "Last 4 Digits:",
        labelWidth: 90,
        inputWidth: 200,
        maxLength: 4,
        validate: 'ValidNumeric',
        required: true
    }, {
        type: "input",
        name: "CustomerId",
        label: "Customer ID:",
        labelWidth: 90,
        inputWidth: 200,
        maxLength: 10,
        validate: 'ValidInteger'
    }];

    var creditCardFrom = addCreditCardWindow.attachForm(str);

    addCreditCardWindow.setText('Add CreditCard');
}

function loadNewAddCreditCardWindow(accountId) {
    var windows = new dhtmlXWindows();
    var addCreditCardWindow = windows.createWindow('addCreditCardWindow', 400, 200, 453, 270);
    var addCreditCardToolbar = addCreditCardWindow.attachToolbar();
    addCreditCardToolbar.setIconsPath(imgPath.toolbar);

    addCreditCardToolbar.loadStruct('<toolbar><item type="button" id="saveCCBtn" img="up.png" title="Save"/><item type="button" id="cancelCCBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addCreditCardToolbar.attachEvent("onClick", function (id) {
        if (id == "saveCCBtn") {
            if (!creditCardFrom.validate()) return false;
            var data = creditCardFrom.getFormData();
            data.AccountId = accountId;

            addCreditCardWindow.progressOn();
            ajaxRequest('post', '/api/creditcard/', data).done(function (data) {
                loadNewCreditCards(accountId);
                addCreditCardWindow.progressOff();
                addCreditCardWindow.close();
            }).fail(function () {
                addCreditCardWindow.progressOff();
            });
        } else {
            addCreditCardWindow.close();
        }
    });
    var str = [{
        type: "input",
        name: "Name",
        label: "Name:",
        labelWidth: 90,
        inputWidth: 200,
        required: true
    }, {
        type: "input",
        name: "CreditCard4",
        label: "Last 4 Digits:",
        labelWidth: 90,
        inputWidth: 200,
        maxLength: 4,
        validate: 'ValidNumeric',
        required: true
    }, {
        type: "input",
        name: "CustomerId",
        label: "Customer ID:",
        labelWidth: 90,
        inputWidth: 200,
        maxLength: 10,
        validate: 'ValidInteger'
    }];

    var creditCardFrom = addCreditCardWindow.attachForm(str);

    addCreditCardWindow.setText('Add CreditCard');
}

function loadProxies(id) {
    ajaxRequest("get", "/api/proxy/" + id).done(function (data) {
        var ccData = {};
        ccData.total_count = data.length;
        ccData.pos = 0;
        ccData.data = data;

        proxiesGrid.clearAll();
        proxiesGrid.parse(ccData, "js");
    });
}

function loadAddProxyWindow(userId) {
    var windows = new dhtmlXWindows();
    var addProxyWindow = windows.createWindow('addProxyWindow', 400, 200, 453, 270);
    var addProxyToolbar = addProxyWindow.attachToolbar();
    addProxyToolbar.setIconsPath(imgPath.toolbar);

    addProxyToolbar.loadStruct('<toolbar><item type="button" id="saveCCBtn" img="up.png" title="Save"/><item type="button" id="cancelCCBtn" img="cross.png" title="Cancel"/></toolbar>', function () { });
    addProxyToolbar.attachEvent("onClick", function (id) {
        if (id == "saveCCBtn") {
            if (!proxyFrom.validate()) return false;
            var data = proxyFrom.getFormData();
            data.UserId = userId;

            addProxyWindow.progressOn();
            ajaxRequest('put', '/api/proxy/' + data.proxy, data).done(function (data) {
                loadProxies(userId);
                addProxyWindow.progressOff();
                addProxyWindow.close();
            }).fail(function () {
                addProxyWindow.progressOff();
            });
        } else {
            addProxyWindow.close();
        }
    });
    var str = [{
        type: "combo",
        name: "proxy",
        label: "Proxy:",
        labelWidth: 90,
        inputWidth: 200,
        required: true
    }];

    var proxyFrom = addProxyWindow.attachForm(str);

    var proxyCombo = proxyFrom.getCombo("proxy");
    loadComboData(proxyCombo, "/api/proxies/", "ip", "id", '');

    addProxyWindow.setText('Assign Proxy');
}

function loadSearchConfirmWindow() {
    var windows = new dhtmlXWindows();
    var searchConfirmWindow = windows.createWindow('searchConfirmWindow', 400, 200, 453, 200);
    var str = [{
        type: "combo",
        name: "account",
        label: "Account:",
        labelWidth: 120,
        inputWidth: 200,
        required: true
    }, {
        type: "input",
        name: "confirmation",
        label: "Confirmation #:",
        labelWidth: 120,
        inputWidth: 200,
        required: true
    }, {
        type: "button",
        value: "Process",
        name: 'process',
        label: "",
        labelWidth: 120
    }];

    var searchConfirmForm = searchConfirmWindow.attachForm(str);
    var accountCombo = searchConfirmForm.getCombo("account");
    ajaxRequest("get", "/api/account/").done(function (data) {
        if (data.length > 0) {
            var options = [];
            $.each(data, function (i, v) {
                if (v['sellerName'] == "Ticketmaster")
                    options.push([v['id'], v['username']]);
            });
            accountCombo.addOption(options);

            if (options.length > 0) accountCombo.setComboValue(options[0][0]);
        }
    }).fail(failCallback);

    searchConfirmWindow.setText('Search By Confirm#');

    searchConfirmForm.attachEvent("onButtonClick", function (name) {
        if (name == 'process') {
            var data1 = searchConfirmForm.getFormData();

            ajaxRequest("delete", 'api/logDebug/0').done(function (data) {

                showProcessingWindow();

                var id_of_setinterval = setInterval(function () {
                    processingGrid.clearAll();
                    processingGrid.load("/api/logDebug", function () {
                    }, "js");
                }, 10000);

                $.ajax({
                    url: '/api/processConfirm?email=' + data1.account + '&confirm=' + data1.confirmation,
                    type: "GET",
                    success: function (data, textStatus, jqXHR) {
                        processingGrid.clearAll();
                        processingGrid.load("/api/logDebug", function () { }, "js");
                        processingWindow.progressOff();
                        dhtmlx.alert("Process Orders complete!");

                        processingWindow.setText('Done!');
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        processingWindow.progressOff();

                        processingWindow.setText('Error!');
                        if (jqXHR.responseJSON != undefined) {
                            dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                        }
                    },
                    complete: function (XMLHttpRequest, status) {
                        processingWindow.progressOff();
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
}

//main function
function init() {
    dhtmlx.image_path = imgPath.root;

    //Order context menu
    orderContextMenu = new dhtmlXMenuObject();
    orderContextMenu.setIconsPath(imgPath.toolbar);
    orderContextMenu.renderAsContextMenu();
    orderContextMenu.attachEvent("onClick", function (menuitemId, type) {
        if (menuitemId == 'refresh') {
            ordersGrid.clearAll();

            orders.progressOn();
            ordersGrid.load(orderRequestUrl, function () {
                orders.progressOff();
            }, 'js');
            return true;
        }

        if (menuitemId == 'assignBuyer') {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to Assign Buyer!");
            }
            else {
                data = data.split(",");
                showAssignBuyerWindow(data);
            }
            return true;
        }

        if (menuitemId == 'assignCommission') {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to Assign Commission!");
            }
            else {
                data = data.split(",");
                showAssignCommissionWindow(data);
            }
            return true;
        }

        if (menuitemId == 'setTax5') {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to set 5% tax!");
            }
            else {
                data = data.split(",");
                ajaxRequest("put", "/api/settax?lineitemids=" + data + "&tax=0.05").done(function (data) {
                    dhtmlx.message("Order has been updated!");
                })
            }
            return true;
        }

        if (menuitemId == 'setTax13') {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to set 13% tax!");
            }
            else {
                data = data.split(",");
                ajaxRequest("put", "/api/settax?lineitemids=" + data + "&tax=0.13").done(function (data) {
                    dhtmlx.message("Order has been updated!");
                })
            }
            return true;
        }

        if (menuitemId == 'setCustomerId') {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to set customer id!");
            }
            else {
                data = data.split(",");
                showSetCustomerIdWindow(data, SET_CUST_ID.ORDER_LINES);
            }

            return true;
        }

        if (menuitemId == 'setSharePrice') {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to set share price!");
            }
            else {
                data = data.split(",");
                showSetSharePriceWindow(data);
            }

            return true;
        }


        //update the order
        var data = ordersGrid.getSelectedId();
        if (data == null) {
            var rowId = ordersGrid.contextID.split("_");
            data = [rowId[0]];
        }
        else {
            data = data.split(",");
        }

        if (menuitemId == 'unMap') {
            $.each(data, function (k, v) {
                var orderId = ordersGrid.cells(v, ORDERS_COLS.ORD_ID).getValue();
                ajaxRequest("delete", "/api/order/" + orderId).done(function (resp) {
                    dhtmlx.message("Headliner Mapping has been deleted for Order# " + orderId + "!");
                });
            });

            return true;
        }

        if (menuitemId == 'saveTickets') {
            //download the ticket
            var data = ordersGrid.contextID.split("_");
            //Get the id of the order lineitem
            var orderLineItemId = data[0];
            //$.each(data, function (k, v) {
            window.open("/api/orderlineitem/" + orderLineItemId);
            //});
            return true;
        }

        var catId = menuitemId.split('_')[1];

        $.each(data, function (k, v) {
            var orderId = ordersGrid.cells(v, ORDERS_COLS.ORD_ID).getValue();
            ajaxRequest("put", "/api/order/" + orderId + "?categoryId=" + catId).done(function (data) {

                if (catId == '101') {
                    if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") ordersGrid.setRowTextStyle(v, "");
                } else if (catId == '100') {
                    if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") ordersGrid.setRowTextStyle(v, "background-color: #E3D6F1;");
                } else {
                    ordersGrid.deleteRow(v);
                }
            });
        });
        return true;
    });
    var orderMenuXMLString = "<menu>";
    orderMenuXMLString += '<item type="item" id="markNotInHand_1" text="Move to Not In Hand" />';
    orderMenuXMLString += '<item type="item" id="markPrinted_2" text="Move to Printed" />';
    orderMenuXMLString += '<item type="item" id="markReceived_3" text="Move to Received" />';
    orderMenuXMLString += '<item type="item" id="markCancelled_4" text="Move to Cancelled" />';
    orderMenuXMLString += '<item type="item" id="markArchived_5" text="Move to Archived" />';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="markposted_101" text="Mark as Posted" />';
    orderMenuXMLString += '<item type="item" id="markUnposted_100" text="Mark as Unposted" />';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="refresh" text="Refresh"/>';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="unMap" text="Undo Headliner Mapping"/>';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="saveTickets" text="Save Tickets"/>';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="assignBuyer" text="Assign Buyer"/>';
    orderMenuXMLString += '<item type="item" id="assignCommission" text="Assign Commission"/>';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="setTax5" text="Set 5% tax"/>';
    orderMenuXMLString += '<item type="item" id="setTax13" text="Set 13% tax"/>';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="setCustomerId" text="Set Customer ID"/>';
    orderMenuXMLString += '<item type="separator"/>';
    orderMenuXMLString += '<item type="item" id="setSharePrice" text="Set Share Price"/>';
    orderMenuXMLString += '</menu>';
    orderContextMenu.loadStruct(orderMenuXMLString);


    mainLayout = new dhtmlXLayoutObject(document.body, '1C');


    var a = mainLayout.cells('a');
    var welcomeToolbar = a.attachToolbar();
    welcomeToolbar.setIconsPath(imgPath.toolbar);
    welcomeToolbar.addText("welcom_text", 0, "Welcome " + $('#currentUsername').val() + "!");
    if ($('#adminUser').val() == "True") welcomeToolbar.addButton("manageUsers", 1, "Manage Users");
    welcomeToolbar.addButton("myAccounts", 2, "My Accounts");
    if ($('#adminUser').val() == "True") welcomeToolbar.addButton("myNewAccounts", 3, "My Grouped Accounts");
    if ($('#adminUser').val() == "True" || $('#buyerCommission').val() == "True") welcomeToolbar.addButton("myBuyers", 4, "My Buyers");
    if ($('#adminUser').val() == "True" || $('#posConnection').val() == "True") welcomeToolbar.addButton("myConnection", 5, "My Connection");
    welcomeToolbar.addButton("auditLogs", 6, "Audit Logs");
    welcomeToolbar.addButton("processingError", 7, "Processing Error");
    if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") welcomeToolbar.addButton("autoPOerLog", 8, "PO Logs");
    welcomeToolbar.addButton("reloadOrders", 9, "Reload Orders");
    welcomeToolbar.addButton("logout", 10, "Logout");
    welcomeToolbar.attachEvent("onClick", function (id) {
        if (id == "myAccounts") showAccountsWindow();
        if (id == "myNewAccounts") showNewAccountsWindow();
        if (id == "auditLogs") showLogsWindow();
        if (id == "logout") $('#logoutForm').submit();
        if (id == "manageUsers") showUsersWindow();
        if (id == "processingError") showProcessingErrorWindow();
        if (id == "autoPOerLog") showAutoPOerLogWindow("");
        if (id == "reloadOrders") showReloadOrdersWindow();
        if (id == "myBuyers") showBuyersWindow();
        if (id == "myConnection") showMyConnectionWindow();
    });


    //content
    var contentLayout = a.attachLayout('2U');

    var search = contentLayout.cells('a');
    search.setText('Search Tickets');
    search.setWidth('200');
    //contentLayout.setCollapsedText('a', 'Search Tickets');

    var searchForm = search.attachForm();
    var formData = [{
        type: 'settings',
        position: 'label-left',
        labelWidth: 80,
        inputWidth: 120
    }, {
        type: 'fieldset',
        label: 'Ticket Information',
        inputWidth: 'auto',
        list: [{
            type: 'input',
            label: 'Confirm#',
            name: 'confirm'
        }, {
            type: 'input',
            label: 'Event',
            name: 'eventName'
        }, {
            type: 'input',
            label: 'Venue',
            name: 'venue'
        }, {
            type: 'input',
            label: 'Section',
            name: 'section'
        }, {
            type: 'input',
            label: 'Row',
            name: 'row'
        }, {
            type: 'calendar',
            dateFormat: '%Y-%m-%d',
            enableTime: false,
            name: 'dateFrom',
            label: 'Date From'
        }, {
            type: "newcolumn"
        }, {
            type: 'calendar',
            dateFormat: '%Y-%m-%d',
            enableTime: false,
            name: 'dateTo',
            label: 'Date To'
        }]
    }, {
        type: 'fieldset',
        label: 'Purchase Date',
        inputWidth: 'auto',
        list: [{
            type: 'calendar',
            dateFormat: '%Y-%m-%d',
            enableTime: false,
            name: 'confirmDateFrom',
            label: 'From'
        }, {
            type: "newcolumn"
        }, {
            type: 'calendar',
            dateFormat: '%Y-%m-%d',
            enableTime: false,
            name: 'confirmDateTo',
            label: 'To'
        }]
    }, {
        type: 'fieldset',
        label: 'Buying Information',
        inputWidth: 'auto',
        list: [{
            type: 'input',
            label: 'Account',
            name: 'account'
        }, {
            type: 'input',
            label: 'CreditCard',
            name: 'creditCard'
        }]
    },
    {
        type: "label",
        list: [{
            type: "button",
            value: "Search",
            name: 'search',
        }, {
            type: "newcolumn"
        }, {
            type: "button",
            value: "Clear",
            name: 'clear',
            offsetLeft: 15
        }]
    }, {
        type: "button",
        value: "Search by Confirm #",
        name: 'searchConfirm',
    }];
    searchForm.loadStruct(formData, 'json');
    searchForm.attachEvent("onButtonClick", function (name) {
        if (name == 'searchConfirm') {
            loadSearchConfirmWindow();
            return;
        }
        if (name == 'clear') {
            searchForm.clear();
        }

        var searchData = searchForm.getFormData();
        var options = [];

        for (var k in searchData) {
            //if (k != 'dateFrom' && k != 'dateTo' && k != 'confirmDateFrom' && k != 'confirmDateTo') {
            //}
            var s = searchData[k];
            if (s instanceof Date)
                s = $.format.date(s, "MM/dd/yyyy")
            options.push(k + "=" + s);
        }
        //options.push("category=" + currentCat);
        orderToolbar.enableItem('cat_' + currentCat);
        ordersGrid.clearAll();

        orderRequestUrl = "/api/search/?" + options.join("&");
        orders.progressOn();
        ordersGrid.load(orderRequestUrl, function () {
            orders.progressOff();
        }, 'js');
    });
    searchForm.attachEvent("onEnter", function () {
        var searchData = searchForm.getFormData();
        var options = [];

        for (var k in searchData) {
            var s = searchData[k];
            if (s instanceof Date)
                s = $.format.date(s, "MM/dd/yyyy")
            options.push(k + "=" + s);
        }
        orderToolbar.enableItem('cat_' + currentCat);
        ordersGrid.clearAll();

        orderRequestUrl = "/api/search/?" + options.join("&");
        orders.progressOn();
        ordersGrid.load(orderRequestUrl, function () {
            orders.progressOff();
        }, 'js');
    });
    var orders = contentLayout.cells('b');
    orders.setText('Orders');
    //contentLayout.setCollapsedText('b', 'Orders');

    orderToolbar = orders.attachToolbar();
    orderToolbar.setIconsPath(imgPath.toolbar);

    var orderToolbarXml = "<toolbar>";
    orderToolbarXml += '<item type="button" id="cat_0" text="Unprocessed" />';
    orderToolbarXml += '<item type="button" id="cat_1" text="Not In Hand" />';
    orderToolbarXml += '<item type="button" id="cat_2" text="Printed" />';
    orderToolbarXml += '<item type="button" id="cat_3" text="Received" />';
    orderToolbarXml += '<item type="button" id="cat_4" text="Cancelled" />';
    orderToolbarXml += '<item type="button" id="cat_5" text="Archived" />';
    orderToolbarXml += '<item type="separator"/>';
    orderToolbarXml += '<item type="button" id="ProcessNew" text="Process New" />';
    orderToolbarXml += '<item type="button" id="UpdateOld" text="Status Change" />';
    orderToolbarXml += '<item type="button" id="ProcessAll" text="Full Audit" />';
    orderToolbarXml += '<item type="button" id="ProcessRetry" text="Retry Download PDFs" />';
    orderToolbarXml += '<item type="button" id="stop" text="Stop" />';
    if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
        orderToolbarXml += '<item type="separator"/>';
        orderToolbarXml += '<item type="button" id="AutoPOer" text="Create PO" />';
        orderToolbarXml += '<item type="button" id="PDFsAttach" text="Attach PDFs" />';
    }
    orderToolbarXml += '</toolbar>';
    orderToolbar.loadStruct(orderToolbarXml);

    if ($('#isProcessing').val() == "True") {
        orderToolbar.disableItem('ProcessNew');
        orderToolbar.disableItem('UpdateOld');
        orderToolbar.disableItem('ProcessAll');
        orderToolbar.disableItem('ProcessRetry');
    }

    orderToolbar.disableItem('cat_0');
    orderToolbar.attachEvent("onClick", function (id) {
        if (id != "catLabel" && id != "ProcessNew" && id != "UpdateOld" && id != "ProcessAll" && id != "ProcessRetry" && id != "AutoPOer" && id != "PDFsAttach"&&id!="stop") {
            var data = id.split("_");
            var catId = data[1];

            currentCat = catId;

            var searchData = searchForm.getFormData();
            var options = [];

            // get data by category.
            ordersGrid.clearAll();

            orderRequestUrl = "/api/search/?" + "confirm=&eventName=&venue=&section=&row=&dateFrom=&dateTo=&confirmDateFrom=&confirmDateTo=&account=&creditCard=&category=" + currentCat;
            orders.progressOn();
            ordersGrid.load(orderRequestUrl, function () {
                orders.progressOff();
            }, 'js');

            for (var i = 0; i <= 5; i++) {
                if ('cat_' + i != id) {
                    orderToolbar.enableItem('cat_' + i);
                } else {
                    orderToolbar.disableItem(id);
                }
            }
        } else if (id == "stop") {
            $.ajax({
                url: "/api/stopprocess/?type=" + processType,
                type: "POST",
                success: function (data, textStatus, jqXHR) {
                    if (processType == 0)
                        dhtmlx.alert("Stop process complete!");
                    else
                        dhtmlx.alert("Only stop process new!");
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    if (jqXHR.responseJSON != undefined) {
                        dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                    }
                }
            });

        }
        else if (id == "ProcessNew" || id == "UpdateOld" || id == "ProcessAll") {
            orderToolbar.disableItem("ProcessNew");
            orderToolbar.disableItem("UpdateOld");
            orderToolbar.disableItem("ProcessAll");
            orderToolbar.disableItem("ProcessRetry");
            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                orderToolbar.disableItem("AutoPOer");
                orderToolbar.disableItem("PDFsAttach");
            }

            switch (id) {
                case "ProcessNew":
                    processType = 0;
                    break;
                case "UpdateOld":
                    processType = 1;
                    break;
                case "ProcessAll":
                    processType = 2;
                    break;
            }
            // delete all debug logs now.
            ajaxRequest("delete", 'api/logDebug/0').done(function (data) {

                showProcessingWindow();

                var id_of_setinterval = setInterval(function () {
                    processingGrid.clearAll();
                    processingGrid.load("/api/logDebug", function () {
                    }, "js");
                }, 10000);

                $.ajax({
                    url: "/api/processorders?type=" + processType,
                    type: "GET",
                    success: function (data, textStatus, jqXHR) {
                        processingGrid.clearAll();
                        processingGrid.load("/api/logDebug", function () { }, "js");
                        processingWindow.progressOff();
                        dhtmlx.alert("Process Orders complete!");

                        processingWindow.setText('Done!');
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        //if fails
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }

                        processingWindow.progressOff();

                        processingWindow.setText('Error!');
                        if (jqXHR.responseJSON != undefined) {
                            dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                        }
                    },
                    complete: function (XMLHttpRequest, status) {
                        orderToolbar.enableItem("ProcessNew");
                        orderToolbar.enableItem("UpdateOld");
                        orderToolbar.enableItem("ProcessAll");
                        orderToolbar.enableItem("ProcessRetry");
                        if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                            orderToolbar.enableItem("AutoPOer");
                            orderToolbar.enableItem("PDFsAttach");
                        }

                        processingWindow.progressOff();
                        clearInterval(id_of_setinterval);
                        if (status == 'timeout') {
                            ajaxTimeoutTest.abort();
                            dhtmlx.alert("timeout");
                        }
                    }

                });
            });
        } else if (id == "ProcessRetry") {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                alert("Please choose orders to download PDFs!");
            }
            else {
                data = data.split(",");
                orderToolbar.disableItem("ProcessNew");
                orderToolbar.disableItem("UpdateOld");
                orderToolbar.disableItem("ProcessAll");
                orderToolbar.disableItem("ProcessRetry");
                if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                    orderToolbar.disableItem("AutoPOer");
                    orderToolbar.disableItem("PDFsAttach");
                }

                // delete all debug logs now.
                ajaxRequest("delete", 'api/logDebug/0').done(function (data1) {

                    showProcessingWindow();

                    var id_of_setinterval = setInterval(function () {
                        processingGrid.clearAll();
                        processingGrid.load("/api/logDebug", function () {
                        }, "js");
                    }, 10000);

                    $.ajax({
                        url: "/api/processorders?type=3&orders=" + data.join(','),
                        type: "GET",
                        success: function (data, textStatus, jqXHR) {
                            processingGrid.clearAll();
                            processingGrid.load("/api/logDebug", function () { }, "js");
                            processingWindow.progressOff();
                            dhtmlx.alert("Process Orders complete!");
                            processingWindow.setText('Done!');
                            orderToolbar.enableItem("ProcessNew");
                            orderToolbar.enableItem("UpdateOld");
                            orderToolbar.enableItem("ProcessAll");
                            orderToolbar.enableItem("ProcessRetry");
                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                orderToolbar.enableItem("AutoPOer");
                                orderToolbar.enableItem("PDFsAttach");
                            }
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            //if fails
                            orderToolbar.enableItem("ProcessNew");
                            orderToolbar.enableItem("UpdateOld");
                            orderToolbar.enableItem("ProcessAll");
                            orderToolbar.enableItem("ProcessRetry");
                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                orderToolbar.enableItem("AutoPOer");
                                orderToolbar.enableItem("PDFsAttach");
                            }
                            processingWindow.progressOff();

                            processingWindow.setText('Error!');
                            if (jqXHR.responseJSON != undefined) {
                                dhtmlx.alert(jqXHR.responseJSON.errors[0].message);
                            }
                        },
                        complete: function (XMLHttpRequest, status) {
                            orderToolbar.enableItem("ProcessNew");
                            orderToolbar.enableItem("UpdateOld");
                            orderToolbar.enableItem("ProcessAll");
                            orderToolbar.enableItem("ProcessRetry");
                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                orderToolbar.enableItem("AutoPOer");
                                orderToolbar.enableItem("PDFsAttach");
                            }

                            processingWindow.progressOff();
                            clearInterval(id_of_setinterval);
                            if (status == 'timeout') {
                                ajaxTimeoutTest.abort();
                                dhtmlx.alert("timeout");
                            }
                        }

                    });
                });
            }
        }
        else if (id == "AutoPOer" || id == "PDFsAttach") {
            var data = ordersGrid.getSelectedId();
            if (data == null) {
                if (id == "AutoPOer")
                    alert("Please choose orders to PO!");
                else
                    alert("Please choose orders for which to attach the PDFs!");
            }
            else {
                data = data.split(",");

                orderToolbar.disableItem("ProcessNew");
                orderToolbar.disableItem("UpdateOld");
                orderToolbar.disableItem("ProcessAll");
                orderToolbar.disableItem("ProcessRetry");
                if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                    orderToolbar.disableItem("AutoPOer");
                    orderToolbar.disableItem("PDFsAttach");
                }

                // delete all debug logs now.
                ajaxRequest("delete", 'api/logDebug/0').done(function (data1) {
                    if (id == "PDFsAttach") {
                        showProcessingWindow();

                        var options = {
                            type: 'get',

                            success: function (data, textStatus, jqXHR) {
                                processingGrid.clearAll();
                                processingGrid.load("/api/logDebug", function () {
                                }, "js");

                                processingWindow.progressOff();
                                processingWindow.setText('Done!');

                                dhtmlx.alert("PDFs Attach complete!");

                                orderToolbar.enableItem("ProcessNew");
                                orderToolbar.enableItem("UpdateOld");
                                orderToolbar.enableItem("ProcessAll");
                                orderToolbar.enableItem("ProcessRetry");
                                if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                    orderToolbar.enableItem("AutoPOer");
                                    orderToolbar.enableItem("PDFsAttach");
                                }

                                ordersGrid.clearAll();
                                orders.progressOn();
                                ordersGrid.load(orderRequestUrl, function () {
                                    orders.progressOff();
                                }, 'js');
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                processingGrid.clearAll();
                                processingGrid.load("/api/logDebug", function () {
                                }, "js");

                                processingWindow.progressOff();
                                processingWindow.setText('Error!');

                                if (jqXHR.responseText != undefined) {
                                    var errJson = jQuery.parseJSON(jqXHR.responseText);
                                    dhtmlx.alert({
                                        title: errJson.message,
                                        text: errJson.exceptionMessage + "<br/>" + errJson.exceptionType
                                    });
                                }

                                orderToolbar.enableItem("ProcessNew");
                                orderToolbar.enableItem("UpdateOld");
                                orderToolbar.enableItem("ProcessAll");
                                orderToolbar.enableItem("ProcessRetry");
                                if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                    orderToolbar.enableItem("AutoPOer");
                                    orderToolbar.enableItem("PDFsAttach");
                                }
                            },
                            complete: function (XMLHttpRequest, status) {
                                if (status == 'timeout') {
                                    ajaxTimeoutTest.abort();
                                    dhtmlx.alert("timeout");
                                }
                            }
                        };

                        var antiForgeryToken = $("#antiForgeryToken").val();
                        if (antiForgeryToken) {
                            options.headers = {
                                'RequestVerificationToken': antiForgeryToken
                            }
                        }
                        $.ajax('/api/autopoing?orderLineIds=' + data.join(','), options);
                    }
                    else {
                        showProcessingWindow();

                        var lineitemids = data.join(',');

                        $.ajax({
                            url: "/api/maporders?orderIds=" + lineitemids,
                            type: "GET",

                            success: function (data, textStatus, jqXHR) {
                                var needAction = false;
                                for (k = 0; k < data.data.length; k++) {
                                    if (data.data[k].actionNeeded == true) {
                                        needAction = true;
                                        break;
                                    }
                                }
                                if (needAction) {
                                    processingGrid.clearAll();
                                    processingGrid.load("/api/logDebug", function () {
                                    }, "js");
                                    processingWindow.progressOff();

                                    showMapOrdersWindow(data.data, data.orderLineIds);
                                }
                                else {

                                    var options = {
                                        dataType: "json",
                                        contentType: "application/json",
                                        cache: false,
                                        type: 'post',
                                        data: JSON.stringify(data),

                                        success: function (data, textStatus, jqXHR) {
                                            processingGrid.clearAll();
                                            processingGrid.load("/api/logDebug", function () {
                                            }, "js");

                                            processingWindow.progressOff();
                                            processingWindow.setText('Done!');

                                            dhtmlx.alert("POing complete!");

                                            orderToolbar.enableItem("ProcessNew");
                                            orderToolbar.enableItem("UpdateOld");
                                            orderToolbar.enableItem("ProcessAll");
                                            orderToolbar.enableItem("ProcessRetry");
                                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                                orderToolbar.enableItem("AutoPOer");
                                                orderToolbar.enableItem("PDFsAttach");
                                            }

                                            ordersGrid.clearAll();
                                            orders.progressOn();
                                            ordersGrid.load(orderRequestUrl, function () {
                                                orders.progressOff();
                                            }, 'js');
                                        },
                                        error: function (jqXHR, textStatus, errorThrown) {
                                            processingGrid.clearAll();
                                            processingGrid.load("/api/logDebug", function () {
                                            }, "js");

                                            processingWindow.progressOff();
                                            processingWindow.setText('Error!');

                                            if (jqXHR.responseText != undefined) {
                                                var errJson = jQuery.parseJSON(jqXHR.responseText);
                                                dhtmlx.alert({
                                                    title: errJson.message,
                                                    text: errJson.exceptionMessage + "<br/>" + errJson.exceptionType
                                                });
                                            }

                                            orderToolbar.enableItem("ProcessNew");
                                            orderToolbar.enableItem("UpdateOld");
                                            orderToolbar.enableItem("ProcessAll");
                                            orderToolbar.enableItem("ProcessRetry");
                                            if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                                orderToolbar.enableItem("AutoPOer");
                                                orderToolbar.enableItem("PDFsAttach");
                                            }
                                        },
                                        complete: function (XMLHttpRequest, status) {
                                            if (status == 'timeout') {
                                                ajaxTimeoutTest.abort();
                                                dhtmlx.alert("timeout");
                                            }
                                        }
                                    };

                                    var antiForgeryToken = $("#antiForgeryToken").val();
                                    if (antiForgeryToken) {
                                        options.headers = {
                                            'RequestVerificationToken': antiForgeryToken
                                        }
                                    }
                                    $.ajax('/api/autopoing', options);
                                }
                            },
                            error: function (jqXHR, textStatus, errorThrown) {
                                processingGrid.clearAll();
                                processingGrid.load("/api/logDebug", function () {
                                }, "js");

                                processingWindow.progressOff();
                                processingWindow.setText('Error!');

                                if (jqXHR.responseText != undefined) {
                                    var errJson = jQuery.parseJSON(jqXHR.responseText);
                                    dhtmlx.alert({
                                        title: errJson.message,
                                        text: errJson.exceptionMessage + "<br/>" + errJson.exceptionType
                                    });
                                }

                                orderToolbar.enableItem("ProcessNew");
                                orderToolbar.enableItem("UpdateOld");
                                orderToolbar.enableItem("ProcessAll");
                                orderToolbar.enableItem("ProcessRetry");
                                if ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True") {
                                    orderToolbar.enableItem("AutoPOer");
                                    orderToolbar.enableItem("PDFsAttach");
                                }
                            },
                            complete: function (XMLHttpRequest, status) {
                                if (status == 'timeout') {
                                    ajaxTimeoutTest.abort();
                                    dhtmlx.alert("timeout");
                                }
                            }
                        });
                    }
                });
            }
        }
    });

    // status bar
    var statusBar = orders.attachStatusBar({
        height: 40,
        text: "<div id='pagingArea'></div>"
    });

    //content orders grid
    ordersGrid = orders.attachGrid();
    ordersGrid.setIconsPath(imgPath.grid);

    //ordersGrid.setHeader(["Id", "OrderCategoryId", "Order #", "Seller", "Event", "Venue", "Event Time", "CreditCard4", "CC Name", "Total", "Shipping", "ConfirmDate", "Username", "Status"]);
    ordersGrid.setHeader(["Id", "OrderId", "OrderCategoryId", "In Hand", "Posted", "Event", "Venue", "Date", "Qty", "Section", "Row", "Seat Low", "Seat High", "Cost", "Tax", "Shipping", "Status", "Confirmation #", "Confirm Date", "CC Name", "Username", "Last 4", "Seller Name"]);
    ordersGrid.setColTypes("ro,ro,ro,ch,ch,ed,ro,ed,ed,ed,ed,ed,ed,price,price,ro,ro,ed,ro,ro,ro,ro,ro");
    ordersGrid.setColSorting('int,int,int,int,int,str,str,date,int,str,str,str,str,str,str,str,str,str,date,str,str,str,str');
    ordersGrid.setColumnIds("id,orderId,orderCategoryId,hasTicketsFile,posted,eventName,venue,eventDateString,quantity,section,row,seatFrom,seatTo,cost,tax,shipping,orderStatusName,confirmationNumber,confirmDateString,creditCardName,accountName,creditCard4,sellerName");
    ordersGrid.setColumnHidden(ORDERS_COLS.ID, true); //Hide Id column
    ordersGrid.setColumnHidden(ORDERS_COLS.ORD_ID, true); //Hide orderId column
    ordersGrid.setColumnHidden(ORDERS_COLS.ORD_CAT_ID, true);
    ordersGrid.setColumnHidden(ORDERS_COLS.SELLER_NAME, true);
    if ($('#taxable').val() != "True") {
        ordersGrid.setColumnHidden(ORDERS_COLS.TAX, true);
    }
    //ordersGrid.setColumnHidden(20, true);
    ordersGrid.setNumberFormat("$0,000.00", 11);
    //ordersGrid.setDateFormat("%d/%m/%Y %H:%i");
    //ordersGrid.setDateFormat("%d/%m/%Y", 11);
    if ($('#taxable').val() != "True") {
        ordersGrid.setInitWidths("0,0,0,60,60,200,200,100,50,80,50,80,80,80,0,100,100,100,100,100,100,100,0");
    } else {
        ordersGrid.setInitWidths("0,0,0,60,60,200,200,100,50,80,50,80,80,80,50,100,100,100,100,100,100,100,0");
    }
    ordersGrid.enableContextMenu(orderContextMenu);
    ordersGrid.enableMultiselect(true);
    //ordersGrid.enableStableSorting(true);
    ordersGrid.enablePaging(true, 150, 3, "pagingArea");
    ordersGrid.setPagingSkin("toolbar");

    //ordersGrid.attachEvent("onRowCreated", function (rId, rObj, rXml) {
    //    if (ordersGrid.cells(rId, ORDERS_COLS.POSTED).getValue() != "1" && ($('#adminUser').val() == "True" || $('#userCanAutoPOer').val() == "True"))
    //        ordersGrid.setRowTextStyle(rId, "background-color: #E3D6F1;");
    //});
    ordersGrid.init();

    var sortBy=0, dir="des";
    ordersGrid.attachEvent("onBeforeSorting", function (ind, type, direction) {
        this.clearAll(); //clears grid
        sortBy = ind;
        dir = direction;
        var sortOrderRequestUrl = orderRequestUrl + "&ind=" + ind + "&dir=" + direction;
        orders.progressOn();
        this.load(sortOrderRequestUrl, function () {
            orders.progressOff();
        }, 'js');

        //in the required order
        this.setSortImgState(true, ind, direction); //sets the correct sorting image
        return false;
    });

    ordersGrid.attachEvent("onEditCell", function (stage, rId, cInd, nValue, oValue) {
        if (stage == 2 && (cInd == ORDERS_COLS.EVENT || cInd == ORDERS_COLS.DATE || cInd == ORDERS_COLS.CONF_NO)) {
            if (nValue != oValue) {
                var order = { Id: ordersGrid.cells(rId, ORDERS_COLS.ORD_ID).getValue() };

                if (cInd == ORDERS_COLS.EVENT)
                    order.EventName = ordersGrid.cells(rId, ORDERS_COLS.EVENT).getValue();
                if (cInd == ORDERS_COLS.DATE)
                    order.EventDate = ordersGrid.cells(rId, ORDERS_COLS.DATE).getValue();
                if (cInd == ORDERS_COLS.CONF_NO)
                    order.ConfirmationNumber = ordersGrid.cells(rId, ORDERS_COLS.CONF_NO).getValue();
                //update the order
                ajaxRequest("put", "/api/orderedit/" + order.Id, order).done(function (data) {
                    dhtmlx.message("Order has been updated!");
                });

            }
            return true;
        }

        if (stage == 2 && (cInd == ORDERS_COLS.QTY || cInd == ORDERS_COLS.SECTION || cInd == ORDERS_COLS.ROW || cInd == ORDERS_COLS.LOW || cInd == ORDERS_COLS.HIGH || cInd == ORDERS_COLS.COST)) {
            if (nValue != oValue) {
                var orderLineItem = { Id: rId };

                if (cInd == ORDERS_COLS.QTY)
                    orderLineItem.Quantity = ordersGrid.cells(rId, ORDERS_COLS.QTY).getValue();
                if (cInd == ORDERS_COLS.SECTION)
                    orderLineItem.Section = ordersGrid.cells(rId, ORDERS_COLS.SECTION).getValue();
                if (cInd == ORDERS_COLS.ROW)
                    orderLineItem.Row = ordersGrid.cells(rId, ORDERS_COLS.ROW).getValue();
                if (cInd == ORDERS_COLS.LOW)
                    orderLineItem.SeatFrom = ordersGrid.cells(rId, ORDERS_COLS.LOW).getValue();
                if (cInd == ORDERS_COLS.HIGH)
                    orderLineItem.SeatTo = ordersGrid.cells(rId, ORDERS_COLS.HIGH).getValue();
                if (cInd == ORDERS_COLS.COST)
                    orderLineItem.Cost = ordersGrid.cells(rId, ORDERS_COLS.COST).getValue();
                //update the order
                ajaxRequest("put", "/api/orderlineitemedit/" + orderLineItem.Id, orderLineItem).done(function (data) {
                    dhtmlx.message("Order has been updated!");
                });

            }
            return true;
        }

        if (stage == 0 && (cInd == ORDERS_COLS.INHAND || cInd == ORDERS_COLS.POSTED)) {
            return false;
        }

        return true;
    });

    //ordersGrid.enableSmartRendering(true);
    //ordersGrid.setAwaitedRowHeight(20);

    orders.progressOn();
    ordersGrid.load(orderRequestUrl, function () {
        orders.progressOff();
    }, "js");

    //content order line items grid
    //var orderLineItems = contentLayout.cells('c');
    //orderLineItems.setText('Tickets');
    //orderLineItems.setHeight(200);
    //orderLineItems.collapse();
    //contentLayout.setCollapsedText('c', 'Tickets');

    //orderLineItemsGrid = orderLineItems.attachGrid();
    //orderLineItemsGrid.setIconsPath(imgPath.grid);

    //orderLineItemsGrid.setHeader(["Id", "HasTicketsFile", "Section", "Row", "Seat From", "Seat To", "Qty", "Cost"]);	
    //orderLineItemsGrid.setColTypes("ro,ro,ro,ro,ro,ro,ro,ro");
    //orderLineItemsGrid.setColSorting('int,str,str,str,str,str,str,str');
    //orderLineItemsGrid.setColumnIds("id,hasTicketsFile,section,row,seatFrom,seatTo,quantity,cost");
    //orderLineItemsGrid.setColumnHidden(0, true);
    //orderLineItemsGrid.setColumnHidden(1, true);
    //orderLineItemsGrid.setInitWidthsP("0,0,30,10,20,20,10,10");
    //orderLineItemsGrid.enableContextMenu(orderLineItemContextMenu);
    //orderLineItemsGrid.init();


    //ordersGrid.attachEvent("onRowSelect", function (id, ind) {
    //    if (!isNaN(id)) {
    //        orderLineItems.expand();

    //        orderLineItems.progressOn();
    //        ajaxRequest("get", '/api/order/' + id).done(function (data) {
    //            var lineitemData = {};
    //            lineitemData.total_count = data.length;
    //            lineitemData.pos = 0;
    //            lineitemData.data = data;

    //            orderLineItemsGrid.clearAll();
    //            orderLineItemsGrid.parse(lineitemData, "js");

    //            orderLineItems.progressOff();
    //        });
    //    }
    //});

    ordersGrid.attachEvent("onBeforeContextMenu", function (rowId, celInd, grid) {
        var catId = grid.cells(rowId, ORDERS_COLS.ORD_CAT_ID).getValue();

        orderContextMenu.setItemEnabled('markNotInHand_1');
        orderContextMenu.setItemEnabled('markPrinted_2');
        orderContextMenu.setItemEnabled('markReceived_3');
        orderContextMenu.setItemEnabled('markCancelled_4');
        orderContextMenu.setItemEnabled('markArchived_5');

        switch (catId) {
            case '1':
                orderContextMenu.setItemDisabled('markNotInHand_1');
                break;
            case '2':
                orderContextMenu.setItemDisabled('markPrinted_2');
                break;
            case '3':
                orderContextMenu.setItemDisabled('markReceived_3');
                break;
            case '4':
                orderContextMenu.setItemDisabled('markCancelled_4');
                break;
            case '5':
                orderContextMenu.setItemDisabled('markArchived_5');
                break;
        }

        if (grid.cells(rowId, ORDERS_COLS.INHAND).getValue() == '1') {
            orderContextMenu.setItemEnabled('saveTickets');
        } else {
            orderContextMenu.setItemDisabled('saveTickets');
        }

        if (grid.cells(rowId, ORDERS_COLS.SELLER_NAME).getValue() == 'AXS' ||
            grid.cells(rowId, ORDERS_COLS.SELLER_NAME).getValue() == 'Ticketcom') {
            orderContextMenu.setItemEnabled('setCustomerId');
        } else {
            orderContextMenu.setItemDisabled('setCustomerId');
        }

        if ($('#buyerCommission').val() == "True") {
            orderContextMenu.setItemEnabled('assignBuyer');
            orderContextMenu.setItemEnabled('assignCommission');
        }
        else {
            orderContextMenu.setItemDisabled('assignBuyer');
            orderContextMenu.setItemDisabled('assignCommission');
        }

        if ($('#taxable').val() == "True") {
            orderContextMenu.setItemEnabled('setTax13');
            orderContextMenu.setItemEnabled('setTax5');
        }
        else {
            orderContextMenu.setItemDisabled('setTax13');
            orderContextMenu.setItemDisabled('setTax5');
        }
        if ($('#notShare').val() == "True") {
            orderContextMenu.setItemDisabled('setSharePrice');
        }
        else {
            orderContextMenu.setItemEnabled('setSharePrice');
        }
        return true;
    });

    //orderLineItemsGrid.attachEvent("onBeforeContextMenu", function (rowId, celInd, grid) {

    //    if (grid.cells(rowId, 1).getValue() == 'true') {
    //        orderLineItemContextMenu.setItemEnabled('saveTickets');
    //    } else {
    //        orderLineItemContextMenu.setItemDisabled('saveTickets');
    //    }

    //    return true;
    //});

    //footer
    /*var footer = mainLayout.cells('c');
    footer.setHeight('50');
    footer.hideHeader();
    footer.fixSize(0, 1);
    footer.attachURL('/content/footer.html', true);*/
}