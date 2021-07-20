import {PurchaseBoardService} from '../js/purchase-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import {PaymentsService} from '../payments/payments-service';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
let _ = require('lodash');
Template.purchasesoverview.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.creditperc = new ReactiveVar();
    templateObject.billperc = new ReactiveVar();
    templateObject.poperc = new ReactiveVar();
    templateObject.billpercTotal = new ReactiveVar();
    templateObject.creditpercTotal = new ReactiveVar();
    templateObject.popercTotal = new ReactiveVar();
});

Template.purchasesoverview.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let purchaseService = new PurchaseBoardService();
    let paymentService = new PaymentsService();
    const supplierList = [];
    let purchaseOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    let totAmount = 0;
    let totAmountBill = 0;
    let totAmountCredit = 0;

    let totCreditCount = 0;
    let totBillCount = 0;
    let totPOCount = 0;

    var today = moment().format('DD/MM/YYYY');
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    let fromDateMonth = currentDate.getMonth();
    let fromDateDay = currentDate.getDate();
    if (currentDate.getMonth() < 10) {
        fromDateMonth = "0" + currentDate.getMonth();
    }

    if (currentDate.getDate() < 10) {
        fromDateDay = "0" + currentDate.getDate();
    }
    var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

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

    var ctx = document.getElementById("myChartCustomer").getContext("2d");

    var date = new Date();
    var month = date.getMonth() + 1;
    date.setDate(1);
    var all_days = [];
    var all_daysNoYear = [];
    while ((date.getMonth() + 1) == month) {
        var d = date.getFullYear() + '-' + month.toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
        var dnoyear = moment(month.toString().padStart(2, '0')).format("MMMM").substring(0, 3) + ' ' + date.getDate().toString().padStart(2, '0');
        all_days.push(d);
        all_daysNoYear.push(dnoyear);
        date.setDate(date.getDate() + 1);
    }

    function MakeNegative() {
        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });
    };


    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblPurchaseOverview', function(error, result){
        if(error){

        }else{
            if(result){

                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;

                    $("th."+columnClass+"").html(columData);
                    $("th."+columnClass+"").css('width',""+columnWidth+"px");

                }
            }

        }
    });


    templateObject.getAllPurchaseOrderAll = function () {
      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = currentBeginDate.getMonth();
      let fromDateDay = currentBeginDate.getDate();
      if(currentBeginDate.getMonth() < 10){
          fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
      }else{
        fromDateMonth = (currentBeginDate.getMonth()+1);
      }

      if(currentBeginDate.getDate() < 10){
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay+1);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        getVS1Data('TbillReport').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllPurchaseOrderListAll(prevMonth11Date,toDate, false).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TbillReport',JSON.stringify(data));
                    let totalExpense = 0;
                    let totalBill = 0;
                    let totalCredit = 0;
                    let totalPO = 0;

                    for(let i=0; i<data.tbillreport.length; i++){
                        let orderType = data.tbillreport[i].Type;
                        totalExpense += Number(data.tbillreport[i]['Total Amount (Inc)']);
                        if(data.tbillreport[i].Type == "Credit"){
                            totCreditCount ++;
                            totalCredit += Number(data.tbillreport[i]['Total Amount (Inc)']);

                        }

                        if(data.tbillreport[i].Type == "Bill"){
                            totBillCount ++;
                            totalBill += Number(data.tbillreport[i]['Total Amount (Inc)']);
                        }

                        if(data.tbillreport[i].Type == "Purchase Order"){
                            totPOCount ++;
                            orderType = "PO";
                            totalPO += Number(data.tbillreport[i]['Total Amount (Inc)']);
                        }
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Ex)'])|| 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Tax']) || 0.00;
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Inc)'])|| 0.00;
                        let amountPaidCalc = data.tbillreport[i]['Total Amount (Inc)'] - data.tbillreport[i].Balance;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(amountPaidCalc)|| 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance)|| 0.00;
                        var dataList = {
                            id: data.tbillreport[i].PurchaseOrderID || '',
                            employee:data.tbillreport[i].Contact || '',
                            sortdate: data.tbillreport[i].OrderDate !=''? moment(data.tbillreport[i].OrderDate).format("YYYY/MM/DD"): data.tbillreport[i].OrderDate,
                            orderdate: data.tbillreport[i].OrderDate !=''? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY"): data.tbillreport[i].OrderDate,
                            suppliername: data.tbillreport[i].Company || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            // orderstatus: data.tbillreport[i].OrderStatus || '',
                            type: orderType || '',
                            custfield1: data.tbillreport[i].Phone || '',
                            custfield2: data.tbillreport[i].InvoiceNumber || '',
                            comments: data.tbillreport[i].Comments || '',
                        };
                        if(data.tbillreport[i].Deleted === false){
                            dataTableList.push(dataList);
                            if(data.tbillreport[i].Balance != 0){
                                if(data.tbillreport[i].Type == 'Purchase Order'){
                                    totAmount += Number(data.tbillreport[i].Balance);
                                }
                                if(data.tbillreport[i].Type == 'Bill'){
                                    totAmountBill += Number(data.tbillreport[i].Balance);
                                }
                                if(data.tbillreport[i].Type == 'Credit'){
                                    totAmountCredit += Number(data.tbillreport[i].Balance);
                                }
                            }
                        }
                        $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
                        $('.billAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountBill));
                        $('.creditAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountCredit));
                        // splashArray.push(dataList);
                        //}
                    }

                    var totalPerc = Math.abs(totalCredit)+Math.abs(totalBill)+Math.abs(totalPO);

                    var xwidth = (Math.abs(totalCredit)/totalPerc)*100;
                    var ywidth = (Math.abs(totalBill)/totalPerc)*100;
                    var zwidth = (Math.abs(totalPO)/totalPerc)*100;


                    templateObject.creditpercTotal.set(Math.round(xwidth));
                    templateObject.billpercTotal.set(Math.round(ywidth));
                    templateObject.popercTotal.set(Math.round(zwidth));



                    templateObject.datatablerecords.set(dataTableList);
                    $('.spExpenseTotal').text(utilityService.modifynegativeCurrencyFormat(totalExpense));

                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblPurchaseOverview', function(error, result){
                            if(error){

                            }else{
                                if(result){
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

                                        if(hiddenColumn == true){

                                            $("."+columnClass+"").addClass('hiddenColumn');
                                            $("."+columnClass+"").removeClass('showColumn');
                                        }else if(hiddenColumn == false){
                                            $("."+columnClass+"").removeClass('hiddenColumn');
                                            $("."+columnClass+"").addClass('showColumn');
                                        }

                                    }
                                }

                            }
                        });

                        function MakeNegative() {
                            $('td').each(function(){
                                if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
                            });
                        };

                        var myChart = new Chart(ctx, {
                            type: 'pie',
                            data: {
                                labels: [
                                    "Credit",
                                    "Bill",
                                    "Purchase Order"
                                ],
                                datasets: [
                                    {
                                        "label":"Credit",
                                        "backgroundColor":[
                                            "#e74a3b",
                                            "#f6c23e",
                                            "#1cc88a",
                                            "#36b9cc"
                                        ],
                                        "borderColor":[
                                            "#ffffff",
                                            "#ffffff",
                                            "#ffffff",
                                            "#ffffff"
                                        ],
                                        "data":[
                                            totCreditCount,
                                            totBillCount,
                                            totPOCount
                                        ]
                                    }
                                ]
                            },
                            options: {
                                "maintainAspectRatio":true,
                                "legend":{
                                    "display":true,
                                    "position":"right",
                                    "reverse":false
                                },
                                "title":{
                                    "display":false
                                }
                            }
                        });
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }
                    // $('#tblPurchaseOverview').DataTable().destroy();
                    // $('#tblPurchaseOverview tbody').empty();
                    setTimeout(function () {
                        $('.fullScreenSpin').css('display','none');

                        //$.fn.dataTable.moment('DD/MM/YY');
                        $('#tblPurchaseOverview').DataTable({
                            columnDefs: [
                                {type: 'date', targets: 0}
                            ],
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Purchase Overview List - "+ moment().format(),
                                    orientation:'portrait',
                                    exportOptions: {
                                        columns: ':visible',
                                        format: {
                                            body: function ( data, row, column ) {
                                                if(data.includes("</span>")){
                                                    var res = data.split("</span>");
                                                    data = res[1];
                                                }

                                                return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                            }
                                        }
                                    }
                                },{
                                    extend: 'print',
                                    download: 'open',
                                    className: "btntabletopdf hiddenColumn",
                                    text: '',
                                    title: 'Purchase Overview',
                                    filename: "Purchase Overview List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    }
                                }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: 25,
                          "bLengthChange": false,
                            lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ],[ 2, "desc" ]],
                            action: function () {
                                $('#tblPurchaseOverview').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },

                        }).on('page', function () {

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        }).on('column-reorder', function () {

                        });
                        $('.fullScreenSpin').css('display','none');
                        $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    }, 0);

                    var columns = $('#tblPurchaseOverview th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i,v) {
                        if(v.hidden == false){
                            columVisible =  true;
                        }
                        if((v.className.includes("hiddenColumn"))){
                            columVisible = false;
                        }
                        sWidth = v.style.width.replace('px', "");

                        let datatablerecordObj = {
                            sTitle: v.innerText || '',
                            sWidth: sWidth || '',
                            sIndex: v.cellIndex || '',
                            sVisible: columVisible || false,
                            sClass: v.className || ''
                        };
                        tableHeaderList.push(datatablerecordObj);
                    });
                    templateObject.tableheaderrecords.set(tableHeaderList);
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                    $('#tblPurchaseOverview tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        var transactiontype = $(event.target).closest("tr").find(".colType").text();
                        if((listData) && (transactiontype)){
                            if(transactiontype === 'Purchase Order' ){
                                Router.go('/purchaseordercard?id=' + listData);
                            }else if(transactiontype === 'Bill'){
                                Router.go('/billcard?id=' + listData);
                            }else if(transactiontype === 'Credit'){
                                Router.go('/creditcard?id=' + listData);
                            }else if(transactiontype === 'PO'){
                                Router.go('/purchaseordercard?id=' + listData);
                            }else{
                                //Router.go('/purchaseordercard?id=' + listData);
                            }

                        }

                        // if(listData){
                        //   Router.go('/purchaseordercard?id=' + listData);
                        // }
                    });

                    let filterData = _.filter(data.tbillreport, function (data) {
                        return data.Company
                    });

                    let graphData = _.orderBy(filterData, 'OrderDate');

                    let daysDataArray = [];
                    let currentDateNow = new Date();


                    let initialData = _.filter(graphData, obj => (moment(obj.OrderDate).format("YYYY-MM-DD") === moment(currentDateNow).format("YYYY-MM-DD")));
                    let groupData = _.omit(_.groupBy(initialData, 'OrderDate'), ['']);


                }).catch(function (err) {
                  var myChart = new Chart(ctx, {
                      type: 'pie',
                      data: {
                          labels: [
                              "Credit",
                              "Bill",
                              "Purchase Order"
                          ],
                          datasets: [
                              {
                                  "label":"Credit",
                                  "backgroundColor":[
                                      "#e74a3b",
                                      "#f6c23e",
                                      "#1cc88a",
                                      "#36b9cc"
                                  ],
                                  "borderColor":[
                                      "#ffffff",
                                      "#ffffff",
                                      "#ffffff",
                                      "#ffffff"
                                  ],
                                  "data":[
                                      "7",
                                      "20",
                                      "73"
                                  ]
                              }
                          ]
                      },
                      options: {
                          "maintainAspectRatio":true,
                          "legend":{
                              "display":true,
                              "position":"right",
                              "reverse":false
                          },
                          "title":{
                              "display":false
                          }
                      }
                  });
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tbillreport;
                let lineItems = [];
                let lineItemObj = {};
                if(data.Params.IgnoreDates == true){
                  $('#dateFrom').attr('readonly', true);
                  $('#dateTo').attr('readonly', true);
                }else{

                  $("#dateFrom").val(data.Params.DateFrom !=''? moment(data.Params.DateFrom).format("DD/MM/YYYY"): data.Params.DateFrom);
                  $("#dateTo").val(data.Params.DateTo !=''? moment(data.Params.DateTo).format("DD/MM/YYYY"): data.Params.DateTo);
                }
                let totalExpense = 0;
                let totalBill = 0;
                let totalCredit = 0;
                let totalPO = 0;
                $('.fullScreenSpin').css('display','none');
                for(let i=0; i<useData.length; i++){
                    totalExpense += Number(useData[i]['Total Amount (Inc)']);
                    let orderType = useData[i].Type;
                    if(useData[i].Type == "Credit"){
                        totCreditCount ++;
                        totalCredit += Number(useData[i]['Total Amount (Inc)']);

                    }

                    if(useData[i].Type == "Bill"){
                        totBillCount ++;
                        totalBill += Number(useData[i]['Total Amount (Inc)']);
                    }

                    if(useData[i].Type == "Purchase Order"){
                        totPOCount ++;
                        orderType = "PO";
                        totalPO += Number(useData[i]['Total Amount (Inc)']);
                    }
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(useData[i]['Total Amount (Ex)'])|| 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(useData[i]['Total Tax']) || 0.00;
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(useData[i]['Total Amount (Inc)'])|| 0.00;
                    let amountPaidCalc = useData[i]['Total Amount (Inc)'] - useData[i].Balance;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(amountPaidCalc)|| 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(useData[i].Balance)|| 0.00;
                    var dataList = {
                        id: useData[i].PurchaseOrderID || '',
                        employee:useData[i].Contact || '',
                        sortdate: useData[i].OrderDate !=''? moment(useData[i].OrderDate).format("YYYY/MM/DD"): useData[i].OrderDate,
                        orderdate: useData[i].OrderDate !=''? moment(useData[i].OrderDate).format("DD/MM/YYYY"): useData[i].OrderDate,
                        suppliername: useData[i].Company || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        // orderstatus: useData[i].OrderStatus || '',
                        type: orderType || '',
                        custfield1: useData[i].Phone || '',
                        custfield2: useData[i].InvoiceNumber || '',
                        comments: useData[i].Comments || '',
                    };
                    if(useData[i].Deleted === false){
                        dataTableList.push(dataList);
                        if(useData[i].Balance != 0){
                            if(useData[i].Type == 'Purchase Order'){
                                totAmount += Number(useData[i].Balance);
                            }

                            if(useData[i].Type == 'Bill'){
                                totAmountBill += Number(useData[i].Balance);
                            }

                            if(useData[i].Type == 'Credit'){
                                totAmountCredit += Number(useData[i].Balance);
                            }
                        }
                    }
                    $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
                    $('.billAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountBill));
                    $('.creditAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountCredit));
                    // splashArray.push(dataList);
                    //}
                }

                var totalPerc = Math.abs(totalCredit)+Math.abs(totalBill)+Math.abs(totalPO);

                var xwidth = (Math.abs(totalCredit)/totalPerc)*100;
                var ywidth = (Math.abs(totalBill)/totalPerc)*100;
                var zwidth = (Math.abs(totalPO)/totalPerc)*100;


                templateObject.creditpercTotal.set(Math.round(xwidth));
                templateObject.billpercTotal.set(Math.round(ywidth));
                templateObject.popercTotal.set(Math.round(zwidth));



                templateObject.datatablerecords.set(dataTableList);
                $('.spExpenseTotal').text(utilityService.modifynegativeCurrencyFormat(totalExpense));

                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblPurchaseOverview', function(error, result){
                        if(error){

                        }else{
                            if(result){
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if(hiddenColumn == true){

                                        $("."+columnClass+"").addClass('hiddenColumn');
                                        $("."+columnClass+"").removeClass('showColumn');
                                    }else if(hiddenColumn == false){
                                        $("."+columnClass+"").removeClass('hiddenColumn');
                                        $("."+columnClass+"").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });

                    function MakeNegative() {
                        $('td').each(function(){
                            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
                        });
                    };


                    var myChart = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: [
                                "Credit",
                                "Bill",
                                "Purchase Order"
                            ],
                            datasets: [
                                {
                                    "label":"Credit",
                                    "backgroundColor":[
                                        "#e74a3b",
                                        "#f6c23e",
                                        "#1cc88a",
                                        "#36b9cc"
                                    ],
                                    "borderColor":[
                                        "#ffffff",
                                        "#ffffff",
                                        "#ffffff",
                                        "#ffffff"
                                    ],
                                    "data":[
                                        totCreditCount,
                                        totBillCount,
                                        totPOCount
                                    ]
                                }
                            ]
                        },
                        options: {
                            "maintainAspectRatio":true,
                            "legend":{
                                "display":true,
                                "position":"right",
                                "reverse":false
                            },
                            "title":{
                                "display":false
                            }
                        }
                    });

                    setTimeout(function () {
                        MakeNegative();

                    }, 100);
                }
                // $('#tblPurchaseOverview').DataTable().destroy();
                // $('#tblPurchaseOverview tbody').empty();
                setTimeout(function () {
                    $('.fullScreenSpin').css('display','none');

                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblPurchaseOverview').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Purchase Overview List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Purchase Overview',
                                filename: "Purchase Overview List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: 25,
                      "bLengthChange": false,
                        lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblPurchaseOverview').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function () {

                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }).on('column-reorder', function () {

                    });
                    $('.fullScreenSpin').css('display','none');
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                }, 0);

                var columns = $('#tblPurchaseOverview th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i,v) {
                    if(v.hidden == false){
                        columVisible =  true;
                    }
                    if((v.className.includes("hiddenColumn"))){
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblPurchaseOverview tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var transactiontype = $(event.target).closest("tr").find(".colType").text();
                    if((listData) && (transactiontype)){
                        if(transactiontype === 'Purchase Order' ){
                            Router.go('/purchaseordercard?id=' + listData);
                        }else if(transactiontype === 'Bill'){
                            Router.go('/billcard?id=' + listData);
                        }else if(transactiontype === 'Credit'){
                            Router.go('/creditcard?id=' + listData);
                        }else if(transactiontype === 'PO'){
                            Router.go('/purchaseordercard?id=' + listData);
                        }else{
                            //Router.go('/purchaseordercard?id=' + listData);
                        }

                    }

                    // if(listData){
                    //   Router.go('/purchaseordercard?id=' + listData);
                    // }
                });

                let filterData = _.filter(useData, function (data) {
                    return data.Company
                });

                let graphData = _.orderBy(filterData, 'OrderDate');

                let daysDataArray = [];
                let currentDateNow = new Date();


                let initialData = _.filter(graphData, obj => (moment(obj.OrderDate).format("YYYY-MM-DD") === moment(currentDateNow).format("YYYY-MM-DD")));
                let groupData = _.omit(_.groupBy(initialData, 'OrderDate'), ['']);

            }
        }).catch(function (err) {
            sideBarService.getAllPurchaseOrderListAll(prevMonth11Date,toDate, false).then(function (data) {
              addVS1Data('TbillReport',JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};

                let totalExpense = 0;
                let totalBill = 0;
                let totalCredit = 0;
                let totalPO = 0;

                for(let i=0; i<data.tbillreport.length; i++){
                    let orderType = data.tbillreport[i].Type;
                    totalExpense += Number(data.tbillreport[i]['Total Amount (Inc)']);
                    if(data.tbillreport[i].Type == "Credit"){
                        totCreditCount ++;
                        totalCredit += Number(data.tbillreport[i]['Total Amount (Inc)']);

                    }

                    if(data.tbillreport[i].Type == "Bill"){
                        totBillCount ++;
                        totalBill += Number(data.tbillreport[i]['Total Amount (Inc)']);
                    }

                    if(data.tbillreport[i].Type == "Purchase Order"){
                        totPOCount ++;
                        orderType = "PO";
                        totalPO += Number(data.tbillreport[i]['Total Amount (Inc)']);
                    }
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Ex)'])|| 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Tax']) || 0.00;
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Inc)'])|| 0.00;
                    let amountPaidCalc = data.tbillreport[i]['Total Amount (Inc)'] - data.tbillreport[i].Balance;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(amountPaidCalc)|| 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance)|| 0.00;
                    var dataList = {
                        id: data.tbillreport[i].PurchaseOrderID || '',
                        employee:data.tbillreport[i].Contact || '',
                        sortdate: data.tbillreport[i].OrderDate !=''? moment(data.tbillreport[i].OrderDate).format("YYYY/MM/DD"): data.tbillreport[i].OrderDate,
                        orderdate: data.tbillreport[i].OrderDate !=''? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY"): data.tbillreport[i].OrderDate,
                        suppliername: data.tbillreport[i].Company || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        // orderstatus: data.tbillreport[i].OrderStatus || '',
                        type: orderType || '',
                        custfield1: data.tbillreport[i].Phone || '',
                        custfield2: data.tbillreport[i].InvoiceNumber || '',
                        comments: data.tbillreport[i].Comments || '',
                    };
                    if(data.tbillreport[i].Deleted === false){
                        dataTableList.push(dataList);
                        if(data.tbillreport[i].Balance != 0){
                            if(data.tbillreport[i].Type == 'Purchase Order'){
                                totAmount += Number(data.tbillreport[i].Balance);
                            }
                            if(data.tbillreport[i].Type == 'Bill'){
                                totAmountBill += Number(data.tbillreport[i].Balance);
                            }
                            if(data.tbillreport[i].Type == 'Credit'){
                                totAmountCredit += Number(data.tbillreport[i].Balance);
                            }
                        }
                    }
                    $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
                    $('.billAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountBill));
                    $('.creditAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountCredit));
                    // splashArray.push(dataList);
                    //}
                }

                var totalPerc = Math.abs(totalCredit)+Math.abs(totalBill)+Math.abs(totalPO);

                var xwidth = (Math.abs(totalCredit)/totalPerc)*100;
                var ywidth = (Math.abs(totalBill)/totalPerc)*100;
                var zwidth = (Math.abs(totalPO)/totalPerc)*100;


                templateObject.creditpercTotal.set(Math.round(xwidth));
                templateObject.billpercTotal.set(Math.round(ywidth));
                templateObject.popercTotal.set(Math.round(zwidth));



                templateObject.datatablerecords.set(dataTableList);
                $('.spExpenseTotal').text(utilityService.modifynegativeCurrencyFormat(totalExpense));

                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblPurchaseOverview', function(error, result){
                        if(error){

                        }else{
                            if(result){
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if(hiddenColumn == true){

                                        $("."+columnClass+"").addClass('hiddenColumn');
                                        $("."+columnClass+"").removeClass('showColumn');
                                    }else if(hiddenColumn == false){
                                        $("."+columnClass+"").removeClass('hiddenColumn');
                                        $("."+columnClass+"").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });

                    function MakeNegative() {
                        $('td').each(function(){
                            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
                        });
                    };

                    var myChart = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            labels: [
                                "Credit",
                                "Bill",
                                "Purchase Order"
                            ],
                            datasets: [
                                {
                                    "label":"Credit",
                                    "backgroundColor":[
                                        "#e74a3b",
                                        "#f6c23e",
                                        "#1cc88a",
                                        "#36b9cc"
                                    ],
                                    "borderColor":[
                                        "#ffffff",
                                        "#ffffff",
                                        "#ffffff",
                                        "#ffffff"
                                    ],
                                    "data":[
                                        totCreditCount,
                                        totBillCount,
                                        totPOCount
                                    ]
                                }
                            ]
                        },
                        options: {
                            "maintainAspectRatio":true,
                            "legend":{
                                "display":true,
                                "position":"right",
                                "reverse":false
                            },
                            "title":{
                                "display":false
                            }
                        }
                    });
                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }
                // $('#tblPurchaseOverview').DataTable().destroy();
                // $('#tblPurchaseOverview tbody').empty();
                setTimeout(function () {
                    $('.fullScreenSpin').css('display','none');

                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblPurchaseOverview').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Purchase Overview List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function ( data, row, column ) {
                                            if(data.includes("</span>")){
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, ""): data;

                                        }
                                    }
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Purchase Overview',
                                filename: "Purchase Overview List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: 25,
                      "bLengthChange": false,
                        lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblPurchaseOverview').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },

                    }).on('page', function () {

                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }).on('column-reorder', function () {

                    });
                    $('.fullScreenSpin').css('display','none');
                    $('div.dataTables_filter input').addClass('form-control form-control-sm');
                }, 0);

                var columns = $('#tblPurchaseOverview th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i,v) {
                    if(v.hidden == false){
                        columVisible =  true;
                    }
                    if((v.className.includes("hiddenColumn"))){
                        columVisible = false;
                    }
                    sWidth = v.style.width.replace('px', "");

                    let datatablerecordObj = {
                        sTitle: v.innerText || '',
                        sWidth: sWidth || '',
                        sIndex: v.cellIndex || '',
                        sVisible: columVisible || false,
                        sClass: v.className || ''
                    };
                    tableHeaderList.push(datatablerecordObj);
                });
                templateObject.tableheaderrecords.set(tableHeaderList);
                $('div.dataTables_filter input').addClass('form-control form-control-sm');
                $('#tblPurchaseOverview tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var transactiontype = $(event.target).closest("tr").find(".colType").text();
                    if((listData) && (transactiontype)){
                        if(transactiontype === 'Purchase Order' ){
                            Router.go('/purchaseordercard?id=' + listData);
                        }else if(transactiontype === 'Bill'){
                            Router.go('/billcard?id=' + listData);
                        }else if(transactiontype === 'Credit'){
                            Router.go('/creditcard?id=' + listData);
                        }else if(transactiontype === 'PO'){
                            Router.go('/purchaseordercard?id=' + listData);
                        }else{
                            //Router.go('/purchaseordercard?id=' + listData);
                        }

                    }

                    // if(listData){
                    //   Router.go('/purchaseordercard?id=' + listData);
                    // }
                });

                let filterData = _.filter(data.tbillreport, function (data) {
                    return data.Company
                });

                let graphData = _.orderBy(filterData, 'OrderDate');

                let daysDataArray = [];
                let currentDateNow = new Date();


                let initialData = _.filter(graphData, obj => (moment(obj.OrderDate).format("YYYY-MM-DD") === moment(currentDateNow).format("YYYY-MM-DD")));
                let groupData = _.omit(_.groupBy(initialData, 'OrderDate'), ['']);


            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.getAllPurchaseOrderAll();
    templateObject.getAllFilterPurchasesData = function (fromDate,toDate, ignoreDate) {
      sideBarService.getAllPurchaseOrderListAll(fromDate,toDate, ignoreDate).then(function (data) {
        addVS1Data('TbillReport',JSON.stringify(data)).then(function (datareturn) {
            window.open('/purchasesoverview?toDate=' + toDate + '&fromDate=' + fromDate + '&ignoredate='+ignoreDate,'_self');
        }).catch(function (err) {
          location.reload();
        });
      }).catch(function (err) {
        var myChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [
                    "Credit",
                    "Bill",
                    "Purchase Order"
                ],
                datasets: [
                    {
                        "label":"Credit",
                        "backgroundColor":[
                            "#e74a3b",
                            "#f6c23e",
                            "#1cc88a",
                            "#36b9cc"
                        ],
                        "borderColor":[
                            "#ffffff",
                            "#ffffff",
                            "#ffffff",
                            "#ffffff"
                        ],
                        "data":[
                            "7",
                            "20",
                            "73"
                        ]
                    }
                ]
            },
            options: {
                "maintainAspectRatio":true,
                "legend":{
                    "display":true,
                    "position":"right",
                    "reverse":false
                },
                "title":{
                    "display":false
                }
            }
        });
          $('.fullScreenSpin').css('display','none');
          // Meteor._reload.reload();
      });
    }

    let urlParametersDateFrom = Router.current().params.query.fromDate;
    let urlParametersDateTo = Router.current().params.query.toDate;
    let urlParametersIgnoreDate = Router.current().params.query.ignoredate;
    if(urlParametersDateFrom){
      if(urlParametersIgnoreDate == true){
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
      }else{

        $("#dateFrom").val(urlParametersDateFrom !=''? moment(urlParametersDateFrom).format("DD/MM/YYYY"): urlParametersDateFrom);
        $("#dateTo").val(urlParametersDateTo !=''? moment(urlParametersDateTo).format("DD/MM/YYYY"): urlParametersDateTo);
      }
    }
});

Template.purchasesoverview.events({
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        let templateObject = Template.instance();
      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = currentBeginDate.getMonth();
      let fromDateDay = currentBeginDate.getDate();
      if(currentBeginDate.getMonth() < 10){
          fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
      }else{
        fromDateMonth = (currentBeginDate.getMonth()+1);
      }

      if(currentBeginDate.getDate() < 10){
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay+1);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getAllPurchaseOrderListAll(prevMonth11Date,toDate, false).then(function(data) {
            addVS1Data('TbillReport',JSON.stringify(data)).then(function (datareturn) {
                window.open('/purchasesoverview','_self');
            }).catch(function (err) {
                window.open('/purchasesoverview','_self');
            });
        }).catch(function(err) {
            window.open('/purchasesoverview','_self');
        });
    },
    'change #dateTo': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
          templateObject.getAllFilterPurchasesData(formatDateFrom,formatDateTo, false);
        }

    },
    'change #dateFrom': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterPurchasesData(formatDateFrom,formatDateTo, false);
        }

    },
    'click #lastMonth': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = currentDate.getMonth();
        let fromDateDay = currentDate.getDate();
        if (currentDate.getMonth() < 10) {
            fromDateMonth = "0" + currentDate.getMonth();
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + currentDate.getFullYear();

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = currentDate2.getFullYear() + "-" + (fromDateMonth) + "-" + fromDateDay;
        templateObject.getAllFilterPurchasesData(getDateFrom,getLoadDate, false);
    },
    'click #lastQuarter': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
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


        $("#dateFrom").val(lastQuarterStartDateFormat);
        $("#dateTo").val(lastQuarterEndDateFormat);

        let fromDateMonth = getQuarter(currentDate);
        var quarterMonth = getQuarter(currentDate);
        let fromDateDay = currentDate.getDate();

        var getLoadDate = moment(lastQuarterEndDate).format("YYYY-MM-DD");
        let getDateFrom = moment(lastQuarterStartDateFormat).format("YYYY-MM-DD");
        templateObject.getAllFilterPurchasesData(getDateFrom,getLoadDate, false);
    },
    'click #last12Months': function () {
        localStorage.setItem('VS1AgedPayables_Report', '');
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");

        let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
        let fromDateDay = currentDate.getDate();
        if (currentDate.getMonth() < 10) {
            fromDateMonth = "0" + currentDate.getMonth();
        }
        if (currentDate.getDate() < 10) {
            fromDateDay = "0" + currentDate.getDate();
        }

        var fromDate = fromDateDay + "/" + (fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() - 1);
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if (currentDate2.getMonth() < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterPurchasesData(getDateFrom,getLoadDate, false);

    },
    'click #ignoreDate': function () {
        //localStorage.setItem('VS1AgedPayables_Report', '');
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterPurchasesData('', '', true);
    },
    'click #newPurchaseorder' : function(event){
        Router.go('/purchaseordercard');
    },
    'click .purchaseorderList' : function(event){
        Router.go('/purchaseorderlist');
    },
    'click .purchaseorderListBO' : function(event){
        Router.go('/purchaseorderlistBO');
    },
    'click #newBill' : function(event){
        Router.go('/billcard');
    },
    'click .billList' : function(event){
        Router.go('/billlist');
    },
    'click #newCredit' : function(event){
        Router.go('/creditcard');
    },
    'click .creditList' : function(event){
        Router.go('/creditlist');
    },
    'click .newpo' : function(event){
        Router.go('/purchaseordercard');
    },
    'click .cardBills' : function(event){
        Router.go('/billlist');
    },
    'click .cardCredit' : function(event){
        Router.go('/creditlist');
    },
    'click .cardOutPO' : function(event){
        Router.go('/agedpayables');
    },
    'click .newBill' : function(event){
        //Router.go('/creditcard');
    },
    'click .newCredit' : function(event){
        //Router.go('/creditcard');
    },
    'click .allList' : function(event){
        Router.go('/purchasesoverview?id=all');
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblPurchaseOverview th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function(i,v) {
            let className = v.classList;
            let replaceClass = className[1];

            if(v.innerText == columnDataValue){
                if($(event.target).is(':checked')){
                    $("."+replaceClass+"").css('display','table-cell');
                    $("."+replaceClass+"").css('padding','.75rem');
                    $("."+replaceClass+"").css('vertical-align','top');
                }else{
                    $("."+replaceClass+"").css('display','none');
                }
            }
        });
    },
    'click .resetTable' : function(event){
        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblPurchaseOverview'});
                if (checkPrefDetails) {
                    CloudPreference.remove({_id:checkPrefDetails._id}, function(err, idTag) {
                        if (err) {

                        }else{
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable' : function(event){
        let lineItems = [];
        //let datatable =$('#tblPurchaseOverview').DataTable();
        $('.columnSettings').each(function (index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text()||'';
            var colWidth = $tblrow.find(".custom-range").val()||0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate")||'';
            var colHidden = false;
            if($tblrow.find(".custom-control-input").is(':checked')){
                colHidden = false;
            }else{
                colHidden = true;
            }
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            }

            lineItems.push(lineItemObj);
        });
        //datatable.state.save();

        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblPurchaseOverview'});
                if (checkPrefDetails) {
                    CloudPreference.update({_id: checkPrefDetails._id},{$set: { userid: clientID,username:clientUsername,useremail:clientEmail,
                                                                               PrefGroup:'salesform',PrefName:'tblPurchaseOverview',published:true,
                                                                               customFields:lineItems,
                                                                               updatedAt: new Date() }}, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                }else{
                    CloudPreference.insert({ userid: clientID,username:clientUsername,useremail:clientEmail,
                                            PrefGroup:'salesform',PrefName:'tblPurchaseOverview',published:true,
                                            customFields:lineItems,
                                            createdAt: new Date() }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });

                }
            }
        }

        //Meteor._reload.reload();
    },
    'blur .divcolumn' : function(event){
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblPurchaseOverview').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblPurchaseOverview th');
        $.each(datable, function(i,v) {

            if(v.innerText == columnDataValue){
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("."+replaceClass+"").css('width',range+'px');

            }
        });

    },
    'click .btnOpenSettings' : function(event){
        let templateObject = Template.instance();
        var columns = $('#tblPurchaseOverview th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i,v) {
            if(v.hidden == false){
                columVisible =  true;
            }
            if((v.className.includes("hiddenColumn"))){
                columVisible = false;
            }
            sWidth = v.style.width.replace('px', "");

            let datatablerecordObj = {
                sTitle: v.innerText || '',
                sWidth: sWidth || '',
                sIndex: v.cellIndex || '',
                sVisible: columVisible || false,
                sClass: v.className || ''
            };
            tableHeaderList.push(datatablerecordObj);
        });

        templateObject.tableheaderrecords.set(tableHeaderList);
    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblPurchaseOverview_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .printConfirm' : function(event){

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblPurchaseOverview_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    }


});
Template.purchasesoverview.helpers({
    datatablerecords : () => {

        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.orderdate == 'NA') {
                return 1;
            }
            else if (b.orderdate == 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    purchasesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblPurchaseOverview'});
    },
    creditpercTotal: () =>{
        return Template.instance().creditpercTotal.get() || 0;
    }
    ,
    billpercTotal: () =>{
        return Template.instance().billpercTotal.get() || 0;
    }
    ,
    popercTotal: () =>{
        return Template.instance().popercTotal.get() || 0;
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});
