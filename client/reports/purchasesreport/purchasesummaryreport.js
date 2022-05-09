import {
    ReportService
} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {
    UtilityService
} from "../../utility-service";

let reportService = new ReportService();
let utilityService = new UtilityService();
Template.purchasesummaryreport.onCreated(() => {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar([]);
    templateObject.grandrecords = new ReactiveVar();
    templateObject.dateAsAt = new ReactiveVar();
    templateObject.deptrecords = new ReactiveVar();

    templateObject.reportrecords = new ReactiveVar([]);
});

Template.purchasesummaryreport.onRendered(() => {
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

    let imageData = (localStorage.getItem("Image"));
    if (imageData) {
        $('#uploadedImage').attr('src', imageData);
        $('#uploadedImage').attr('width', '50%');
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();


    templateObject.dateAsAt.set(begunDate);
    const dataTableList = [];
    const deptrecords = [];
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

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    templateObject.getPurchasesReports = function(dateFrom, dateTo, ignoreDate) {
        templateObject.records.set('');
        templateObject.grandrecords.set('');
        if (!localStorage.getItem('VS1PurchaseSummary_Report')) {
            reportService.getPurchaseSummaryDetailsData(dateFrom, dateTo, ignoreDate).then(function(data) {
                let totalRecord = [];
                let grandtotalRecord = [];

                if (data.tbillreport.length) {
                    localStorage.setItem('VS1PurchaseSummary_Report', JSON.stringify(data) || '');
                    let records = [];
                    let reportrecords = [];
                    let allRecords = [];
                    let current = [];

                    let totalNetAssets = 0;
                    let GrandTotalLiability = 0;
                    let GrandTotalAsset = 0;
                    let incArr = [];
                    let cogsArr = [];
                    let expArr = [];
                    let accountData = data.tbillreport;
                    let accountType = '';
                    let purchaseID = '';
                    for (let i = 0; i < accountData.length; i++) {
                        if (data.tbillreport[i].Type == "Bill") {
                            purchaseID = data.tbillreport[i].PurchaseOrderID;
                        }
                        let recordObj = {};
                        recordObj.Id = data.tbillreport[i].PurchaseOrderID;
                        recordObj.type = data.tbillreport[i].Type;
                        recordObj.Company = data.tbillreport[i].Company;
                        recordObj.dataArr = [
                            '',
                            data.tbillreport[i].Type,
                            data.tbillreport[i].PurchaseOrderID,
                            // moment(data.tbillreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
                            data.tbillreport[i].OrderDate != '' ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY") : data.tbillreport[i].OrderDate,
                            data.tbillreport[i].Phone || '-',
                            utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Ex)"]) || '0.00',
                            utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Tax"]) || '0.00',
                            utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Inc)"]) || '0.00',
                            utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance) || '0.00'


                            //
                        ];


                        //   if((data.tbillreport[i].AmountDue != 0) || (data.tbillreport[i].Current != 0)
                        //   || (data.tbillreport[i]["30Days"] != 0) || (data.tbillreport[i]["60Days"] != 0)
                        // || (data.tbillreport[i]["90Days"] != 0) || (data.tbillreport[i]["120Days"] != 0)){
                        //
                        //   }

                        records.push(recordObj);

                    }


                    records = _.sortBy(records, 'Company');
                    records = _.groupBy(records, 'Company');
                    for (let key in records) {
                        let obj = [{
                            key: key
                        }, {
                            data: records[key]
                        }];
                        allRecords.push(obj);
                    }

                    let iterator = 0;
                    for (let i = 0; i < allRecords.length; i++) {
                        let totalAmountEx = 0;
                        let totalTax = 0;
                        let amountInc = 0;
                        let balance = 0;
                        let twoMonth = 0;
                        let threeMonth = 0;
                        let Older = 0;
                        const currencyLength = Currency.length;
                        for (let k = 0; k < allRecords[i][1].data.length; k++) {
                            totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
                            totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
                            amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
                            balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);



                        }
                        var dataList = {
                            id: allRecords[i][1].data[0].dataArr[2] || '',
                            contact: allRecords[i][0].key || '',
                            type: '',
                            orderno: '',
                            orderdate: '',
                            phone: '',
                            totalamountex: utilityService.modifynegativeCurrencyFormat(totalAmountEx) || '0.00',
                            totaltax: utilityService.modifynegativeCurrencyFormat(totalTax) || '0.00',
                            totalamount: utilityService.modifynegativeCurrencyFormat(amountInc) || '0.00',
                            balance: utilityService.modifynegativeCurrencyFormat(balance) || '0.00'
                        };

                        reportrecords.push(dataList);

                        // reportrecords = _.sortBy(reportrecords, 'contact');
                        templateObject.reportrecords.set(reportrecords);
                        let val = ['Total ' + allRecords[i][0].key + '', '', '', '', '',
                            utilityService.modifynegativeCurrencyFormat(totalAmountEx), utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)
                        ];
                        current.push(val);

                    }


                    //grandtotalRecord
                    let grandamountduetotal = 0;
                    let grandtotalAmountEx = 0;
                    let grandtotalTax = 0;
                    let grandamountInc = 0;
                    let grandbalance = 0;

                    for (let n = 0; n < current.length; n++) {

                        const grandcurrencyLength = Currency.length;

                        grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
                        grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
                        grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
                        grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);


                    }


                    let grandval = ['Grand Total ' + '', '', '', '', '',
                        utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
                        utilityService.modifynegativeCurrencyFormat(grandtotalTax),
                        utilityService.modifynegativeCurrencyFormat(grandamountInc),
                        utilityService.modifynegativeCurrencyFormat(grandbalance)
                    ];


                    for (let key in records) {
                        let dataArr = current[iterator]
                        let obj = [{
                            key: key
                        }, {
                            data: records[key]
                        }, {
                            total: [{
                                dataArr: dataArr
                            }]
                        }];
                        totalRecord.push(obj);
                        iterator += 1;
                    }

                    templateObject.records.set(totalRecord);
                    templateObject.grandrecords.set(grandval);


                    if (templateObject.records.get()) {
                        setTimeout(function() {
                            $('td a').each(function() {
                                if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                            });
                            $('td').each(function() {
                                if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                            });

                            $('td').each(function() {

                                let lineValue = $(this).first().text()[0];
                                if (lineValue != undefined) {
                                    if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
                                }

                            });

                            $('td').each(function() {
                                if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
                            });

                            $('.fullScreenSpin').css('display', 'none');
                        }, 100);
                    }

                } else {
                    let records = [];
                    let recordObj = {};
                    recordObj.Id = '';
                    recordObj.type = '';
                    recordObj.SupplierName = ' ';
                    recordObj.dataArr = [
                        '-',
                        '-',
                        '-',
                        '-',
                        '-',
                        '-',
                        '-',
                        '-',
                        '-',
                        '-'
                    ];

                    records.push(recordObj);
                    templateObject.records.set(records);
                    templateObject.grandrecords.set('');
                    $('.fullScreenSpin').css('display', 'none');
                }

            }).catch(function(err) {
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            let totalRecord = [];
            let grandtotalRecord = [];
            let data = JSON.parse(localStorage.getItem('VS1PurchaseSummary_Report'));
            if (data.tbillreport.length) {
                let records = [];
                let reportrecords = [];
                let allRecords = [];
                let current = [];

                let totalNetAssets = 0;
                let GrandTotalLiability = 0;
                let GrandTotalAsset = 0;
                let incArr = [];
                let cogsArr = [];
                let expArr = [];
                let accountData = data.tbillreport;
                let accountType = '';
                let purchaseID = '';
                for (let i = 0; i < accountData.length; i++) {
                    if (data.tbillreport[i].Type == "Bill") {
                        purchaseID = data.tbillreport[i].PurchaseOrderID;
                    }
                    let recordObj = {};
                    recordObj.Id = data.tbillreport[i].PurchaseOrderID;
                    recordObj.type = data.tbillreport[i].Type;
                    recordObj.Company = data.tbillreport[i].Company;
                    recordObj.dataArr = [
                        '',
                        data.tbillreport[i].Type,
                        data.tbillreport[i].PurchaseOrderID,
                        // moment(data.tbillreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
                        data.tbillreport[i].OrderDate != '' ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY") : data.tbillreport[i].OrderDate,
                        data.tbillreport[i].Phone || '-',
                        utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Ex)"]) || '0.00',
                        utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Tax"]) || '0.00',
                        utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]["Total Amount (Inc)"]) || '0.00',
                        utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance) || '0.00'


                        //
                    ];


                    //   if((data.tbillreport[i].AmountDue != 0) || (data.tbillreport[i].Current != 0)
                    //   || (data.tbillreport[i]["30Days"] != 0) || (data.tbillreport[i]["60Days"] != 0)
                    // || (data.tbillreport[i]["90Days"] != 0) || (data.tbillreport[i]["120Days"] != 0)){
                    //
                    //   }

                    records.push(recordObj);

                }


                records = _.sortBy(records, 'Company');
                records = _.groupBy(records, 'Company');
                for (let key in records) {
                    let obj = [{
                        key: key
                    }, {
                        data: records[key]
                    }];
                    allRecords.push(obj);
                }

                let iterator = 0;
                for (let i = 0; i < allRecords.length; i++) {
                    let totalAmountEx = 0;
                    let totalTax = 0;
                    let amountInc = 0;
                    let balance = 0;
                    let twoMonth = 0;
                    let threeMonth = 0;
                    let Older = 0;
                    const currencyLength = Currency.length;
                    for (let k = 0; k < allRecords[i][1].data.length; k++) {
                        totalAmountEx = totalAmountEx + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
                        totalTax = totalTax + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
                        amountInc = amountInc + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
                        balance = balance + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);



                    }
                    var dataList = {
                        id: allRecords[i][1].data[0].dataArr[2] || '',
                        contact: allRecords[i][0].key || '',
                        type: '',
                        orderno: '',
                        orderdate: '',
                        phone: '',
                        totalamountex: utilityService.modifynegativeCurrencyFormat(totalAmountEx) || '0.00',
                        totaltax: utilityService.modifynegativeCurrencyFormat(totalTax) || '0.00',
                        totalamount: utilityService.modifynegativeCurrencyFormat(amountInc) || '0.00',
                        balance: utilityService.modifynegativeCurrencyFormat(balance) || '0.00'
                    };

                    reportrecords.push(dataList);

                    // reportrecords = _.sortBy(reportrecords, 'contact');
                    templateObject.reportrecords.set(reportrecords);
                    let val = ['Total ' + allRecords[i][0].key + '', '', '', '', '',
                        utilityService.modifynegativeCurrencyFormat(totalAmountEx), utilityService.modifynegativeCurrencyFormat(totalTax), utilityService.modifynegativeCurrencyFormat(amountInc), utilityService.modifynegativeCurrencyFormat(balance)
                    ];
                    current.push(val);

                }


                //grandtotalRecord
                let grandamountduetotal = 0;
                let grandtotalAmountEx = 0;
                let grandtotalTax = 0;
                let grandamountInc = 0;
                let grandbalance = 0;

                for (let n = 0; n < current.length; n++) {

                    const grandcurrencyLength = Currency.length;

                    grandtotalAmountEx = grandtotalAmountEx + utilityService.convertSubstringParseFloat(current[n][5]);
                    grandtotalTax = grandtotalTax + utilityService.convertSubstringParseFloat(current[n][6]);
                    grandamountInc = grandamountInc + utilityService.convertSubstringParseFloat(current[n][7]);
                    grandbalance = grandbalance + utilityService.convertSubstringParseFloat(current[n][8]);


                }


                let grandval = ['Grand Total ' + '', '', '', '', '',
                    utilityService.modifynegativeCurrencyFormat(grandtotalAmountEx),
                    utilityService.modifynegativeCurrencyFormat(grandtotalTax),
                    utilityService.modifynegativeCurrencyFormat(grandamountInc),
                    utilityService.modifynegativeCurrencyFormat(grandbalance)
                ];


                for (let key in records) {
                    let dataArr = current[iterator]
                    let obj = [{
                        key: key
                    }, {
                        data: records[key]
                    }, {
                        total: [{
                            dataArr: dataArr
                        }]
                    }];
                    totalRecord.push(obj);
                    iterator += 1;
                }

                templateObject.records.set(totalRecord);
                templateObject.grandrecords.set(grandval);


                if (templateObject.records.get()) {
                    setTimeout(function() {
                        $('td a').each(function() {
                            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                        });
                        $('td').each(function() {
                            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
                        });

                        $('td').each(function() {

                            let lineValue = $(this).first().text()[0];
                            if (lineValue != undefined) {
                                if (lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
                            }

                        });

                        $('td').each(function() {
                            if ($(this).first().text().indexOf('-' + Currency) >= 0) $(this).addClass('text-right')
                        });

                        $('.fullScreenSpin').css('display', 'none');
                    }, 100);
                }

            } else {
                let records = [];
                let recordObj = {};
                recordObj.Id = '';
                recordObj.type = '';
                recordObj.SupplierName = ' ';
                recordObj.dataArr = [
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-',
                    '-'
                ];

                records.push(recordObj);
                templateObject.records.set(records);
                templateObject.grandrecords.set('');
                $('.fullScreenSpin').css('display', 'none');
            }

        }
    };

    var currentDate2 = new Date();
    var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
    templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);

    templateObject.getDepartments = function() {
        reportService.getDepartment().then(function(data) {
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
    templateObject.getDepartments();
});

Template.purchasesummaryreport.events({
    'click #btnDetails': function() {
        FlowRouter.go('/purchasesreport');
    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        templateObject.grandrecords.set('');
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //templateObject.getPurchasesReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
            templateObject.getPurchasesReports('', '', true);
            templateObject.dateAsAt.set('Current Date');
        } else {
            templateObject.getPurchasesReports(formatDateFrom, formatDateTo, false);
            templateObject.dateAsAt.set(formatDate);
        }

    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        templateObject.grandrecords.set('');
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //templateObject.getPurchasesReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {
            templateObject.getPurchasesReports('', '', true);
            templateObject.dateAsAt.set('Current Date');
        } else {
            templateObject.getPurchasesReports(formatDateFrom, formatDateTo, false);
            templateObject.dateAsAt.set(formatDate);
        }


    },
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseSummary_Report', '');
        Meteor._reload.reload();
    },
    'click td a': function(event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class');;

        if (redirectid && transactiontype) {
            if (transactiontype === 'Bill') {
                window.open('/billcard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Purchase Order') {
                window.open('/purchaseordercard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Credit') {
                window.open('/creditcard?id=' + redirectid, '_self');
            } else if (transactiontype === 'Supplier Payment') {
                window.open('/supplierpaymentcard?id=' + redirectid, '_self');
            }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport': function(event) {
        document.title = 'Purchase Summary Report';
        $(".printReport").print({
            title: document.title + " | Purchase Summary Report | " + loggedCompany,
            noPrintSelector: ".addSummaryEditor",
        })
    },
    'click .btnExportReport': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let utilityService = new UtilityService();
        let templateObject = Template.instance();
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        const filename = loggedCompany + '-Purchase Summary' + '.csv';
        utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
        let rows = [];
        let data = templateObject.reportrecords.get();

        //reportService.getPurchaseSummaryDetailsData(formatDateFrom,formatDateTo,false).then(function (data) {
        // if(data){
        //     rows[0] = ['Company', 'Type', 'Order No.', 'Order Date', 'Phone', 'Total Amount (Ex)', 'Total Tax', 'Total Amount (Inc)', 'Balance'];
        //     data.forEach(function (e, i) {
        //         rows.push([
        //           data[i].contact,
        //           '',
        //           '',
        //           '',
        //           '',
        //           data[i].totalamountex || '0.00',
        //           data[i].totaltax || '0.00',
        //           data[i].totalamount || '0.00',
        //           data[i].balance || '0.00']);
        //     });
        //     setTimeout(function () {
        //         utilityService.exportReportToCsv(rows, filename, 'xls');
        //         $('.fullScreenSpin').css('display','none');
        //     }, 1000);
        // }

        //});
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseSummary_Report', '');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();

        var prevMonthLastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
        var prevMonthFirstDate = new Date(currentDate.getFullYear() - (currentDate.getMonth() > 0 ? 0 : 1), (currentDate.getMonth() - 1 + 12) % 12, 1);

        var formatDateComponent = function(dateComponent) {
            return (dateComponent < 10 ? '0' : '') + dateComponent;
        };

        var formatDate = function(date) {
            return formatDateComponent(date.getDate()) + '/' + formatDateComponent(date.getMonth() + 1) + '/' + date.getFullYear();
        };

        var formatDateERP = function(date) {
            return date.getFullYear() + '-' + formatDateComponent(date.getMonth() + 1) + '-' + formatDateComponent(date.getDate());
        };


        var fromDate = formatDate(prevMonthFirstDate);
        var toDate = formatDate(prevMonthLastDate);

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(toDate);

        var getLoadDate = formatDateERP(prevMonthLastDate);
        let getDateFrom = formatDateERP(prevMonthFirstDate);
        templateObject.dateAsAt.set(fromDate);

        templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);

    },
    'click #lastQuarter': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseSummary_Report', '');
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
        templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);

    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        localStorage.setItem('VS1PurchaseSummary_Report', '');
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
        templateObject.getPurchasesReports(getDateFrom, getLoadDate, false);


    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        localStorage.setItem('VS1PurchaseSummary_Report', '');
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.dateAsAt.set('Current Date');
        templateObject.getPurchasesReports('', '', true);

    },
    'keyup #myInputSearch': function(event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function() {
                var found = 'false';
                $(this).each(function() {
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
    'blur #myInputSearch': function(event) {
        $('.table tbody tr').show();
        let searchItem = $(event.target).val();
        if (searchItem != '') {
            var value = searchItem.toLowerCase();
            $('.table tbody tr').each(function() {
                var found = 'false';
                $(this).each(function() {
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
    }

});
Template.purchasesummaryreport.helpers({
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

    grandrecords: () => {
        return Template.instance().grandrecords.get();
    },
    dateAsAt: () => {
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () => {
        return loggedCompany;
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b) {
            if (a.department == 'NA') {
                return 1;
            } else if (b.department == 'NA') {
                return -1;
            }
            return (a.department.toUpperCase() > b.department.toUpperCase()) ? 1 : -1;
        });
    },
    reportrecords: () => {
        return Template.instance().reportrecords.get();
    }
});
Template.registerHelper('equals', function(a, b) {
    return a === b;
});

Template.registerHelper('notEquals', function(a, b) {
    return a != b;
});

Template.registerHelper('containsequals', function(a, b) {
    return (a.indexOf(b) >= 0);
});
