import {
    ReportService
} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {
    UtilityService
} from "../../utility-service";
let utilityService = new UtilityService();
let reportService = new ReportService();
const templateObject = Template.instance();

Template.newprofitandloss.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();
    templateObject.recordslayout = new ReactiveVar([]);
});


Template.newprofitandloss.onRendered(function () {

    $('.fullScreenSpin').css('display', 'inline-block');
    const templateObject = Template.instance();
    let utilityService = new UtilityService();
    let salesOrderTable;
    var splashArray = new Array();
    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = (currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if ((currentDate.getMonth() + 1) < 10) {
        fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();
    var url = FlowRouter.current().path;
    //hiding Group selected accounts button
    $('.btnGroupAccounts').hide();


    templateObject.dateAsAt.set(begunDate);
    //    date picker initializer
    $("#date-input,#dateTo,#dateFrom").datepicker({
        showOn: 'button',
        buttonText: 'Show Date',
        buttonImageOnly: true,
        buttonImage: '/img/imgCal2.png',
        dateFormat: 'dd/mm/yy',
        showOtherMonths: true,
        selectOtherMonths: true,
        changeMonth: true,
        changeYear: true,
        yearRange: "-90:+10",
    });
    // end of date picker
    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

// get 'this month' to appear in date range selector dropdown
//    const monSml = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sepr","Oct","Nov","Dec"];
//    var currMonth = monSml[currentDate.getMonth()] + " " + currentDate.getFullYear();

let currMonth = moment().format('MMM') + ' ' + moment().format('YYYY');
$("#dispCurrMonth").append(currMonth);

// get 'this month' to appear in date range selector dropdown end

// get 'last quarter' to appear in date range selector dropdown
let lastQStartDispaly = moment().subtract(1, 'Q').startOf('Q').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
let lastQEndDispaly = moment().subtract(1, 'Q').endOf('Q').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
$('#dispLastQuarter').append(lastQStartDispaly + " - " + lastQEndDispaly)

// get 'last quarter' to appear in date range selector dropdown end

// get 'this quarter' to appear in date range selector dropdown

let thisQStartDispaly = moment().startOf('Q').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
let thisQEndDispaly = moment().endOf('Q').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
$('#dispCurrQuarter').append(thisQStartDispaly + " - " + thisQEndDispaly)

// get 'this quarter' to appear in date range selector dropdown end

// get 'last month' to appear in date range selector dropdown

let prevMonth = moment().subtract(1, 'M').format('MMM' + ' ' + 'YYYY');
$('#dispPrevMonth').append(prevMonth);

// get 'last month' to appear in date range selector dropdown end

// get 'month to date' to appear in date range selector dropdown

let monthStart = moment().startOf('M').format('D' + ' ' + 'MMM');
let monthCurr = moment().format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
$('#monthStartDisp').append(monthStart + ' - ' + monthCurr);

// get 'month to date' to appear in date range selector dropdown end

// get 'quarter to date' to appear in date range selector dropdown

let currQStartDispaly = moment().startOf('Q').format('D' + ' ' + 'MMM');
$('#quarterToDateDisp').append(currQStartDispaly + ' - ' + monthCurr);

// get 'quarter to date' to appear in date range selector dropdown
// get 'financial year' to appear
if (moment().quarter() == 4) {
  var current_fiscal_year_start = moment().month('July').startOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
  var current_fiscal_year_end = moment().add(1, 'year').month('June').endOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
  var last_fiscal_year_start = moment().subtract(1, 'year').month('July').startOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
  var last_fiscal_year_end = moment().month('June').endOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
} else {
  var current_fiscal_year_start = moment().subtract(1,'year').month('July').startOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
  var current_fiscal_year_end = moment().month('June').endOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');

  var last_fiscal_year_start = moment().subtract(2, 'year').month('July').startOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
  var last_fiscal_year_end = moment().subtract(1, 'year').month('June').endOf('month').format('D' + ' ' + 'MMM' + ' ' + 'YYYY');
};
    //display current financial year
    $('#dispCurrFiscYear').append(current_fiscal_year_start + ' - ' + current_fiscal_year_end);
    //display last financial year
    $('#dispPrevFiscYear').append(last_fiscal_year_start + ' - ' + last_fiscal_year_end);
    //display current financial year to current date;
    $('#dispCurrFiscYearToDate').append(current_fiscal_year_start + ' - ' + monthCurr);
// get 'financial year' to appear end

    templateObject.getProfitandLossReports = function (dateFrom, dateTo, ignoreDate) {
        if (!localStorage.getItem('VS1ProfitandLoss_ReportCompare1')) {
            reportService.getProfitandLossCompare(dateFrom, dateTo, ignoreDate).then(function (data) {
                let records = [];
                var groupsprofitloss = {};
                if (data.tprofitandlossperiodcomparereport) {
                    localStorage.setItem('VS1ProfitandLoss_ReportCompare', JSON.stringify(data) || '');
                    let totalNetAssets = 0;
                    let GrandTotalLiability = 0;
                    let GrandTotalAsset = 0;
                    let incArr = [];
                    let cogsArr = [];
                    let expArr = [];
                    let accountData = data.tprofitandlossperiodcomparereport;
                    let accountType = '';

                    var dataList = '';
                    for (let i = 0; i < accountData.length; i++) {

                        if (accountData[i]['AccountTypeDesc'].replace(/\s/g, '') == '') {
                                accountType = '';

                        } else {
                            accountType = accountData[i]['AccountTypeDesc'];
                        }
                        //console.log(accountType);
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        let jan2022Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        let dec2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        let nov2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        let oct2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        let sept2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        let aug2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                        
                        let jul2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                        
                        let jun2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                        
                        let may2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                        
                        if(accountData[i]['AccountHeaderOrder'].replace(/\s/g, '') == '' && accountType != ''){
                            dataList = {
                            id: accountData[i]['AccountID'] || '',
                            accounttype: accountType || "",
                            accounttypeshort: accountData[i]['AccountType'] || "",
                            accountname: accountData[i]['AccountName'] || '',
                            accountheaderorder: accountData[i]['AccountHeaderOrder'] || '',
                            accountno: accountData[i]['AccountNo'] || '',
                            totalamountex: '',
                            name: $.trim(accountData[i]['AccountName']).split(" ").join("_"),
                            jan2022: '',
                            dec2021: '',
                            nov2021: '',
                            oct2021: '',
                            sept2021: '',
                            aug2021: '',
                            jul2021: '',
                            jun2021: '',
                            may2021: '',
                            // totaltax: totalTax || 0.00


                        };
                        }else{
                        dataList = {
                            id: accountData[i]['AccountID'] || '',
                            accounttype: accountType || "",
                            accounttypeshort: accountData[i]['AccountType'] || "",
                            accountname: accountData[i]['AccountName'] || '',
                            accountheaderorder: accountData[i]['AccountHeaderOrder'] || '',
                            accountno: accountData[i]['AccountNo'] || '',
                            totalamountex: totalAmountEx || 0.00,
                            name: $.trim(accountData[i]['AccountName']).split(" ").join("_"),
                            jan2022: jan2022Amt,
                            dec2021: dec2021Amt,
                            nov2021: nov2021Amt,
                            oct2021: oct2021Amt,
                            sept2021: sept2021Amt,
                            aug2021:  aug2021Amt,
                            jul2021: jul2021Amt,
                            jun2021: jun2021Amt,
                            may2021: may2021Amt,
                            // totaltax: totalTax || 0.00


                        };

                        }


                        let accTypeArr= [accountType];
                        let remBlanks = accTypeArr.filter(function (y) {return y != null && y != 0 && y.length > 0;});



                        if(accountData[i]['AccountType'].replace(/\s/g, '') == '' && accountType == ''){


                        }else{
                         records.push(dataList);
                         let dataToDisplay = accountData[i]['AccountType']||'';
                         if(accountData[i]['AccountType'] == 'AP'){
                           dataToDisplay = 'Accounts Payable';
                         }else if(accountData[i]['AccountType'] == 'AR'){
                           dataToDisplay = 'Accounts Receivable';
                         }else if(accountData[i]['AccountType'] == 'EQUITY'){
                           dataToDisplay = 'Capital / Equity';
                         }else if(accountData[i]['AccountType'] == 'BANK'){
                           dataToDisplay = 'Cheque or Saving';
                         }else if(accountData[i]['AccountType'] == 'COGS'){
                           dataToDisplay = 'Cost of Goods Sold';
                         }else if(accountData[i]['AccountType'] == 'CCARD'){
                           dataToDisplay = 'Credit Card Account';
                         }else if(accountData[i]['AccountType'] == 'EXP'){
                           dataToDisplay = 'Expense';
                         }else if(accountData[i]['AccountType'] == 'FIXASSET'){
                           dataToDisplay = 'Fixed Asset';
                         }else if(accountData[i]['AccountType'] == 'INC'){
                           dataToDisplay = 'Income';
                         }else if(accountData[i]['AccountType'] == 'LTLIAB'){
                           dataToDisplay = 'Long Term Liability';
                         }else if(accountData[i]['AccountType'] == 'OASSET'){
                           dataToDisplay = 'Other Asset';
                         }else if(accountData[i]['AccountType'] == 'OCASSET'){
                           dataToDisplay = 'Other Current Asset';
                         }else if(accountData[i]['AccountType'] == 'OCLIAB'){
                           dataToDisplay = 'Other Current Liability';
                         }else if(accountData[i]['AccountType'] == 'EXEXP'){
                           dataToDisplay = 'Other Expense';
                         }else if(accountData[i]['AccountType'] == 'EXINC'){
                           dataToDisplay = 'Other Income';
                         }else if(accountData[i]['AccountType'] == 'NI'){
                           dataToDisplay = 'Net Income';
                         };
                            //if(accountType != ''){
                            var groupName = dataToDisplay||accountType ||'';
                                    if (!groupsprofitloss[groupName]) {
                                        groupsprofitloss[groupName] = [];
                                    }

                            groupsprofitloss[groupName].push(dataList);
                            //}
                        }

                    }
                    console.log(groupsprofitloss);

                    templateObject.recordslayout.set(groupsprofitloss);
                    templateObject.records.set(records);
                    if (templateObject.records.get()) {
                        setTimeout(function () {
                            $('td a').each(function () {
                                if ($(this).text().indexOf('-' + Currency) >= 0) {
                                    $(this).addClass('text-danger');
                                    $(this).removeClass('fgrblue');
                                }

                            });
                            $('td').each(function () {
                                if ($(this).text().indexOf('-' + Currency) >= 0) {
                                    $(this).addClass('text-danger');
                                    $(this).removeClass('fgrblue');
                                }
                            });
                            $('.fullScreenSpin').css('display', 'none');
                        }, 100);

                        setTimeout(function(){
                            $(".sortableAccountParent").sortable({
                            revert: true,
                            cancel: ".undraggableDate,.accdate,.edtInfo"
                        });
                        $(".sortableAccount").sortable({
                            revert: true,
                            handle: ".avoid"
                        });
                        $(".draggable").draggable({
                            connectToSortable: ".sortableAccount",
                            helper: "none",
                            revert: "true"
                        });
                      },1000);
                    }

                }

            }).catch(function (err) {
                console.log(err);
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            let data = JSON.parse(localStorage.getItem('VS1ProfitandLoss_ReportCompare'));
            let records = [];
            if (data.tprofitandlossperiodcomparereport) {
                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = data.profitandlossreport;
                let accountType = '';

                for (let i = 0; i < accountData.length; i++) {

                    if (accountData[i]['AccountTypeDesc'].replace(/\s/g, '') == '') {
                        accountType = '';
                    } else {
                        accountType = accountData[i]['AccountTypeDesc'];
                    }
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                    let jan2022Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                    let dec2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                    let nov2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                    let oct2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                    let sept2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                    
                    let aug2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                    
                    let jul2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                    
                    let jun2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;                    
                    let may2021Amt = utilityService.modifynegativeCurrencyFormat(accountData[i]['TotalAmount']) || 0.00;
                    var dataList = {
                        id: accountData[i]['AccountID'] || '',
                        accounttype: accountType || "",
                        accountname: accountData[i]['AccountName'] || '',
                        accountno: accountData[i]['AccountNo'] || '',
                        totalamountex: totalAmountEx || 0.00,
                        name: $.trim(accountData[i]['AccountName']).split(" ").join("_"),
                        jan2022: jan2022Amt,
                        dec2021: dec2021Amt,
                        nov2021: nov2021Amt,
                        oct2021: oct2021Amt,
                        sept2021: sept2021Amt,
                          aug2021:  aug2021Amt,
                            jul2021: jul2021Amt,
                            jun2021: jun2021Amt,
                            may2021: may2021Amt,                        
                        // totaltax: totalTax || 0.00


                    };
                    if ((accountType == '') && (accountData[i]['AccountName'].replace(/\s/g, '') == '')) {

                    } else {
                        // if(accountType.toLowerCase().indexOf("total") >= 0){
                        //
                        // }
                        if ((accountData[i]['TotalAmount'] != 0)) {
                            records.push(dataList);
                        }

                    }


                }

                templateObject.records.set(records);
                if (templateObject.records.get()) {
                    setTimeout(function () {
                        $('td a').each(function () {
                            if ($(this).text().indexOf('-' + Currency) >= 0) {
                                $(this).addClass('text-danger');
                                $(this).removeClass('fgrblue');
                            }
                        });
                        $('td').each(function () {
                            if ($(this).text().indexOf('-' + Currency) >= 0) {
                                $(this).addClass('text-danger');
                                $(this).removeClass('fgrblue');
                            }
                        });
                        $('.fullScreenSpin').css('display', 'none');
                    }, 100);
                }

            }


        }
    };

    if (url.indexOf('?dateFrom') > 0) {
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        url = new URL(window.location.href);
        $("#dateFrom").val(moment(url.searchParams.get("dateFrom")).format("DD/MM/YYYY"));
        $("#dateTo").val(moment(url.searchParams.get("dateTo")).format("DD/MM/YYYY"));
        var getDateFrom = url.searchParams.get("dateFrom");
        var getLoadDate = url.searchParams.get("dateTo");
        templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);
    } else {
        var currentDate2 = new Date();
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
        templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);
    }

    templateObject.getDepartments = function () {
        reportService.getDepartment().then(function (data) {
            for (let i in data.tdeptclass) {

                let deptrecordObj = {
                    id: data.tdeptclass[i].Id || ' ',
                    department: data.tdeptclass[i].DeptClassName || ' ',
                };

                deptrecords.push(deptrecordObj);
                templateObject.deptrecords.set(deptrecords);

            }
        });

    }
    // templateObject.getAllProductData();
    //templateObject.getDepartments();

    //Dragable items in edit layout screen
    //This works now: break at your own peril
    setTimeout(function(){
        $(".sortableAccountParent").sortable({
        revert: true,
        cancel: ".undraggableDate,.accdate,.edtInfo"
    });
    $(".sortableAccount").sortable({
        revert: true,
        handle: ".avoid"
    });
    $(".draggable").draggable({
        connectToSortable: ".sortableAccount",
        helper: "none",
        revert: "true"
    });
  },1500);

    //    $( "ul, li" ).disableSelection();
    //Dragable items in edit layout screen end
    /*Visually hide additional periods so that custom selection handles it*/
    setTimeout(function(){
        
        $('td:nth-child(n+4)').hide();
        $('th:nth-child(n+4)').hide();
  },6000);
 setTimeout(function(){$('.pnlTable').show();},6000);
    /*Visual hide end*/
});


Template.newprofitandloss.events({
    'click #dropdownDateRang': function (e) {
        let dateRangeID = e.target.id;
        $('#btnSltDateRange').addClass('selectedDateRangeBtnMod');
        $('#selectedDateRange').show();

        if (dateRangeID == "thisMonth") {
            document.getElementById("selectedDateRange").value = "This Month";
        } else if (dateRangeID == "thisQuarter") {
            document.getElementById("selectedDateRange").value = "This Quarter";
        } else if (dateRangeID == "thisFinYear") {
            document.getElementById("selectedDateRange").value = "This Financial Year";
        } else if (dateRangeID == "lastMonth") {
            document.getElementById("selectedDateRange").value = "Last Month";
        } else if (dateRangeID == "lastQuarter") {
            document.getElementById("selectedDateRange").value = "Last Quarter";
        } else if (dateRangeID == "lastFinYear") {
            document.getElementById("selectedDateRange").value = "Last Financial Year";
        } else if (dateRangeID == "monthToDate") {
            document.getElementById("selectedDateRange").value = "Month to Date";
        } else if (dateRangeID == "quarterToDate") {
            document.getElementById("selectedDateRange").value = "Quarter to Date";
        } else if (dateRangeID == "finYearToDate") {
            document.getElementById("selectedDateRange").value = "Year to Date";
        }
    },
    'click .accountingBasisDropdown': function (e) {
        e.stopPropagation();
    },
    'click td a': function (event) {
        let id = $(event.target).closest('tr').attr('id').split("item-value-");
        var accountName = id[1].split('_').join(' ');
        let toDate = moment($('#dateTo').val()).clone().endOf('month').format('YYYY-MM-DD');
        let fromDate = moment($('#dateFrom').val()).clone().startOf('year').format('YYYY-MM-DD');
        //Session.setPersistent('showHeader',true);
        window.open('/balancetransactionlist?accountName=' + accountName + '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem=' + false, '_self');
    },
    'change #dateTo': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //templateObject.getProfitandLossReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
            templateObject.getProfitandLossReports('', '', true);
            templateObject.dateAsAt.set('Current Date');
        } else {
            templateObject.getProfitandLossReports(formatDateFrom, formatDateTo, false);
            templateObject.dateAsAt.set(formatDate);
        }

    },
    'change #dateFrom': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //templateObject.getProfitandLossReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
            templateObject.getProfitandLossReports('', '', true);
            templateObject.dateAsAt.set('Current Date');
        } else {
            templateObject.getProfitandLossReports(formatDateFrom, formatDateTo, false);
            templateObject.dateAsAt.set(formatDate);
        }

    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        Meteor._reload.reload();
    },
    'click .btnPrintReport': function (event) {
        $(".printReport").print({
            title: document.title + " | Aged Receivables | " + loggedCompany,
            noPrintSelector: ".addSummaryEditor, .excludeButton",
            exportOptions: {
                stripHtml: false,
            },
        })
    },
    'click .btnExportReportProfit': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        const filename = loggedCompany + '-Profit and Loss' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        // reportService.getProfitandLoss(formatDateFrom,formatDateTo,false).then(function (data) {
        //     if(data.profitandlossreport){
        //         rows[0] = ['Account Type','Account Name', 'Account Number', 'Total Amount(EX)'];
        //         data.profitandlossreport.forEach(function (e, i) {
        //             rows.push([
        //               data.profitandlossreport[i]['AccountTypeDesc'],
        //               data.profitandlossreport[i].AccountName,
        //               data.profitandlossreport[i].AccountNo,
        //               // utilityService.modifynegativeCurrencyFormat(data.profitandlossreport[i]['Sub Account Total']),
        //               utilityService.modifynegativeCurrencyFormat(data.profitandlossreport[i].TotalAmount)]);
        //         });
        //         setTimeout(function () {
        //             utilityService.exportReportToCsv(rows, filename, 'xls');
        //             $('.fullScreenSpin').css('display','none');
        //         }, 1000);
        //     }
        //
        // });
    },
    'click #lastMonth': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
          return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
          return  formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
          return  date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);

    },
//        'click #thisMonth': function () {
//        let templateObject = Template.instance();
//        $('.fullScreenSpin').css('display', 'inline-block');
//        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
//        $('#dateFrom').attr('readonly', false);
//        $('#dateTo').attr('readonly', false);
//        var currentDate = new Date();
//        var begunDate = moment(currentDate).format("DD/MM/YYYY");
//
//        let fromDateMonth = (currentDate.getMonth() + 1);
//        let fromDateDay = currentDate.getDate();
//        if ((currentDate.getMonth() + 1) < 10) {
//            fromDateMonth = "0" + (currentDate.getMonth() + 1);
//        }
//        if (currentDate.getDate() < 10) {
//            fromDateDay = "0" + currentDate.getDate();
//        }
//
//        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();
//        templateObject.dateAsAt.set(begunDate);
//        $("#dateFrom").val(fromDate);
//        $("#dateTo").val(begunDate);
//
//        var currentDate2 = new Date();
//        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
//        let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
//        templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);
//
//    },
    'click #lastQuarter': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        function getQuarter(d) {
            d = d || new Date();
            var m = Math.floor(d.getMonth() / 3) + 2;
            return m > 4 ? m - 4 : m;
        }

        var quarterAdjustment = (moment().month() % 3) + 1;
        var lastQuarterEndDate = moment().subtract({
            months: quarterAdjustment
        }).endOf('month');
        var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({
            months: 2
        }).startOf('month');

        var lastQuarterStartDateFormat = moment(lastQuarterStartDate).format("DD/MM/YYYY");
        var lastQuarterEndDateFormat = moment(lastQuarterEndDate).format("DD/MM/YYYY");

        templateObject.dateAsAt.set(lastQuarterStartDateFormat);
        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);


        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);

    },
    'click #last12Months': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if ((currentDate.getMonth() + 1) < 10) {
            fromDateMonth = "0" + (currentDate.getMonth() + 1);
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        templateObject.dateAsAt.set(begunDate);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + Math.floor(currentDate2.getMonth() + 1) + "-" + currentDate2.getDate();
        templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);


    },
    'click #ignoreDate': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1ProfitandLoss_ReportCompare', '');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.dateAsAt.set('Current Date');
        templateObject.getProfitandLossReports('', '', true);

    },
    'keyup #myInputSearch': function (event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function () {
                var found = 'false';
                $(this).each(function () {
                    if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        found = 'true';
                    }
                });
                if (found == 'true') {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('.table tbody tr').show();
        }
    },
    'blur #myInputSearch': function (event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function () {
                var found = 'false';
                $(this).each(function () {
                    if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                        found = 'true';
                    }
                });
                if (found == 'true') {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            });
        } else {
            $('.table tbody tr').show();
        }
    },
    'click .nonePeriod': function (event) {
        $('td:nth-child(n+3)').show();
        $('th:nth-child(n+3)').show();
        $('td:nth-child(n+4)').hide();
        $('th:nth-child(n+4)').hide();
    },
    'click .onePeriod': function (event) {
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));
        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        $('td:nth-child(n+4)').show();
        $('th:nth-child(n+4)').show();
        $('td:nth-child(n+5)').hide();
        $('th:nth-child(n+5)').hide();

    },
    'click .twoPeriods': function (event) {
        $('td:nth-child(n+4)').show();
        $('th:nth-child(n+4)').show();
        $('td:nth-child(n+6)').hide();
        $('th:nth-child(n+6)').hide();
    },
    'click .threePeriods': function (event) {
        $('td:nth-child(n+4)').show();
        $('th:nth-child(n+4)').show();
        $('td:nth-child(n+7)').hide();
        $('th:nth-child(n+7)').hide();
    },
    'click .fourPeriods': function (event) {
        $('td:nth-child(n+4)').show();
        $('th:nth-child(n+4)').show();
        $('td:nth-child(n+8)').hide();
        $('th:nth-child(n+8)').hide();
    },
   //custom selection period number
    'click .btnSaveComparisonPeriods': function (event) {


        if (typeof custPeriod !== 'undefined'){
                    $('td:nth-child(n+4)').hide();
        $('th:nth-child(n+4)').hide();
            j = 0;
            custPeriod = 0;
            custPeriod = $('#comparisonPeriodNum').val();
            perModded = 0;
            perModded = custPeriod;
            while (j < perModded) {
            j++;
                $('td:nth-child('+(j+3)+')').show();
                $('th:nth-child('+(j+3)+')').show();
            }
            }
        else{
                    $('td:nth-child(n+4)').hide();
        $('th:nth-child(n+4)').hide();
        var j = 0;
        var custPeriod;
        custPeriod = $('#comparisonPeriodNum').val();

        var perModded ;
       perModded = custPeriod;
            while (j < perModded) {
            j++;
                $('td:nth-child('+(j+3)+')').show();
                $('th:nth-child('+(j+3)+')').show();
            }
        }
//        }

        //        var custPeriod = $('#comparisonPeriodNum').val();
//
//        let i = 0;
//        while (i < custPeriod) {
//            i++;
//            $('.table-active').append('<th style="width: 178px;" class="text-right">Next Date</th>');
//            $('tbody').each('tr').append('<td></td>');
//
//        }

    },
 // period selector end

    'click .btnCloseCustomComparison': function (event) {

    },


    'click .lytAccountToggle': function (event) {

        $('.lytAccountToggle').each(function () {
            if ($('.lytAccountToggle').is(':checked')) {
                $('.btnAddGroup').hide();
                $('.btnGroupAccounts').show();
            } else {
                $('.btnAddGroup').show();
                $('.btnGroupAccounts').hide();
            }
        });

    },
    'click .btnMoveAccount': function (event) {
        $('.lytAccountToggle').each(function () {
            if ($('.lytAccountToggle').is(':checked')) {
                $('#nplMoveAccountScreen').modal('show');
            } else if ($('.lytAccountToggle').not(':checked')) {
                $('#nplNoSelection').modal('show');
            }
        });
    },
    'click .avoid': function (event) {
        $('.avoid').each(function () {
            $(this).click(function () {
                var el = $(this).attr('id');
                if (el === 'gP') {
                                        $(this).addClass('currSelectedItem');
                    $('.edlayCalculator').show();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.totalSelctor').hide();
                    $('.pgbSideText').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                     $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
                    $('.rowEdLayCalculator').hide();
                            $('.columnEdLayCalculator').hide();
                    $('.budgetColumnTab').hide();
                            $('.varianceColumnTab').hide();
                    $('.percentageColumnTab').hide();
                            $('.newDateColumnTab').hide();
//                            $('.btnRowAccounts,.btnRowCustom').hide();
                } else if (el === 'nP') {
                                        $(this).addClass('currSelectedItem');
                    $('.edlayCalculator').show();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.totalSelctor').hide();
                    $('.pgbSideText').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                     $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
                    $('.rowEdLayCalculator').hide();
                            $('.columnEdLayCalculator').hide();
                    $('.budgetColumnTab').hide();
                            $('.varianceColumnTab').hide();
                    $('.percentageColumnTab').hide();
                            $('.newDateColumnTab').hide();
                            $('.btnRowAccounts,.btnRowCustom').hide();
                } else {
                                        $(this).addClass('currSelectedItem');
                    $('.editGroup').show();
                    $('.edlayCalculator').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.totalSelctor').hide();
                    $('.pgbSideText').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                     $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
                    $('.rowEdLayCalculator').hide();
                            $('.columnEdLayCalculator').hide();
                    $('.budgetColumnTab').hide();
                            $('.varianceColumnTab').hide();
                    $('.percentageColumnTab').hide();
                            $('.newDateColumnTab').hide();
                            $('.btnRowAccounts,.btnRowCustom').hide();
                }
            });
        });
    },

    /*Page break section display start*/
        'click .sortableAccount .draggable': function (event) {
        $(this).each(function () {
            $(this).click(function () {
                var el = $(this).attr('id');
                if (el === 'pgBreak1') {
                    $(this).addClass('currSelectedItem');
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').show();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
                    $('.rowEdLayCalculator').hide();
                            $('.columnEdLayCalculator').hide();
                    $('.budgetColumnTab').hide();
                            $('.varianceColumnTab').hide();
                    $('.percentageColumnTab').hide();
                            $('.newDateColumnTab').hide();
                            $('.btnRowAccounts,.btnRowCustom').hide();

                }else {

                    $('.editGroup').show();
                    $('.edlayCalculator').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.totalSelctor').hide();
                    $('.pgbSideText').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                     $('.scheduleColumn').hide();
                                        $('.editRowGroup').hide();
                    $('.rowEdLayCalculator').hide();
                            $('.columnEdLayCalculator').hide();
                    $('.budgetColumnTab').hide();
                            $('.varianceColumnTab').hide();
                    $('.percentageColumnTab').hide();
                            $('.newDateColumnTab').hide();
                            $('.btnRowAccounts,.btnRowCustom').hide();
                }
            });
        });
    },
     /*Page break section display end*/
    /*Total row display section start */
    'click .tot':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').show();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
         $('.scheduleColumn').hide();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
    /*Total row display section end */
    /*edit layout button start*/
    'click .nplLayoutEditorBtn': function (event) {

        $('.editGroup').hide();
        $('.edlayCalculator').hide();
        $('.groupRow').hide();
        $('.editDefault').show();
        $('.totalSelctor').hide();
        $('.pgbSideText').hide();
        $('.dateColumnTab').hide();
        $('.textBlockColumn').hide();
        $('.notesColumn').hide();
        $('.scheduleColumn').hide();
        $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();

    },
    /*edit layout button end*/
    //calculator account selector
    'click .accValSelect': function (event) {

        var optSelectCheck = $('.accValSelect').val();
        if (optSelectCheck === null) {
            $('.nonOption').hide();

        } else {

            $('.nonOption').hide();

//            var calcOptSelected = $('.accValSelect').val();
//            var calcFieldContent = $('.calcField').val();


//            var insblock = $('<input type="button" disabled class="calcVarBlock" data-formula-value="something1>');
             $('.calcField').append('<input type="button" disabled class="calcVarBlock" value="'+optSelectCheck+'">').val(optSelectCheck);
            optSelectCheck = null;
        }

    },
    //calculator account selector end

    //adding blocks
//    'click .calcOption':function(event){
//
//            var calcOptSelected = $('.accValSelect').val();
//            var calcFieldContent = $('.calcField').val();
//
//            var addCalcVarBlock = $('<input type="button" disabled class="calcVarBlock" data-formula-value="something1">').attr('value',calcOptSelected);
//             $('.calcField').append(calcFieldContent+addCalcVarBlock);
//    },
    //end adding blocks
    //calculator buttons
        /*    'click .opBtn':function (event){
        $('.opBtn').each(function () {
                var valEntry1 = $('.opBtn').val();
                var valEntry2 = $('.calcField').val();
                $('.calcField').val(valEntry2 + valEntry1);
                });
            }*/
    //calculator buttons currently
    'click .addition': function (event) {
        var valEntry1 = $('.addition').val();
        var valEntry2 = $('.calcField').val();
//        $('.calcField').append(valEntry2 + valEntry1);
        $('.calcField').append(valEntry1);
    },
    'click .minus': function (event) {
        var valEntry1 = $('.minus').val();
        var valEntry2 = $('.calcField').val();
//        $('.calcField').append(valEntry2 + valEntry1);
        $('.calcField').append(valEntry1);
    },
    'click .multi': function (event) {
        var valEntry1 = $('.multi').val();
        var valEntry2 = $('.calcField').val();
//        $('.calcField').append(valEntry2 + valEntry1);
        $('.calcField').append(valEntry1);
    },
    'click .divide': function (event) {
        var valEntry1 = $('.divide').val();
        var valEntry2 = $('.calcField').val();
//        $('.calcField').append(valEntry2 + valEntry1);
        $('.calcField').append(valEntry1);
    },
    'click .ifBlock': function (event) {
        var valEntry1 = $('.ifBlock').val();
        var valEntry2 = $('.calcField').val();
//        $('.calcField').append(valEntry2 + valEntry1);
        $('.calcField').append(valEntry1);
    },
    //end calculator buttons

    //show group row section
    'click .sortableAccount .draggable': function (event){
        $('.editGroup').hide();
        $('.edlayCalculator').hide();
        $('.groupRow').show();
        $('.editDefault').hide();
        $('.totalSelctor').hide();
        $('.pgbSideText').hide();
        $('.dateColumnTab').hide();
        $('.textBlockColumn').hide();
        $('.notesColumn').hide();
         $('.scheduleColumn').hide();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();

    },
    //end group row section
    'click #pgBreak1,.pageBreakBar ':function (event) {
                $(this).addClass('currSelectedItem');
                $('.edlayCalculator').hide();
                $('.editGroup').hide();
                $('.editDefault').hide();
                $('.groupRow').hide();
                $('.pgbSideText').show();
                $('.totalSelctor').hide();
                $('.dateColumnTab').hide();
                $('.textBlockColumn').hide();
                $('.notesColumn').hide();
                $('.scheduleColumn').hide();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
                },
    'click .accdate':function (event){
                $('.edlayCalculator').hide();
                $('.editGroup').hide();
                $('.editDefault').hide();
                $('.groupRow').hide();
                $('.pgbSideText').hide();
                $('.totalSelctor').hide();
                $('.dateColumnTab').show();
                $('.textBlockColumn').hide();
                $('.notesColumn').hide();
                $('.scheduleColumn').hide();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },

    //top row icon events
    'click .btnTextBlockColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').show();
                    $('.notesColumn').hide();
                     $('.scheduleColumn').hide();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
    'click .btnNotes':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').show();
                     $('.scheduleColumn').hide();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
    'click .btnscheduleColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').show();
                            $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
        $('.btnRowAccounts,.btnRowCustom').show();
    },
    'click .btnRowGroupColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').show();
        $('.rowEdLayCalculator').hide();
                $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
    'click .btnRowFormulaColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
        $('.rowEdLayCalculator').show();
        $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();

    },
    'click .btnColFormulaColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
        $('.columnEdLayCalculator').show();
        $('.budgetColumnTab').hide();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();

    },
    'click .btnBudgetColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
        $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').show();
                $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
    'click .btnVarianceColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
        $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
        $('.varianceColumnTab').show();
        $('.percentageColumnTab').hide();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();

    },
    'click .btnPercentageColumn':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
        $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
        $('.varianceColumnTab').hide();
        $('.percentageColumnTab').show();
                $('.newDateColumnTab').hide();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
    'click .btnNewDateColumnTab':function(event){
                    $('.edlayCalculator').hide();
                    $('.editGroup').hide();
                    $('.editDefault').hide();
                    $('.groupRow').hide();
                    $('.pgbSideText').hide();
                    $('.totalSelctor').hide();
                    $('.dateColumnTab').hide();
                    $('.textBlockColumn').hide();
                    $('.notesColumn').hide();
                    $('.scheduleColumn').hide();
                    $('.editRowGroup').hide();
        $('.rowEdLayCalculator').hide();
        $('.columnEdLayCalculator').hide();
        $('.budgetColumnTab').hide();
        $('.varianceColumnTab').hide();
        $('.percentageColumnTab').hide();
        $('.newDateColumnTab').show();
                $('.btnRowAccounts,.btnRowCustom').hide();
    },
      'click .btnPageBreak':function(event){
          $('.sortableAccountParent').append('<div class="sortableAccount pageBreakBar"><div class="draggable" id="pgBreak1"><label class="col-12 dragAcc" style=" text-align: center; background-color:#00a3d3; border-color: #00a3d3;color:#fff;">Page break (row)</label></div></div>');
    $(".sortableAccountParent").sortable({
        revert: true,
        cancel: ".undraggableDate,.accdate,.edtInfo"
    });
    $(".sortableAccount").sortable({
        revert: true,
        handle: ".avoid"
    });
    $(".draggable").draggable({
        connectToSortable: ".sortableAccount",
        helper: "none",
        revert: "true"
    });
      },
    'click .btnDelSelected':function(event){
        $('.currSelectedItem:nth-child(n)').remove();
      }
});

Template.newprofitandloss.helpers({
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    },
    records: () => {
        return Template.instance().records.get();
        //   .sort(function(a, b){
        //     if (a.accounttype == 'NA') {
        //   return 1;
        //       }
        //   else if (b.accounttype == 'NA') {
        //     return -1;
        //   }
        // return (a.accounttype.toUpperCase() > b.accounttype.toUpperCase()) ? 1 : -1;
        // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        // });
    },
    recordslayout: () => {
        return Template.instance().recordslayout.get();
    },
    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () => {
        return loggedCompany;
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function (a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    }
});

Template.registerHelper('equals', function (a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function (a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function (a, b) {
    let chechTotal = false;
    if(a.toLowerCase().indexOf(b.toLowerCase()) >= 0){
      chechTotal = true;
    }
    return chechTotal;
});
