import {
    EmployeeProfileService
} from './profile-service';
import {
    AccessLevelService
} from './accesslevel-service';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    ProductService
} from "../product/product-service";
import {
    UtilityService
} from "../utility-service";
import {
    CoreService
} from '../js/core-service';
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
var CronJob = require('cron').CronJob;

let utilityService = new UtilityService();
let productService = new ProductService();
let sideBarService = new SideBarService();
Template.newsidenav.onCreated(function() {

    const templateObject = Template.instance();
    templateObject.includeDashboard = new ReactiveVar();
    templateObject.includeDashboard.set(false);
    templateObject.includeMain = new ReactiveVar();
    templateObject.includeMain.set(false);
    templateObject.includeInventory = new ReactiveVar();
    templateObject.includeInventory.set(false);
    templateObject.includeManufacturing = new ReactiveVar();
    templateObject.includeManufacturing.set(false);
    templateObject.includeAccessLevels = new ReactiveVar();
    templateObject.includeAccessLevels.set(false);
    templateObject.includeShipping = new ReactiveVar();
    templateObject.includeShipping.set(false);
    templateObject.includeStockTransfer = new ReactiveVar();
    templateObject.includeStockTransfer.set(false);
    templateObject.includeStockAdjustment = new ReactiveVar();
    templateObject.includeStockAdjustment.set(false);
    templateObject.includeStockTake = new ReactiveVar();
    templateObject.includeStockTake.set(false);
    templateObject.includeSales = new ReactiveVar();
    templateObject.includeSales.set(false);
    templateObject.includeExpenseClaims = new ReactiveVar();
    templateObject.includeExpenseClaims.set(false);
    templateObject.includeFixedAssets = new ReactiveVar();
    templateObject.includeFixedAssets.set(false);
    templateObject.includePurchases = new ReactiveVar();
    templateObject.includePurchases.set(false);


    templateObject.includePayments = new ReactiveVar();
    templateObject.includePayments.set(false);
    templateObject.includeContacts = new ReactiveVar();
    templateObject.includeContacts.set(false);
    templateObject.includeAccounts = new ReactiveVar();
    templateObject.includeAccounts.set(false);
    templateObject.includeReports = new ReactiveVar();
    templateObject.includeReports.set(false);
    templateObject.includeSettings = new ReactiveVar();
    templateObject.includeSettings.set(false);

    templateObject.includeSeedToSale = new ReactiveVar();
    templateObject.includeSeedToSale.set(false);
    templateObject.includeBanking = new ReactiveVar();
    templateObject.includeBanking.set(false);
    templateObject.includePayroll = new ReactiveVar();
    templateObject.includePayroll.set(false);

    templateObject.includeTimesheetEntry = new ReactiveVar();
    templateObject.includeTimesheetEntry.set(false);
    templateObject.includeClockOnOff = new ReactiveVar();
    templateObject.includeClockOnOff.set(false);

    templateObject.isCloudSidePanelMenu = new ReactiveVar();
    templateObject.isCloudSidePanelMenu.set(false);
    templateObject.isCloudTopPanelMenu = new ReactiveVar();
    templateObject.isCloudTopPanelMenu.set(false);

    templateObject.includeAppointmentScheduling = new ReactiveVar();
    templateObject.includeAppointmentScheduling.set(false);

    templateObject.isBalanceSheet = new ReactiveVar();
    templateObject.isBalanceSheet.set(false);
    templateObject.isProfitLoss = new ReactiveVar();
    templateObject.isProfitLoss.set(false);
    templateObject.isAgedReceivables = new ReactiveVar();
    templateObject.isAgedReceivables.set(false);
    templateObject.isAgedReceivablesSummary = new ReactiveVar();
    templateObject.isAgedReceivablesSummary.set(false);
    templateObject.isProductSalesReport = new ReactiveVar();
    templateObject.isProductSalesReport.set(false);
    templateObject.isSalesReport = new ReactiveVar();
    templateObject.isSalesReport.set(false);
    templateObject.isSalesSummaryReport = new ReactiveVar();
    templateObject.isSalesSummaryReport.set(false);
    templateObject.isGeneralLedger = new ReactiveVar();
    templateObject.isGeneralLedger.set(false);
    templateObject.isTaxSummaryReport = new ReactiveVar();
    templateObject.isTaxSummaryReport.set(false);
    templateObject.isTrialBalance = new ReactiveVar();
    templateObject.isTrialBalance.set(false);
    templateObject.is1099Transaction = new ReactiveVar();
    templateObject.is1099Transaction.set(false);
    templateObject.isAgedPayables = new ReactiveVar();
    templateObject.isAgedPayables.set(false);
    templateObject.isAgedPayablesSummary = new ReactiveVar();
    templateObject.isAgedPayablesSummary.set(false);
    templateObject.isPurchaseReport = new ReactiveVar();
    templateObject.isPurchaseReport.set(false);
    templateObject.isPurchaseSummaryReport = new ReactiveVar();
    templateObject.isPurchaseSummaryReport.set(false);
    templateObject.isPrintStatement = new ReactiveVar();
    templateObject.isPrintStatement.set(false);

    $(document).ready(function() {
        var erpGet = erpDb();
        var LoggedDB = erpGet.ERPDatabase;
        var loc = FlowRouter.current().path;

    });

});
Template.newsidenav.onRendered(function() {

    let templateObject = Template.instance();

    let employeeLoggedUserAccess = Session.get('ERPSolidCurrentUSerAccess');

    let isDashboard = Session.get('CloudDashboardModule');
    let isMain = Session.get('CloudMainModule');
    let isInventory = Session.get('CloudInventoryModule');
    let isManufacturing = Session.get('CloudManufacturingModule');
    let isAccessLevels = Session.get('CloudAccessLevelsModule');
    let isShipping = Session.get('CloudShippingModule');
    let isStockTransfer = Session.get('CloudStockTransferModule');
    let isStockAdjustment = Session.get('CloudStockAdjustmentModule');
    let isStockTake = Session.get('CloudStockTakeModule');
    let isSales = Session.get('CloudSalesModule');
    let isPurchases = Session.get('CloudPurchasesModule');
    let isExpenseClaims = Session.get('CloudExpenseClaimsModule');
    let isFixedAssets = Session.get('CloudFixedAssetsModule');

    let isPayments = Session.get('CloudPaymentsModule');
    let isContacts = Session.get('CloudContactsModule');
    let isAccounts = Session.get('CloudAccountsModule');
    let isReports = Session.get('CloudReportsModule');
    let isSettings = Session.get('CloudSettingsModule');

    let isSeedToSale = Session.get('CloudSeedToSaleModule');
    let isBanking = Session.get('CloudBankingModule');
    let isPayroll = Session.get('CloudPayrollModule');

    let isTimesheetEntry = Session.get('CloudTimesheetEntry');
    let isClockOnOff = Session.get('CloudClockOnOff');

    let isSidePanel = Session.get('CloudSidePanelMenu');
    let isTopPanel = Session.get('CloudTopPanelMenu');

    let isAppointmentScheduling = Session.get('CloudAppointmentSchedulingModule');
    let isCurrencyEnable = Session.get('CloudUseForeignLicence');
    let isAppointmentLaunch = Session.get('CloudAppointmentAppointmentLaunch');
    var erpGet = erpDb();
    var LoggedDB = erpGet.ERPDatabase;
    var LoggedUser = localStorage.getItem('mySession');



    templateObject.getSetSideNavFocus = function() {
        var currentLoc = FlowRouter.current().route.path;
        setTimeout(function() {

            // $('.collapse').collapse({
            //     toggle: false
            // })

            var currentLoc = FlowRouter.current().route.path;

            if (currentLoc == "/dashboard") {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').addClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/appointments") || (currentLoc == "/appointmentlist") || (currentLoc == "/appointmenttimelist")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavappointment').addClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake ').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/accountsoverview") || (currentLoc == "/journalentrylist") ||
                (currentLoc == "/journalentrycard")) {
                $('#sidenavaccounts').addClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/bankingoverview") || (currentLoc == "/chequelist") ||
                (currentLoc == "/chequecard") || (currentLoc == "/reconciliation") ||
                (currentLoc == "/reconciliationlist") || (currentLoc == "/bankrecon") || (currentLoc == "/depositcard") || (currentLoc == "/depositlist")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').addClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/contactoverview") ||
                (currentLoc == "/employeelist") || (currentLoc == "/employeescard") ||
                (currentLoc == "/customerlist") || (currentLoc == "/customerscard") ||
                (currentLoc == "/supplierlist") || (currentLoc == "/supplierscard") ||
                (currentLoc == "/joblist")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment ').removeClass('active');
                $('#sidenavcontacts').addClass('active');
                $('#sidenavexpenseclaims ').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports ').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake ').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/expenseclaims")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').addClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/inventorylist") || (currentLoc == '/productview') ||
                (currentLoc == "/stockadjustmentcard") ||
                (currentLoc == "/stockadjustmentoverview") || (currentLoc == "/productlist")
              ||(currentLoc == "/stocktransfercard") || (currentLoc == "/stocktransferlist")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').addClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/paymentoverview") ||
                (currentLoc == "/customerawaitingpayments") || (currentLoc == "/customerpayment") ||
                (currentLoc == "/supplierawaitingpurchaseorder") || (currentLoc == "/supplierawaitingbills") ||
                (currentLoc == "/supplierpayment") || (currentLoc == "/paymentcard") ||
                (currentLoc == "/supplierpaymentcard")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').addClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/purchasesoverview") ||
                (currentLoc == "/purchaseorderlist") || (currentLoc == "/purchaseordercard") ||
                (currentLoc == "/billlist") || (currentLoc == "/billcard") ||
                (currentLoc == "/creditlist") || (currentLoc == "/creditcard") ||
                (currentLoc == "/purchaseorderlistBO")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').addClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/allreports") ||
                (currentLoc == "/balancesheetreport") || (currentLoc == "/balancetransactionlist") ||
                (currentLoc == "/cashsummaryreport") || (currentLoc == "/profitlossreport") ||
                (currentLoc == "/agedreceivables") || (currentLoc == "/agedpayables") ||
                (currentLoc == "/trialbalancereport") || (currentLoc == "/1099report") ||
                (currentLoc == "/agedreceivablessummary") || (currentLoc == "/salesreport") ||
                (currentLoc == "/generalledger") || (currentLoc == "/trialbalance") ||
                (currentLoc == "/statementlist") || (currentLoc == "/purchasesreport") ||
                (currentLoc == "/productsalesreport") || (currentLoc == "/salessummaryreport") ||
                (currentLoc == "/taxsummaryreport") || (currentLoc == "/purchasesummaryreport") ||
                (currentLoc == "/agedpayablessummary")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports ').addClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/salesoverview") ||
                (currentLoc == "/quotecard") || (currentLoc == "/quoteslist") ||
                (currentLoc == "/salesordercard") || (currentLoc == "/salesorderslist") ||
                (currentLoc == "/invoicecard") || (currentLoc == "/refundcard") ||
                (currentLoc == "/invoicelist") || (currentLoc == "/refundlist") || (currentLoc == "/invoicelistBO")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').addClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/settings") ||
                (currentLoc == "/accesslevel") || (currentLoc == "/companyappsettings") || (currentLoc == "/organisationsettings") ||
                (currentLoc == "/taxratesettings") || (currentLoc == "/currenciesSettings") ||
                (currentLoc == "/departmentSettings") || (currentLoc == "/termsettings") ||
                (currentLoc == "/paymentmethodSettings")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord ').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims ').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').addClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/timesheet") || (currentLoc == "/adpapi") ||
                (currentLoc == "/squareapi") || (currentLoc == "/employeetimeclock") || (currentLoc == "/payrolloverview")) {
                  $('#sidenavaccounts').removeClass('active');
                  $('#sidenavbanking').removeClass('active');
                  $('#sidenavdashbaord').removeClass('active');
                  $('#sidenavappointment').removeClass('active');
                  $('#sidenavcontacts').removeClass('active');
                  $('#sidenavexpenseclaims').removeClass('active');
                  $('#sidenavinventory').removeClass('active');
                  $('#sidenavpayments').removeClass('active');
                  $('#sidenavpurchases').removeClass('active');
                  $('#sidenavreports').removeClass('active');
                  $('#sidenavreports').removeClass('active');
                  $('#sidenavsales').removeClass('active');
                  $('#sidenavsettings').removeClass('active');
                  $('#sidenavstocktake').removeClass('active');
                  $('#sidenavpayroll').addClass('active');
                  $('#sidenavseedtosale').removeClass('active');
                  $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            } else if ((currentLoc == "/stsdashboard") || (currentLoc == "/stsplants") ||
                (currentLoc == "/stsharvests") || (currentLoc == "/stspackages") ||
                (currentLoc == "/ststransfers") || (currentLoc == "/stsoverviews") ||
                (currentLoc == "/stssettings")
            ) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment ').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims ').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake ').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').addClass('active');
                $('#sidenavshipping').removeClass('active');
                $('.collapse').collapse('hide');
            }else if ((currentLoc == "/vs1shipping")) {
                $('#sidenavaccounts').removeClass('active');
                $('#sidenavbanking').removeClass('active');
                $('#sidenavdashbaord').removeClass('active');
                $('#sidenavappointment').removeClass('active');
                $('#sidenavcontacts').removeClass('active');
                $('#sidenavexpenseclaims').removeClass('active');
                $('#sidenavinventory').removeClass('active');
                $('#sidenavpayments').removeClass('active');
                $('#sidenavpurchases').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavreports').removeClass('active');
                $('#sidenavsales').removeClass('active');
                $('#sidenavsettings').removeClass('active');
                $('#sidenavstocktake').removeClass('active');
                $('#sidenavpayroll').removeClass('active');
                $('#sidenavseedtosale').removeClass('active');
                $('.collapse').collapse('hide');
                $('#sidenavshipping').addClass('active');
            }
        }, 50);
    }

    templateObject.getSetSideNavFocus();

    let sidePanelSettings = Session.get('sidePanelSettings');
    if (sidePanelSettings === "openNav") {
        $(".active_page_content").css("text-align", "right");
    } else {
        $(".active_page_content").css("text-align", "inherit");
    }

    if (isSidePanel) {
        $("html").addClass("hasSideBar");
        $("body").addClass("hasSideBar");
    }

    if (LoggedDB !== null) {
        if (isDashboard) {
            templateObject.includeDashboard.set(true);
        }
        if (isMain) {
            templateObject.includeMain.set(true);
        }
        if (isInventory) {
            templateObject.includeInventory.set(true);
        }
        if (isManufacturing) {
            templateObject.includeManufacturing.set(true);
        }
        if (isAccessLevels) {
            templateObject.includeAccessLevels.set(true);
        }
        if (isShipping) {
            templateObject.includeShipping.set(true);
        }
        if (isStockTransfer) {
            templateObject.includeStockTransfer.set(true);
        }

        if (isStockAdjustment) {
            templateObject.includeStockAdjustment.set(true);
        }
        if (isStockTake) {
            templateObject.includeStockTake.set(true);
        }
        if (isSales) {
            templateObject.includeSales.set(true);
        }
        if (isPurchases) {
            templateObject.includePurchases.set(true);
        }

        if (isExpenseClaims) {
            templateObject.includeExpenseClaims.set(true);
        }

        if (isFixedAssets) {
            templateObject.includeFixedAssets.set(true);
        }

        if (isPayments) {
            templateObject.includePayments.set(true);
        }

        if (isContacts) {
            templateObject.includeContacts.set(true);
        }

        if (isAccounts) {
            templateObject.includeAccounts.set(true);
        }

        if (isReports) {
            templateObject.includeReports.set(true);
        }

        if (isSettings) {
            templateObject.includeSettings.set(true);
        }

        if (isSeedToSale) {
            templateObject.includeSeedToSale.set(true);
        }

        if (isBanking) {
            templateObject.includeBanking.set(true);
        }

        if (isPayroll) {
            templateObject.includePayroll.set(true);
        }

        if (isTimesheetEntry) {
            templateObject.includeTimesheetEntry.set(true);
        }

        if (isClockOnOff) {
            templateObject.includeClockOnOff.set(true);
        }

        if (!(isTimesheetEntry) && !(isClockOnOff)) {
            templateObject.includePayroll.set(false);
        }

        if (isAppointmentScheduling) {
            templateObject.includeAppointmentScheduling.set(true);
        }

        if (isSidePanel) {
            templateObject.isCloudSidePanelMenu.set(true);
            $("html").addClass("hasSideBar");
        }
        if (isTopPanel) {
            templateObject.isCloudTopPanelMenu.set(true);
        }
    }

    if (LoggedUser) {


    } else {

    }
    if ((employeeLoggedUserAccess) && (LoggedDB !== null)) {

    } else {
        if (currentLoc !== '/') {

            CloudUser.update({
                _id: Session.get('mycloudLogonID')
            }, {
                $set: {
                    userMultiLogon: false
                }
            });
        }

    }
    let sidePanelToggle = Session.get('sidePanelToggle');
    // if ((sidePanelToggle === '') || (!sidePanelToggle)) {
    //   Session.setPersistent('sidePanelToggle', "toggled");
    //  sidePanelToggle = Session.get('sidePanelToggle');
    // }


    let isGreenTrack = Session.get('isGreenTrack');
    let loggedUserEventFired = Session.get('LoggedUserEventFired');
    if (isGreenTrack) {
        $(".navbar").css("background-color", "#00a969");


        $(".collapse").css("background-color", "#3ddc97");
        $(".show").css("background-color", "#3ddc97");
        $("#collapse-0").css("background-color", "#3ddc97");
        $("#collapse-1").css("background-color", "#3ddc97");
        $("#collapse-2").css("background-color", "#3ddc97");
        $("#collapse-3").css("background-color", "#3ddc97");
        $("#collapse-4").css("background-color", "#3ddc97");
        $("#collapse-5").css("background-color", "#3ddc97");
        $("#collapse-6").css("background-color", "#3ddc97");
        $("#collapse-7").css("background-color", "#3ddc97");
        $("#collapse-8").css("background-color", "#3ddc97");
        $("#collapse-9").css("background-color", "#3ddc97");
        $("#collapse-10").css("background-color", "#3ddc97");
        $("#collapse-11").css("background-color", "#3ddc97");
        $("#collapse-12").css("background-color", "#3ddc97");

        $('.container-fluid .fa-bars').css("color", "#3ddc97");
        $('.btn-link').css("color", "#3ddc97");
        $('.input-group-append .btn-primary').css("background-color", "#3ddc97");
        $('.input-group-append .btn-primary').css("border-color", "#3ddc97");

        $(document).ready(function() {
            let checkGreenTrack = Session.get('isGreenTrack') || false;
            if (checkGreenTrack) {
                document.title = 'GreenTrack';
                $('head').append('<link rel="icon" type="image/png" sizes="16x16" href="icons/greentrackIcon.png">');
            } else {
                document.title = 'VS1 Cloud';
                $('head').append('<link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png">');
            }

        });
    }

    let currentDate = new Date();
    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();
    let month = (currentDate.getMonth() + 1);
    let days = currentDate.getDate();

    if ((currentDate.getMonth()+1) < 10) {
        month = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        days = "0" + currentDate.getDate();
    }
    let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days;



    if (sidePanelToggle) {
        if (sidePanelToggle === "toggled") {
            $("#sidenavbar").addClass("toggled");
        } else {
            $("#sidenavbar").removeClass("toggled");
        }
    }
    var splashArrayProd = new Array();

    var currentBeginDate = new Date();
    var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentBeginDate.getMonth() + 1);

    let fromDateDay = currentBeginDate.getDate();
    if ((currentBeginDate.getMonth()+1) < 10) {
        fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
    } else {
        fromDateMonth = (currentBeginDate.getMonth() + 1);
    }


    if (currentBeginDate.getDate() < 10) {
        fromDateDay = "0" + currentBeginDate.getDate();
    }
    var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
    let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

    templateObject.getAllAccountsData = function() {
        sideBarService.getAccountListVS1().then(function(data) {
            //localStorage.setItem('VS1AccountList', JSON.stringify(data) || '');
            addVS1Data('TAccountVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllProductData = function() {
        sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1ProductList', JSON.stringify(data) || '');
            addVS1Data('TProductVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllCustomersData = function() {
        sideBarService.getAllCustomersDataVS1(initialBaseDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1CustomerList', JSON.stringify(data) || '');
            addVS1Data('TCustomerVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }


    templateObject.getAllSuppliersData = function() {
        sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1SupplierList', JSON.stringify(data) || '');
            addVS1Data('TSupplierVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTaxCodeData = function() {
        sideBarService.getTaxRateVS1().then(function(data) {
            //localStorage.setItem('VS1TaxCodeList', JSON.stringify(data) || '');
            addVS1Data('TTaxcodeVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }


    templateObject.getAllTermsData = function() {
        sideBarService.getTermsVS1().then(function(data) {
            //localStorage.setItem('VS1TermsList', JSON.stringify(data) || '');
            addVS1Data('TTermsVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllDepartmentData = function() {
        sideBarService.getDepartment().then(function(data) {
            //localStorage.setItem('VS1DepartmentList', JSON.stringify(data) || '');
            addVS1Data('TDeptClass', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllCurrencyData = function() {
        sideBarService.getCurrencies().then(function(data) {
            //localStorage.setItem('VS1CurrencyList', JSON.stringify(data) || '');
            addVS1Data('TCurrency', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTCountriesData = function() {
        sideBarService.getCountry().then(function(data) {
            addVS1Data('TCountries', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTPaymentMethodData = function() {
        sideBarService.getPaymentMethodDataVS1().then(function(data) {
            addVS1Data('TPaymentMethod', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTClientTypeData = function() {
        sideBarService.getClientTypeData().then(function(data) {
            addVS1Data('TClientType', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllLeadStatusData = function() {
        sideBarService.getAllLeadStatus().then(function(data) {
            //localStorage.setItem('VS1LeadStatusList', JSON.stringify(data) || '');
            addVS1Data('TLeadStatusType', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllShippingMethodData = function() {
        sideBarService.getShippingMethodData().then(function(data) {
            //localStorage.setItem('VS1ShippingMethodList', JSON.stringify(data) || '');
            addVS1Data('TShippingMethod', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllAccountTypeData = function() {
        sideBarService.getAccountTypesToAddNew().then(function(data) {
            //localStorage.setItem('VS1AccountTypeList', JSON.stringify(data) || '');
            addVS1Data('TAccountType', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllERPCombinedContactsData = function() {
        sideBarService.getAllContactCombineVS1(initialDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1ERPCombinedContactsList', JSON.stringify(data) || '');
            addVS1Data('TERPCombinedContactsVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllEmployeeData = function() {
        sideBarService.getAllEmployees(initialBaseDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1EmployeeList', JSON.stringify(data) || '');
            addVS1Data('TEmployee', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllJournalEntryLineData = function() {
        sideBarService.getAllJournalEnrtryLinesList(initialDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1JournalEntryLineList', JSON.stringify(data) || '');
            addVS1Data('TJournalEntryLines', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllBankAccountReportData = function() {

        sideBarService.getAllBankAccountDetails(prevMonth11Date, toDate, false).then(function(data) {
            //localStorage.setItem('VS1BankAccountReportList', JSON.stringify(data) || '');
            addVS1Data('TBankAccountReport', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTTransactionListReportData = function() {
        // sideBarService.getTTransactionListReport('').then(function(data) {
        //     addVS1Data('TTransactionListReport',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllInvoiceListData = function() {
        sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1TInvoiceList', JSON.stringify(data) || '');
            addVS1Data('TInvoiceEx', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllBackOrderInvoicetData = function() {
        sideBarService.getAllBackOrderInvoiceList(initialDataLoad,0).then(function(data) {
            addVS1Data('TInvoiceBackOrder',JSON.stringify(data));
        }).catch(function(err) {

        });
     }

    templateObject.getAllSalesOrderExListData = function() {
        sideBarService.getAllSalesOrderList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TSalesOrderEx', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllInvoiceListNonBOData = function() {
        // sideBarService.getAllInvoiceListNonBO(initialDataLoad,0).then(function(data) {
        //     //localStorage.setItem('VS1TInvoiceNonBackOrderList', JSON.stringify(data) || '');
        //     addVS1Data('TInvoiceNonBackOrder',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllBOInvoiceListData = function() {
        // sideBarService.getAllBOInvoiceList(initialDataLoad,0).then(function(data) {
        //     //localStorage.setItem('VS1BackOrderSalesListList', JSON.stringify(data) || '');
        //     addVS1Data('BackOrderSalesList',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllTPurchaseOrderData = function() {
        sideBarService.getAllPurchaseOrderList(initialDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1TPurchaseOrderList', JSON.stringify(data) || '');
            addVS1Data('TPurchaseOrderEx', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTReconcilationData = function() {
        // sideBarService.getAllReconcilationList().then(function(data) {
        //     //localStorage.setItem('VS1TReconcilationList', JSON.stringify(data) || '');
        //     addVS1Data('TReconciliation',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllTbillReportData = function() {

        sideBarService.getAllPurchaseOrderListAll(prevMonth11Date, toDate, false).then(function(data) {
            //localStorage.setItem('VS1TbillReport', JSON.stringify(data) || '');
            addVS1Data('TbillReport', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTChequeData = function() {
        sideBarService.getAllChequeList(initialDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1TChequeList', JSON.stringify(data) || '');
            addVS1Data('TCheque', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTProductStocknSalePeriodReportData = function() {
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        fromDateMonth
        if ((currentBeginDate.getMonth()+1) < 10) {
            fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
        } else {
            fromDateMonth = (currentBeginDate.getMonth() + 1);
        }

        if (currentBeginDate.getDate() < 10) {
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var fromDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
        let prevMonth11Date = (moment().subtract(6, 'months')).format("YYYY-MM-DD");
        sideBarService.getProductStocknSaleReportData(prevMonth11Date, fromDate).then(function(data) {
            addVS1Data('TProductStocknSalePeriodReport', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllAppUserData = function() {
        sideBarService.getCurrentLoggedUser().then(function(data) {
            //localStorage.setItem('VS1TAppUserList', JSON.stringify(data) || '');
            addVS1Data('TAppUser', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTJobVS1Data = function() {
        sideBarService.getAllJobssDataVS1(initialBaseDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1TJobVS1List', JSON.stringify(data) || '');
            addVS1Data('TJobVS1', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTStockAdjustEntryData = function() {
        if(isStockAdjustment){
        sideBarService.getAllStockAdjustEntry(initialDataLoad, 0).then(function(data) {
            addVS1Data('TStockAdjustEntry', JSON.stringify(data));
        }).catch(function(err) {

        });
       }
    }

    templateObject.getAllTStockTransferEntryData = function() {
      if(isStockTransfer){
        sideBarService.getAllStockTransferEntry(initialDataLoad, 0).then(function(data) {
            addVS1Data('TStockTransferEntry', JSON.stringify(data));
        }).catch(function(err) {

        });
      }
    }

    templateObject.getAllTQuoteData = function() {
        sideBarService.getAllQuoteList(initialDataLoad, 0).then(function(data) {
            //localStorage.setItem('VS1TQuoteList', JSON.stringify(data) || '');
            addVS1Data('TQuote', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTsalesOrderNonBackOrderData = function() {
        // sideBarService.getAllSalesOrderListNonBO().then(function(data) {
        //     //localStorage.setItem('VS1TsalesOrderNonBackOrderList', JSON.stringify(data) || '');
        //     addVS1Data('TsalesOrderNonBackOrder',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllTBillData = function() {
        // sideBarService.getAllBillList().then(function(data) {
        //     //localStorage.setItem('VS1TBillList', JSON.stringify(data) || '');
        //     addVS1Data('TBill',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllTBillExData = function() {
        sideBarService.getAllBillExList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TBillEx', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTCreditData = function() {
        sideBarService.getAllCreditList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TCredit', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTpurchaseOrderNonBackOrderData = function() {
        // sideBarService.getAllPurchaseOrderListNonBo().then(function(data) {
        //     //localStorage.setItem('VS1TpurchaseOrderNonBackOrderList', JSON.stringify(data) || '');
        //     addVS1Data('TpurchaseOrderNonBackOrder',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllTpurchaseOrderBackOrderData = function() {
        // sideBarService.getAllPurchaseOrderListBO(initialDataLoad,0).then(function(data) {
        //     addVS1Data('TpurchaseOrderBackOrder',JSON.stringify(data));
        // }).catch(function(err) {
        //
        // });
    }

    templateObject.getAllTSalesListData = function() {


        sideBarService.getSalesListData(prevMonth11Date, toDate, false).then(function(data) {
            //localStorage.setItem('VS1TSalesList', JSON.stringify(data) || '');
            addVS1Data('TSalesList', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllAppointmentData = function() {
        sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TAppointment', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllTERPPreferenceData = function() {
        sideBarService.getGlobalSettings().then(function(data) {
            addVS1Data('TERPPreference', JSON.stringify(data));
        }).catch(function(err) {

        });
    }


    templateObject.getAllTERPPreferenceExtraData = function() {
        sideBarService.getGlobalSettingsExtra().then(function(data) {
            addVS1Data('TERPPreferenceExtra', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getAllAppointmentPrefData = function() {
        sideBarService.getAllAppointmentPredList().then(function(data) {
            addVS1Data('TAppointmentPreferences', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTPaymentListData = function() {

        sideBarService.getTPaymentList(prevMonth11Date, toDate, false).then(function(data) {
            addVS1Data('TPaymentList', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTARReportData = function() {

        sideBarService.getTARReport(prevMonth11Date, toDate, false).then(function(data) {
            addVS1Data('TARReport', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTAPReportData = function() {

        sideBarService.getTAPReport(prevMonth11Date, toDate, false).then(function(data) {
            addVS1Data('TAPReport', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTCustomerPaymentData = function() {
        sideBarService.getTCustomerPaymentList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TCustomerPayment', JSON.stringify(data));
        }).catch(function(err) {

        });
    }


    templateObject.getTSupplierPaymentData = function() {
        sideBarService.getTSupplierPaymentList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TSupplierPayment', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTStatementListData = function() {
        sideBarService.getAllCustomerStatementData().then(function(data) {
            addVS1Data('TStatementList', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    templateObject.getTVS1BankDepositData = function() {
        sideBarService.getAllTVS1BankDepositData(initialDataLoad, 0).then(function(data) {
            addVS1Data('TVS1BankDeposit', JSON.stringify(data)).then(function(datareturn) {

            }).catch(function(err) {

            });
        }).catch(function(err) {

        });

    }

    templateObject.getAllTimeSheetData = function() {
        sideBarService.getAllTimeSheetList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TTimeSheet', JSON.stringify(data));
        }).catch(function(err) {

        });
    }

    var job = new CronJob('00 00 00 * * *', function() {

    });
    job.start();

    setTimeout(function() {
        Session.setPersistent('LoggedUserEventFired', false);
    }, 2500);
    /* Start Here */
    templateObject.getFollowedAllObjectPull = function() {
        setTimeout(function() {
            if (isPayments) {
                getVS1Data('TStatementList').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTStatementListData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTStatementListData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTStatementListData();
                });

            }
            if (isBanking) {
                getVS1Data('TVS1BankDeposit').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTVS1BankDepositData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTVS1BankDepositData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTVS1BankDepositData();
                });

            }
            if (isPayroll) {
                getVS1Data('TTimeSheet').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTimeSheetData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTimeSheetData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTimeSheetData();
                });

            }
            if (isAccounts) {
                getVS1Data('TJournalEntryLines').then(function(dataObject) {

                    if (dataObject.length == 0) {
                        templateObject.getAllJournalEntryLineData();
                    } else {

                        let data = JSON.parse(dataObject[0].data);

                        if (data.tjournalentrylines) {
                            templateObject.getAllJournalEntryLineData();
                        } else {

                        }
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllJournalEntryLineData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllJournalEntryLineData();
                });
            }
            if (isBanking) {
                getVS1Data('TReconciliation').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTReconcilationData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.treconciliation;
                        if (useData.length > 0) {
                            if (useData[0].Id) {
                                templateObject.getAllTReconcilationData();
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTReconcilationData();
                });
            }

            if (isInventory) {
                getVS1Data('TStockAdjustEntry').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTStockAdjustEntryData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tstockadjustentry;
                        if (useData.length > 0) {
                            if (useData[0].Id) {
                                templateObject.getAllTStockAdjustEntryData();
                            } else {
                                let getTimeStamp = dataObject[0].timestamp.split(' ');
                                if (getTimeStamp) {
                                    if (loggedUserEventFired) {
                                        if (getTimeStamp[0] != currenctTodayDate) {
                                            templateObject.getAllTStockAdjustEntryData();
                                        }
                                    }
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTStockAdjustEntryData();
                });
            }

            if (isReports) {
                getVS1Data('TARReport').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTARReportData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTARReportData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTARReportData();
                });

                getVS1Data('TAPReport').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTAPReportData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTAPReportData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTAPReportData();
                });
            }
            if (isPayments) {
                getVS1Data('TPaymentList').then(function(dataObject) {

                    if (dataObject.length == 0) {
                        templateObject.getTPaymentListData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTPaymentListData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTPaymentListData();
                });

                getVS1Data('TSupplierPayment').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTSupplierPaymentData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTSupplierPaymentData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTSupplierPaymentData();
                });

                getVS1Data('TCustomerPayment').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTCustomerPaymentData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getTCustomerPaymentData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getTCustomerPaymentData();
                });
            }
            if (isBanking) {
                getVS1Data('TBankAccountReport').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllBankAccountReportData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllBankAccountReportData();
                });
            }
            if (isContacts) {
                getVS1Data('TTransactionListReport').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTTransactionListReportData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTTransactionListReportData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTTransactionListReportData();
                });
            }
        }, 3000);
    }

    //Followed by Purchase Details
    templateObject.getFollowedPurchaseDetailsPull = function() {
        setTimeout(function() {
            if (isPurchases) {
                getVS1Data('TbillReport').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTbillReportData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllTbillReportData();
                });

                getVS1Data('TPurchaseOrderEx').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getAllPurchaseOrderList(initialDataLoad, 0).then(function(data) {
                            addVS1Data('TPurchaseOrderEx', JSON.stringify(data));
                            templateObject.getFollowedAllObjectPull();
                        }).catch(function(err) {
                            templateObject.getFollowedAllObjectPull();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tpurchaseorderex;
                        if (useData[0].Id) {
                            sideBarService.getAllPurchaseOrderList(initialDataLoad, 0).then(function(data) {
                                addVS1Data('TPurchaseOrderEx', JSON.stringify(data));
                                templateObject.getFollowedAllObjectPull();
                            }).catch(function(err) {
                                templateObject.getFollowedAllObjectPull();
                            });
                        } else {
                            let getTimeStamp = dataObject[0].timestamp.split(' ');
                            if (getTimeStamp) {
                                if (loggedUserEventFired) {
                                    if (getTimeStamp[0] != currenctTodayDate) {
                                        sideBarService.getAllPurchaseOrderList(initialDataLoad, 0).then(function(data) {
                                            addVS1Data('TPurchaseOrderEx', JSON.stringify(data));
                                            templateObject.getFollowedAllObjectPull();
                                        }).catch(function(err) {
                                            templateObject.getFollowedAllObjectPull();
                                        });
                                    }
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    sideBarService.getAllPurchaseOrderList(initialDataLoad, 0).then(function(data) {
                        addVS1Data('TPurchaseOrderEx', JSON.stringify(data));
                        templateObject.getFollowedAllObjectPull();
                    }).catch(function(err) {
                        templateObject.getFollowedAllObjectPull();

                    });
                });

                getVS1Data('TBillEx').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTBillExData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tbillex;
                        if (useData.length > 0) {
                            if (useData[0].Id) {
                                templateObject.getAllTBillExData();
                            } else {
                                let getTimeStamp = dataObject[0].timestamp.split(' ');
                                if (getTimeStamp) {
                                    if (loggedUserEventFired) {
                                        if (getTimeStamp[0] != currenctTodayDate) {
                                            templateObject.getAllTBillExData();
                                        }
                                    }
                                }
                            }
                        }


                    }
                }).catch(function(err) {
                    templateObject.getAllTBillExData();
                });
                getVS1Data('TCredit').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTCreditData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcredit;
                        if (useData.length > 0) {
                            if (useData[0].Id) {
                                templateObject.getAllTCreditData();
                            } else {
                                let getTimeStamp = dataObject[0].timestamp.split(' ');
                                if (getTimeStamp) {
                                    if (loggedUserEventFired) {
                                        if (getTimeStamp[0] != currenctTodayDate) {
                                            templateObject.getAllTCreditData();
                                        }
                                    }
                                }
                            }
                        }


                    }
                }).catch(function(err) {
                    templateObject.getAllTCreditData();
                });
                getVS1Data('TpurchaseOrderNonBackOrder').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTpurchaseOrderNonBackOrderData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTpurchaseOrderNonBackOrderData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTpurchaseOrderNonBackOrderData();
                });

                getVS1Data('TpurchaseOrderBackOrder').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTpurchaseOrderBackOrderData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllTpurchaseOrderBackOrderData();
                });
            } else {
                templateObject.getFollowedAllObjectPull();
            }
            if (isBanking) {
                getVS1Data('TCheque').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTChequeData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tcheque;
                        if (useData.length > 0) {
                            if (useData[0].Id) {
                                templateObject.getAllTChequeData();
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTChequeData();
                });

            }

        }, 3000);

    }
    /* Quick Objects*/
    templateObject.getFollowedQuickDataDetailsPull = function() {
        setTimeout(function() {
            if (isSettings) {
                getVS1Data('TTaxcodeVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTaxCodeData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllTaxCodeData();
                });
            }
            if (isSettings) {
                getVS1Data('TTermsVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTermsData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllTermsData();
                });
            }
            if (isSettings) {
                getVS1Data('TDeptClass').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllDepartmentData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllDepartmentData();
                });
            }
            if (isCurrencyEnable) {
                if ((!isSettings) && (!isSales)) {

                } else {
                    getVS1Data('TCurrency').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            templateObject.getAllCurrencyData();
                        } else {}
                    }).catch(function(err) {
                        templateObject.getAllCurrencyData();
                    });
                }
            }

            if (isSettings) {
                getVS1Data('TCountries').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTCountriesData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getTCountriesData();
                });
            } else {
                if (isContacts) {
                    getVS1Data('TCountries').then(function(dataObject) {
                        if (dataObject.length == 0) {
                            templateObject.getTCountriesData();
                        } else {}
                    }).catch(function(err) {
                        templateObject.getTCountriesData();
                    });
                }
            }

            if (isSettings) {
                getVS1Data('TPaymentMethod').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTPaymentMethodData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getTPaymentMethodData();
                });
            }

            if ((!isContacts) || (!isInventory)) {

            } else {
                getVS1Data('TClientType').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getTClientTypeData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getTClientTypeData();
                });

            }

            if (isSales) {
                getVS1Data('TLeadStatusType').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllLeadStatusData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllLeadStatusData();
                });
            }
            if (isContacts) {
                getVS1Data('TShippingMethod').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllShippingMethodData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllShippingMethodData();
                });
            }
            if (isAccounts) {
                getVS1Data('TAccountType').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllAccountTypeData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllAccountTypeData();
                });
            }
            if (isContacts) {
                getVS1Data('TAppUser').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllAppUserData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllAppUserData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllAppUserData();
                });
            }

            if (isAppointmentScheduling) {
                if (isContacts) {

                } else {
                    templateObject.getAllEmployeeData();
                }

                getVS1Data('TAppointment').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(data) {
                            addVS1Data('TAppointment', JSON.stringify(data));
                            //setTimeout(function() {
                            templateObject.getFollowedPurchaseDetailsPull();
                            //}, 3000);
                        }).catch(function(err) {
                            //setTimeout(function() {
                            templateObject.getFollowedPurchaseDetailsPull();
                            //}, 3000);
                        });

                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(data) {
                                        addVS1Data('TAppointment', JSON.stringify(data));
                                        //setTimeout(function() {
                                        templateObject.getFollowedPurchaseDetailsPull();
                                        //}, 3000);
                                    }).catch(function(err) {
                                        //setTimeout(function() {
                                        templateObject.getFollowedPurchaseDetailsPull();
                                        //}, 3000);
                                    });
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(data) {
                        addVS1Data('TAppointment', JSON.stringify(data));
                        //setTimeout(function() {
                        templateObject.getFollowedPurchaseDetailsPull();
                        //  }, 3000);
                    }).catch(function(err) {
                        //setTimeout(function() {
                        templateObject.getFollowedPurchaseDetailsPull();
                        //}, 3000);
                    });
                });

                getVS1Data('TAppointmentPreferences').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllAppointmentPrefData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllAppointmentPrefData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {

                });

                getVS1Data('TERPPreference').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTERPPreferenceData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTERPPreferenceData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTERPPreferenceData();
                });

                getVS1Data('TERPPreferenceExtra').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTERPPreferenceExtraData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTERPPreferenceExtraData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTERPPreferenceExtraData();
                });
            } else {
                templateObject.getFollowedPurchaseDetailsPull();
            }
        }, 3000);
    }
    /* End Quick Objects */


    //Followed By Sales Details
    templateObject.getFollowedSalesDetailsPull = function() {
        setTimeout(function() {
            if (isSales) {
                getVS1Data('TSalesList').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTSalesListData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTSalesListData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTSalesListData();
                });

                getVS1Data('TInvoiceNonBackOrder').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllInvoiceListNonBOData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllInvoiceListNonBOData();
                });

                getVS1Data('TInvoiceEx').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function(data) {
                            addVS1Data('TInvoiceEx', JSON.stringify(data));
                            templateObject.getFollowedQuickDataDetailsPull();
                        }).catch(function(err) {
                            templateObject.getFollowedQuickDataDetailsPull();
                        });
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tinvoiceex;
                        if (useData[0].Id) {
                            sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function(data) {
                                addVS1Data('TInvoiceEx', JSON.stringify(data));
                                //setTimeout(function() {
                                templateObject.getFollowedQuickDataDetailsPull();
                                //}, 3000);
                            }).catch(function(err) {
                                //setTimeout(function() {
                                templateObject.getFollowedQuickDataDetailsPull();
                                //}, 3000);
                            });
                        } else {

                            let getTimeStamp = dataObject[0].timestamp.split(' ');
                            if (getTimeStamp) {
                                if (loggedUserEventFired) {
                                    if (getTimeStamp[0] != currenctTodayDate) {
                                        sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function(data) {
                                            addVS1Data('TInvoiceEx', JSON.stringify(data));
                                            //setTimeout(function() {
                                            templateObject.getFollowedQuickDataDetailsPull();
                                            //  }, 3000);
                                        }).catch(function(err) {
                                            //setTimeout(function() {
                                            templateObject.getFollowedQuickDataDetailsPull();
                                            //}, 3000);
                                        });
                                    }
                                }
                            }

                        }
                    }
                }).catch(function(err) {
                    sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function(data) {
                        addVS1Data('TInvoiceEx', JSON.stringify(data));
                        //setTimeout(function() {
                        templateObject.getFollowedQuickDataDetailsPull();
                        //}, 3000);
                    }).catch(function(err) {
                        //setTimeout(function() {
                        templateObject.getFollowedQuickDataDetailsPull();
                        //}, 3000);
                    });
                });

                getVS1Data('TSalesOrderEx').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllSalesOrderExListData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tsalesorderex;
                        if (useData[0].Id) {
                            templateObject.getAllSalesOrderExListData();
                        } else {
                            let getTimeStamp = dataObject[0].timestamp.split(' ');
                            if (getTimeStamp) {
                                if (loggedUserEventFired) {
                                    if (getTimeStamp[0] != currenctTodayDate) {
                                        templateObject.getAllSalesOrderExListData();
                                    }
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllSalesOrderExListData();
                });


                getVS1Data('BackOrderSalesList').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllBOInvoiceListData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllBOInvoiceListData();
                });

                getVS1Data('TQuote').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTQuoteData();
                    } else {
                        let data = JSON.parse(dataObject[0].data);
                        let useData = data.tquoteex;
                        if (useData.length > 0) {
                            if (useData[0].Id) {
                                templateObject.getAllTQuoteData();
                            } else {
                                let getTimeStamp = dataObject[0].timestamp.split(' ');
                                if (getTimeStamp) {
                                    if (loggedUserEventFired) {
                                        if (getTimeStamp[0] != currenctTodayDate) {
                                            templateObject.getAllTQuoteData();
                                        }
                                    }
                                }
                            }
                        }


                    }
                }).catch(function(err) {
                    templateObject.getAllTQuoteData();
                });
                getVS1Data('TsalesOrderNonBackOrder').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTsalesOrderNonBackOrderData();
                    } else {}
                }).catch(function(err) {
                    templateObject.getAllTsalesOrderNonBackOrderData();
                });

            } else {
                templateObject.getFollowedQuickDataDetailsPull();
            }

            if(isShipping){
              getVS1Data('TInvoiceBackOrder').then(function (dataObject) {
                  if(dataObject.length == 0){
                      templateObject.getAllBackOrderInvoicetData();
                  }else{
                      let data = JSON.parse(dataObject[0].data);
                      let useData = data.tinvoicebackorder;
                      if(useData[0].Id){
                          templateObject.getAllBackOrderInvoicetData();
                      }else{
                          let getTimeStamp = dataObject[0].timestamp.split(' ');
                          if(getTimeStamp){
                              if(loggedUserEventFired){
                                  if(getTimeStamp[0] != currenctTodayDate){
                                    templateObject.getAllBackOrderInvoicetData();
                                  }
                              }
                          }
                      }
                  }
              }).catch(function (err) {
                  templateObject.getAllBackOrderInvoicetData();
              });
            }

        }, 3000);
    }


    //Followed By Contact Details
    templateObject.getFollowedContactDetailsPull = function() {
        setTimeout(function() {
            if (isContacts) {
                var currentBeginDate = new Date();
                var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
                let fromDateMonth = (currentBeginDate.getMonth() + 1)
                let fromDateDay = currentBeginDate.getDate();
                if ((currentBeginDate.getMonth()+1) < 10) {
                    fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
                } else {
                    fromDateMonth = (currentBeginDate.getMonth() + 1);
                }

                if (currentBeginDate.getDate() < 10) {
                    fromDateDay = "0" + currentBeginDate.getDate();
                }
                var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
                let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");
                getVS1Data('TERPCombinedContactsVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        sideBarService.getAllContactCombineVS1(initialDataLoad, 0).then(function(data) {
                            addVS1Data('TERPCombinedContactsVS1', JSON.stringify(data));
                            templateObject.getFollowedSalesDetailsPull();
                        }).catch(function(err) {
                            templateObject.getFollowedSalesDetailsPull();
                        });
                    } else {
                        templateObject.getFollowedSalesDetailsPull();
                    }
                }).catch(function(err) {
                    sideBarService.getAllContactCombineVS1(initialDataLoad, 0).then(function(data) {
                        addVS1Data('TERPCombinedContactsVS1', JSON.stringify(data));
                        templateObject.getFollowedSalesDetailsPull();
                    }).catch(function(err) {
                        templateObject.getFollowedSalesDetailsPull();
                    });
                });

                getVS1Data('TCustomerVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllCustomersData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllCustomersData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllCustomersData();
                });

                getVS1Data('TJobVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllTJobVS1Data();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllTJobVS1Data();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllTJobVS1Data();
                });

                getVS1Data('TSupplierVS1').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllSuppliersData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllSuppliersData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {
                    templateObject.getAllSuppliersData();
                });

                getVS1Data('TEmployee').then(function(dataObject) {
                    if (dataObject.length == 0) {
                        templateObject.getAllEmployeeData();
                    } else {
                        let getTimeStamp = dataObject[0].timestamp.split(' ');
                        if (getTimeStamp) {
                            if (loggedUserEventFired) {
                                if (getTimeStamp[0] != currenctTodayDate) {
                                    templateObject.getAllEmployeeData();
                                }
                            }
                        }
                    }
                }).catch(function(err) {

                    templateObject.getAllEmployeeData();
                });
            } else {
                templateObject.getFollowedSalesDetailsPull();
            }

        }, 2500);
    }

    //If launching Appoing. Don't worry about the rest
    if (isAppointmentLaunch) {
        if (isAppointmentScheduling) {

            templateObject.getAllEmployeeData();

            sideBarService.getAllAppointmentList(initialDataLoad, 0).then(function(data) {
                addVS1Data('TAppointment', JSON.stringify(data));

            }).catch(function(err) {

            });

            getVS1Data('TAppointmentPreferences').then(function(dataObject) {
                if (dataObject.length == 0) {
                    templateObject.getAllAppointmentPrefData();
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                templateObject.getAllAppointmentPrefData();
                            }
                        }
                    }
                }
            }).catch(function(err) {

            });

            getVS1Data('TERPPreference').then(function(dataObject) {
                if (dataObject.length == 0) {
                    templateObject.getAllTERPPreferenceData();
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                templateObject.getAllTERPPreferenceData();
                            }
                        }
                    }
                }
            }).catch(function(err) {
                templateObject.getAllTERPPreferenceData();
            });

            getVS1Data('TERPPreferenceExtra').then(function(dataObject) {
                if (dataObject.length == 0) {
                    templateObject.getAllTERPPreferenceExtraData();
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                templateObject.getAllTERPPreferenceExtraData();
                            }
                        }
                    }
                }
            }).catch(function(err) {
                templateObject.getAllTERPPreferenceExtraData();
            });
        }
        setTimeout(function() {
            sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(data) {
                addVS1Data('TProductVS1', JSON.stringify(data));
            }).catch(function(err) {});
        }, 1000);
    } else {
        if (isAccounts) {
            getVS1Data('TAccountVS1').then(function(dataObject) {
                if (dataObject.length == 0) {
                    templateObject.getAllAccountsData();
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                templateObject.getAllAccountsData();
                            }
                        }
                    }
                }
            }).catch(function(err) {
                templateObject.getAllAccountsData();
            });
        }
        if (isInventory) {
            getVS1Data('TProductVS1').then(function(dataObject) {
                if (dataObject.length == 0) {
                    sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(data) {
                        addVS1Data('TProductVS1', JSON.stringify(data));
                        templateObject.getFollowedContactDetailsPull();
                    }).catch(function(err) {
                        templateObject.getFollowedContactDetailsPull();
                    });
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(data) {
                                    addVS1Data('TProductVS1', JSON.stringify(data));
                                    templateObject.getFollowedContactDetailsPull();
                                }).catch(function(err) {
                                    templateObject.getFollowedContactDetailsPull();
                                });
                            }
                        }
                    }
                }
            }).catch(function(err) {
                sideBarService.getNewProductListVS1(initialBaseDataLoad, 0).then(function(data) {
                    addVS1Data('TProductVS1', JSON.stringify(data));
                    templateObject.getFollowedContactDetailsPull();
                }).catch(function(err) {
                    templateObject.getFollowedContactDetailsPull();
                });
            });

            getVS1Data('TProductStocknSalePeriodReport').then(function(dataObject) {
                if (dataObject.length == 0) {
                    templateObject.getAllTProductStocknSalePeriodReportData();
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                templateObject.getAllTProductStocknSalePeriodReportData();
                            }
                        }
                    }

                }
            }).catch(function(err) {
                templateObject.getAllTProductStocknSalePeriodReportData();
            });

            getVS1Data('TStockTransferEntry').then(function(dataObject) {
                if (dataObject.length == 0) {
                    templateObject.getAllTStockTransferEntryData();
                } else {
                    let getTimeStamp = dataObject[0].timestamp.split(' ');
                    if (getTimeStamp) {
                        if (loggedUserEventFired) {
                            if (getTimeStamp[0] != currenctTodayDate) {
                                templateObject.getAllTStockTransferEntryData();
                            }
                        }
                    }

                }
            }).catch(function(err) {
                templateObject.getAllTProductStocknSalePeriodReportData();
            });
        } else {
            templateObject.getFollowedContactDetailsPull();
        }
    }



    let isBalanceSheet = Session.get('cloudBalanceSheet');
    let isProfitLoss = Session.get('cloudProfitLoss');
    let isAgedReceivables = Session.get('cloudAgedReceivables');
    let isAgedReceivablesSummary = Session.get('cloudAgedReceivablesSummary');
    let isProductSalesReport = Session.get('cloudProductSalesReport');
    let isSalesReport = Session.get('cloudSalesReport');
    let isSalesSummaryReport = Session.get('cloudSalesSummaryReport');
    let isGeneralLedger = Session.get('cloudGeneralLedger');
    let isTaxSummaryReport = Session.get('cloudTaxSummaryReport');
    let isTrialBalance = Session.get('cloudTrialBalance');
    let is1099Transaction = Session.get('cloud1099Transaction');
    let isAgedPayables = Session.get('cloudAgedPayables');
    let isAgedPayablesSummary = Session.get('cloudAgedPayablesSummary');
    let isPurchaseReport = Session.get('cloudPurchaseReport');
    let isPurchaseSummaryReport = Session.get('cloudPurchaseSummaryReport');
    let isPrintStatement = Session.get('cloudPrintStatement');

    if (isProfitLoss == true) {
        templateObject.isProfitLoss.set(true);
    }
    if (isBalanceSheet == true) {
        templateObject.isBalanceSheet.set(true);
    }
    if (isAgedReceivables == true) {
        templateObject.isAgedReceivables.set(true);
    }
    if (isAgedReceivablesSummary == true) {
        templateObject.isAgedReceivablesSummary.set(true);
    }
    if (isProductSalesReport == true) {
        templateObject.isProductSalesReport.set(true);
    }
    if (isSalesReport == true) {
        templateObject.isSalesReport.set(true);
    }
    if (isSalesSummaryReport == true) {
        templateObject.isSalesSummaryReport.set(true);
    }
    if (isGeneralLedger == true) {
        templateObject.isGeneralLedger.set(true);
    }
    if (isTaxSummaryReport == true) {
        templateObject.isTaxSummaryReport.set(true);
    }
    if (isTrialBalance == true) {
        templateObject.isTrialBalance.set(true);
    }
    if (is1099Transaction == true) {
        templateObject.is1099Transaction.set(true);
    }
    if (isAgedPayables == true) {
        templateObject.isAgedPayables.set(true);
    }
    if (isAgedPayablesSummary == true) {
        templateObject.isAgedPayablesSummary.set(true);
    }
    if (isPurchaseReport == true) {
        templateObject.isPurchaseReport.set(true);
    }
    if (isPurchaseSummaryReport == true) {
        templateObject.isPurchaseSummaryReport.set(true);
    }
    if (isPrintStatement == true) {
        templateObject.isPrintStatement.set(true);
    }
});
Template.newsidenav.events({
    'click #sidenavaccessLevel': function(event) {
        window.open('#', '_self');
    },

    // 'mouseenter .accountsLi': function(event) {
    //     $('#accountsSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .accountsLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .appointmentsLi': function(event) {
    //     $('#appointmentsSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .appointmentsLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .bankingLi': function(event) {
    //     $('#bankingSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .bankingLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .contactsLi': function(event) {
    //     $('#contactsSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .contactsLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .inventoryLi': function(event) {
    //     $('#inventorySubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .inventoryLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .paymentsLi': function(event) {
    //     $('#paymentsSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .paymentsLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .payrollLi': function(event) {
    //     $('#payrollSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .payrollLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .purchasesLi': function(event) {
    //     $('#purchasesSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .purchasesLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .reportsLi': function(event) {
    //     $('#reportsSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .reportsLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .salesLi': function(event) {
    //     $('#salesSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .salesLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .seedtosaleLi': function(event) {
    //     $('#seedToSaleSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .seedtosaleLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    // 'mouseenter .settingsLi': function(event) {
    //     $('#settingsSubmenu').collapse('show');
    //     $('#appointmentsSubmenu').collapse('hide');
    //     $('#bankingSubmenu').collapse('hide');
    //     $('#contactsSubmenu').collapse('hide');
    //     $('#inventorySubmenu').collapse('hide');
    //     $('#paymentsSubmenu').collapse('hide');
    //     $('#payrollSubmenu').collapse('hide');
    //     $('#purchasesSubmenu').collapse('hide');
    //     $('#reportsSubmenu').collapse('hide');
    //     $('#salesSubmenu').collapse('hide');
    //     $('#seedToSaleSubmenu').collapse('hide');
    //     $('#settingsSubmenu').collapse('hide');
    // },
    // 'mouseleave .settingsLi': function(event) {
    //     $('.collapse').collapse('hide');
    // },
    'click .sidenavaccounts': function(event) {
        event.preventDefault();
        FlowRouter.go('/accountsoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();

    },
    'click #sidenavnewaccounts': function(event) {

        if (FlowRouter.current().path == "/accountsoverview") {
            $('#addNewAccount').modal('show');
        } else {
            window.open('/accountsoverview#newaccount', '_self');
        }
    },
    'click #sidenavallocation': function(event) {

        if (FlowRouter.current().path == "/appointments") {
            $('#allocationModal').modal('show');
        } else {
            FlowRouter.go('/appointments#allocationModal');

        }
    },
    'click #sidenavpayroll': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').removeClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        // $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavpayroll': function(event) {

        event.preventDefault();
        FlowRouter.go('/payrolloverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavjournalentry': function(event) {

        event.preventDefault();
        FlowRouter.go('/journalentrylist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewjournalentry': function(event) {

        event.preventDefault();
        FlowRouter.go('/journalentrycard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavbanking': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').removeClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        // $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavbanking': function(event) {

        event.preventDefault();
        FlowRouter.go('/bankingoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavcheque': function(event) {

        event.preventDefault();
        FlowRouter.go('/chequelist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavreconciliation': function(event) {

        event.preventDefault();
        FlowRouter.go('/reconciliationlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavbankreconciliation': function(event) {
        window.open('/bankrecon', '_self');
    },
    'click #sidenavnewreconcile': function(event) {

        event.preventDefault();
        FlowRouter.go('/reconciliation');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewcheque': function(event) {

        event.preventDefault();
        FlowRouter.go('/chequecard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavbalancesheet': function(event) {

        event.preventDefault();
        FlowRouter.go('/balancesheetreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidebarToggle': function(event) {
        var sideBarPanel = $("#sidenavbar").attr("class");

        if (sideBarPanel.indexOf("toggled") >= 0) {

            Session.setPersistent('sidePanelToggle', "toggled");
            $("#sidenavbar").addClass("toggled");

        } else {

            Session.setPersistent('sidePanelToggle', "");
            ("#sidenavbar").removeClass("toggled");

        }



    },
    'click #sidenavcontacts': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').removeClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        // $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavcontacts': function(event) {

        event.preventDefault();
        FlowRouter.go('/contactoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavdashbaord': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').removeClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
        event.preventDefault();
        FlowRouter.go('/dashboard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavappointment': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').removeClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        // $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavappointment': function(event) {
        event.preventDefault();
        FlowRouter.go('/appointments');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavappointmentList': function(event) {

        event.preventDefault();
        FlowRouter.go('/appointmentlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavappointmenttimeList': function(event) {

        event.preventDefault();
        FlowRouter.go('/appointmenttimelist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavemployeesGreenTrack': function(event) {

        event.preventDefault();
        FlowRouter.go('/employeelist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavexpenseclaims': function(event) {

        event.preventDefault();
        FlowRouter.go('/expenseclaims');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavfixedassets': function(event) {
        window.open('#', '_self');
    },
    'click #sidenavinventory': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').removeClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        // $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavinventory': function(event) {

        event.preventDefault();
        FlowRouter.go('/inventorylist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .sidenavnewinventory': function(event) {

        event.preventDefault();
        FlowRouter.go('/productview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavmain': function(event) {
        window.open('#', '_self');
    },
    'click #sidenavmanufacturing': function(event) {
        window.open('#', '_self');
    },
    'click #sidenavpayments': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').removeClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavpayments': function(event) {

        event.preventDefault();
        FlowRouter.go('/paymentoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavpurchases': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').removeClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        // $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavpurchases': function(event) {

        event.preventDefault();
        FlowRouter.go('/purchasesoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavreports': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').removeClass('opacityNotActive');
        $('.reportsLi2').removeClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        // $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
        event.preventDefault();
        FlowRouter.go('/allreports');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenav1099report': function(event) {

        event.preventDefault();
        FlowRouter.go('/1099report');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavagedpayables': function(event) {

        event.preventDefault();
        FlowRouter.go('/agedpayables');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavagedpayablessummary': function(event) {

        event.preventDefault();
        FlowRouter.go('/agedpayablessummary');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavagedreceivables': function(event) {

        event.preventDefault();
        FlowRouter.go('/agedreceivables');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavagedreceivablessummary': function(event) {

        event.preventDefault();
        FlowRouter.go('/agedreceivablessummary');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavbalancesheetreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/balancesheetreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavgeneralledger': function(event) {

        event.preventDefault();
        FlowRouter.go('/generalledger');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavstatementlist': function(event) {

        event.preventDefault();
        FlowRouter.go('/statementlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavstatementlist2': function(event) {

        event.preventDefault();
        FlowRouter.go('/statementlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavprofitlossreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/profitlossreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavpurchasesreport': function(event) {
        event.preventDefault();
        FlowRouter.go('/purchasesreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();

    },
    'click #sidenavpurchasesummaryreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/purchasesummaryreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavproductsalesreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/productsalesreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavsalesreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/salesreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavsalessummaryreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/salessummaryreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavtaxsummaryreport': function(event) {

        event.preventDefault();
        FlowRouter.go('/taxsummaryreport');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavtrialbalance': function(event) {

        event.preventDefault();
        FlowRouter.go('/trialbalance');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .sidenavreports': function(event) {

        event.preventDefault();
        FlowRouter.go('/allreports');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavsales': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').removeClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        // $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavsales': function(event) {

        event.preventDefault();
        FlowRouter.go('/salesoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .sidenavsettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/settings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavshipping': function(event) {
        event.preventDefault();
        FlowRouter.go('/vs1shipping');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavstockadjust': function(event) {
        event.preventDefault();
        FlowRouter.go('/stockadjustmentoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavstocktransfer': function(event) {
        event.preventDefault();
        FlowRouter.go('/stocktransferlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenaveproductlist': function(event) {

        event.preventDefault();
        FlowRouter.go('/productlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewstockadjust': function(event) {
        //window.open('/stockadjustmentcard', '_self');
        event.preventDefault();
        FlowRouter.go('/stockadjustmentcard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewstocktransfer': function(event) {
        //window.open('/stocktransfercard', '_self');
        event.preventDefault();
        FlowRouter.go('/stocktransfercard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavcustomers': function(event) {

        event.preventDefault();
        FlowRouter.go('/customerlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavemployees': function(event) {

        event.preventDefault();
        FlowRouter.go('/employeelist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavjobs': function(event) {

        event.preventDefault();
        FlowRouter.go('/joblist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavsuppliers': function(event) {

        event.preventDefault();
        FlowRouter.go('/supplierlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewcustomers': function(event) {

        if (FlowRouter.current().path == "/customerscard") {
            window.open('/customerscard', '_self');
        } else {
            event.preventDefault();
            FlowRouter.go('/customerscard');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
        }
    },
    'click #sidenavnewemployees': function(event) {

        if (FlowRouter.current().path == "/employeescard") {
            window.open('/employeescard', '_self');
        } else {
            event.preventDefault();
            FlowRouter.go('/employeescard');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
        }

    },
    'click #sidenavnewsuppliers': function(event) {


        if (FlowRouter.current().path == "/supplierscard") {
            window.open('/supplierscard', '_self');
        } else {
            event.preventDefault();
            FlowRouter.go('/supplierscard');
            let templateObject = Template.instance();
            templateObject.getSetSideNavFocus();
        }
    },
    'click #sidenavawaitingCP': function(event) {

        event.preventDefault();
        FlowRouter.go('/customerawaitingpayments');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavawaitingSPPO': function(event) {

        event.preventDefault();
        FlowRouter.go('/supplierawaitingpurchaseorder');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavawaitingSPBill': function(event) {

        event.preventDefault();
        FlowRouter.go('/supplierawaitingbills');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavcustomerP': function(event) {

        event.preventDefault();
        FlowRouter.go('/customerpayment');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewcustomerP': function(event) {

        event.preventDefault();
        FlowRouter.go('/customerawaitingpayments');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavsupplierP': function(event) {

        event.preventDefault();
        FlowRouter.go('/supplierpayment');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewsupplierP': function(event) {

        event.preventDefault();
        FlowRouter.go('/supplierawaitingpurchaseorder');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavBill': function(event) {

        event.preventDefault();
        FlowRouter.go('/billlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavCredit': function(event) {

        event.preventDefault();
        FlowRouter.go('/creditlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavPurchaseOrder': function(event) {

        event.preventDefault();
        FlowRouter.go('/purchaseorderlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavPurchaseOrderBO': function(event) {

        event.preventDefault();
        FlowRouter.go('/purchaseorderlistBO');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewBill': function(event) {

        event.preventDefault();
        FlowRouter.go('/billcard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewCredit': function(event) {

        event.preventDefault();
        FlowRouter.go('/creditcard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewPO': function(event) {

        event.preventDefault();
        FlowRouter.go('/purchaseordercard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavInvoice': function(event) {

        event.preventDefault();
        FlowRouter.go('/invoicelist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavRefund': function(event) {
        event.preventDefault();
        FlowRouter.go('/refundlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavInvoiceEmail': function(event) {

        event.preventDefault();
        FlowRouter.go('/invoiceemail');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavInvoiceBO': function(event) {

        event.preventDefault();
        FlowRouter.go('/invoicelistBO');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavQuote': function(event) {

        event.preventDefault();
        FlowRouter.go('/quoteslist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavSalesOrder': function(event) {

        event.preventDefault();
        FlowRouter.go('/salesorderslist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewInvoice': function(event) {

        event.preventDefault();
        FlowRouter.go('/invoicecard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewQuote': function(event) {

        event.preventDefault();
        FlowRouter.go('/quotecard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewRefund': function(event) {

        event.preventDefault();
        FlowRouter.go('/refundcard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewSO': function(event) {

        event.preventDefault();
        FlowRouter.go('/salesordercard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavaccesslevel': function(event) {
        window.open('/accesslevel', '_self');
    },
    'click #sidenavcompanyappsettings': function(event) {
        window.open('/companyappsettings', '_self');
    },
    'click #sidenavcurrenciesSettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/currenciesSettings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavdepartmentSettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/departmentSettings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavorganisationsettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/organisationsettings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavpaymentmethodSettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/paymentmethodSettings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavtaxratesettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/taxratesettings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavtermsettings': function(event) {

        event.preventDefault();
        FlowRouter.go('/termsettings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavtimesheet': function(event) {

        event.preventDefault();
        FlowRouter.go('/timesheet');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavtimeclock': function(event) {
        if (FlowRouter.current().path == "/payrolloverview") {
            $("#btnClockOnOff").trigger("click");
        } else {
            window.open('/payrolloverview#clockOnOff', '_self');
        }
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavseedtosale': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').removeClass('opacityNotActive');
        $('.settingsLi').addClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        // $('#seedToSaleSubmenu').collapse('hide');
        $('#settingsSubmenu').collapse('hide');
    },
    'click .sidenavseedtosale': function(event) {
        FlowRouter.go('/stsdashboard');
    },
    'click #sidenavPlants': function(event) {
        window.open('/stsplants', '_self');
    },
    'click #sidenavHarvest': function(event) {
        window.open('/stsharvests', '_self');
    },
    'click #sidenavPackages': function(event) {
        window.open('/stspackages', '_self');
    },
    'click #sidenavTransfers': function(event) {
        window.open('/ststransfers', '_self');
    },
    'click #sidenavOverviews': function(event) {
        window.open('/stsoverviews', '_self');
    },
    'click #sidenavSettings': function(event) {
        $('.accountsLi').addClass('opacityNotActive');
        $('.appointmentsLi').addClass('opacityNotActive');
        $('.bankingLi').addClass('opacityNotActive');
        $('.contactsLi').addClass('opacityNotActive');
        $('.dashboardLi').addClass('opacityNotActive');
        $('.gsemployeesLi').addClass('opacityNotActive');
        $('.inventoryLi').addClass('opacityNotActive');
        $('.paymentsLi').addClass('opacityNotActive');
        $('.payrollLi').addClass('opacityNotActive');
        $('.purchasesLi').addClass('opacityNotActive');
        $('.reportsLi').addClass('opacityNotActive');
        $('.reportsLi2').addClass('opacityNotActive');
        $('.salesLi').addClass('opacityNotActive');
        $('.seedtosaleLi').addClass('opacityNotActive');
        $('.settingsLi').removeClass('opacityNotActive');
        $('.logoutLi').addClass('opacityNotActive');
        $('#accountsSubmenu').collapse('hide');
        $('#appointmentsSubmenu').collapse('hide');
        $('#bankingSubmenu').collapse('hide');
        $('#contactsSubmenu').collapse('hide');
        $('#inventorySubmenu').collapse('hide');
        $('#paymentsSubmenu').collapse('hide');
        $('#payrollSubmenu').collapse('hide');
        $('#purchasesSubmenu').collapse('hide');
        $('#reportsSubmenu').collapse('hide');
        $('#salesSubmenu').collapse('hide');
        $('#seedToSaleSubmenu').collapse('hide');
        // $('#settingsSubmenu').collapse('hide');
        window.open('/stssettings', '_self');
    },
    'click #sidenavdepositlist': function(event) {
        event.preventDefault();
        FlowRouter.go('/depositlist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavnewdeposit': function(event) {
        event.preventDefault();
        FlowRouter.go('/depositcard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #sidenavshipping': function(event) {
        event.preventDefault();
        FlowRouter.go('/vs1shipping');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click #closeCloudSidePanelMenu': function(event) {
        let templateObject = Template.instance();
        let empLoggedID = Session.get('mySessionEmployeeLoggedID');
        let accesslevelService = new AccessLevelService();
        let isSidePanel = false;
        let sidePanelID = Session.get('CloudSidePanelMenuID');
        let sidePanelFormID = Session.get('CloudSidePanelMenuFormID');

        let data = {
            type: "TEmployeeFormAccess",
            fields: {
                ID: sidePanelID,
                EmployeeId: empLoggedID,
                AccessLevel: 6,
                FormId: sidePanelFormID
            }
        }

        accesslevelService.saveEmpAccess(data).then(function(data) {
            Session.setPersistent('CloudSidePanelMenu', isSidePanel);

            Meteor._reload.reload();
        }).catch(function(err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {

                }
            });

        });

    },
    'click .accountsLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/accountsoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .appointmentsLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/appointments');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .bankingLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/bankingoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .contactsLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/contactoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .inventoryLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/inventorylist');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .paymentsLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/paymentoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .payrollLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/payrolloverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .purchasesLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/purchasesoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .reportsLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/allreports');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .reportsLi2Header': function(event) {
        event.preventDefault();
        FlowRouter.go('/allreports');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .salesLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/salesoverview');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .seedtosaleLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/stsdashboard');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    },
    'click .settingsLiHeader': function(event) {
        event.preventDefault();
        FlowRouter.go('/settings');
        let templateObject = Template.instance();
        templateObject.getSetSideNavFocus();
    }

});
Template.newsidenav.helpers({
    includeDashboard: () => {
        return Template.instance().includeDashboard.get();
    },
    includeMain: () => {
        return Template.instance().includeMain.get();
    },
    includeInventory: () => {
        return Template.instance().includeInventory.get();
    },
    includeManufacturing: () => {
        return Template.instance().includeManufacturing.get();
    },
    includeAccessLevels: () => {
        return Template.instance().includeAccessLevels.get();
    },
    includeShipping: () => {
        return Template.instance().includeShipping.get();
    },
    includeStockTransfer: () => {
        return Template.instance().includeStockTransfer.get();
    },
    includeStockAdjustment: () => {
        return Template.instance().includeStockAdjustment.get();
    },
    includeStockTake: () => {
        return Template.instance().includeStockTake.get();
    },
    includeSales: () => {
        return Template.instance().includeSales.get();
    },
    isCloudSidePanelMenu: () => {
        return Template.instance().isCloudSidePanelMenu.get();
    },
    isCloudTopPanelMenu: () => {
        return Template.instance().isCloudTopPanelMenu.get();
    },
    includePurchases: () => {
        return Template.instance().includePurchases.get();
    },
    includeExpenseClaims: () => {
        return Template.instance().includeExpenseClaims.get();
    },
    includeFixedAssets: () => {
        return Template.instance().includeFixedAssets.get();
    },
    includePayments: () => {
        return Template.instance().includePayments.get();
    },
    includeContacts: () => {
        return Template.instance().includeContacts.get();
    },
    includeAccounts: () => {
        return Template.instance().includeAccounts.get();
    },
    includeReports: () => {
        return Template.instance().includeReports.get();
    },
    includeSettings: () => {
        return Template.instance().includeSettings.get();
    },
    formname: () => {
        let chequeSpelling = "";
        if (Session.get('ERPLoggedCountry') == "Australia") {
            chequeSpelling = "Cheque";
        } else if (Session.get('ERPLoggedCountry') == "United States of America") {
            chequeSpelling = "Check";
        } else {
            chequeSpelling = "Cheque";
        }
        return chequeSpelling;
    },
    isBalanceSheet: function() {
        return Template.instance().isBalanceSheet.get();
    },
    isProfitLoss: function() {
        return Template.instance().isProfitLoss.get();
    },
    isAgedReceivables: function() {
        return Template.instance().isAgedReceivables.get();
    },
    isAgedReceivablesSummary: function() {
        return Template.instance().isAgedReceivablesSummary.get();
    },
    isProductSalesReport: function() {
        return Template.instance().isProductSalesReport.get();
    },
    isSalesReport: function() {
        return Template.instance().isSalesReport.get();
    },
    isSalesSummaryReport: function() {
        return Template.instance().isSalesSummaryReport.get();
    },
    isGeneralLedger: function() {
        return Template.instance().isGeneralLedger.get();
    },
    isTaxSummaryReport: function() {
        return Template.instance().isTaxSummaryReport.get();
    },
    isTrialBalance: function() {
        return Template.instance().isTrialBalance.get();
    },
    is1099Transaction: function() {
        return Template.instance().is1099Transaction.get();
    },
    isAgedPayables: function() {
        return Template.instance().isAgedPayables.get();
    },
    isAgedPayablesSummary: function() {
        return Template.instance().isAgedPayablesSummary.get();
    },
    isPurchaseReport: function() {
        return Template.instance().isPurchaseReport.get();
    },
    isPurchaseSummaryReport: function() {
        return Template.instance().isPurchaseSummaryReport.get();
    },
    isPrintStatement: function() {
        return Template.instance().isPrintStatement.get();
    },
    isFavorite: function() {
        let isBalanceSheet = Template.instance().isBalanceSheet.get();
        let isProfitLoss = Template.instance().isProfitLoss.get();
        let isAgedReceivables = Template.instance().isAgedReceivables.get();
        let isAgedReceivablesSummary = Template.instance().isAgedReceivablesSummary.get();
        let isProductSalesReport = Template.instance().isProductSalesReport.get();
        let isSalesReport = Template.instance().isSalesReport.get();
        let isSalesSummaryReport = Template.instance().isSalesSummaryReport.get();
        let isGeneralLedger = Template.instance().isGeneralLedger.get();
        let isTaxSummaryReport = Template.instance().isTaxSummaryReport.get();
        let isTrialBalance = Template.instance().isTrialBalance.get();
        let is1099Transaction = Template.instance().is1099Transaction.get();
        let isAgedPayables = Template.instance().isAgedPayables.get();
        let isAgedPayablesSummary = Template.instance().isAgedPayablesSummary.get();
        let isPurchaseReport = Template.instance().isPurchaseReport.get();
        let isPurchaseSummaryReport = Template.instance().isPurchaseSummaryReport.get();
        let isPrintStatement = Template.instance().isPrintStatement.get();
        let isShowFavorite = false;

        if (isBalanceSheet || isProfitLoss || isAgedReceivables || isProductSalesReport || isSalesReport || isSalesSummaryReport ||
            isGeneralLedger || isTaxSummaryReport || isTrialBalance || is1099Transaction || isAgedPayables ||
            isPurchaseReport || isPurchaseSummaryReport || isPrintStatement || isAgedReceivablesSummary || isAgedPayablesSummary) {
            isShowFavorite = true;
        }
        return isShowFavorite;
    },
    isGreenTrack: function() {
        let checkGreenTrack = Session.get('isGreenTrack') || false;
        return checkGreenTrack;
    },
    includeSeedToSale: () => {
        return Template.instance().includeSeedToSale.get();
    },
    includeAppointmentScheduling: () => {
        return Template.instance().includeAppointmentScheduling.get();
    },
    includeBanking: () => {
        return Template.instance().includeBanking.get();
    },
    includePayroll: () => {
        return Template.instance().includePayroll.get();
    },
    includeTimesheetEntry: () => {
        return Template.instance().includeTimesheetEntry.get();
    },
    includeClockOnOff: () => {
        return Template.instance().includeClockOnOff.get();
    },
    checkFXCurrency: () => {
        return Session.get('CloudUseForeignLicence');
    }
});
