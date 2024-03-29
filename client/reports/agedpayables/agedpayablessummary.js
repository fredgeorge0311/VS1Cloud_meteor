import {ReportService} from "../report-service";
import 'jQuery.print/jQuery.print.js';
import {UtilityService} from "../../utility-service";

let reportService = new ReportService();
let utilityService = new UtilityService();
Template.agedpayablessummary.onCreated(()=>{
const templateObject = Template.instance();
templateObject.records = new ReactiveVar([]);
templateObject.reportrecords = new ReactiveVar([]);
templateObject.grandrecords = new ReactiveVar();
templateObject.dateAsAt = new ReactiveVar();
templateObject.deptrecords = new ReactiveVar();
});

Template.agedpayablessummary.onRendered(()=>{
  $('.fullScreenSpin').css('display','inline-block');
  const templateObject = Template.instance();
  let utilityService = new UtilityService();
  let salesOrderTable;
  var splashArray = new Array();
  var today = moment().format('DD/MM/YYYY');
  var currentDate = new Date();
  var begunDate = moment(currentDate).format("DD/MM/YYYY");
  let fromDateMonth = (currentDate.getMonth() + 1);
  let fromDateDay = currentDate.getDate();
  if((currentDate.getMonth()+1) < 10){
    fromDateMonth = "0" + (currentDate.getMonth()+1);
  }

  let imageData= (localStorage.getItem("Image"));
  if(imageData)
  {
      $('#uploadedImage').attr('src', imageData);
      $('#uploadedImage').attr('width','50%');
  }

  if(currentDate.getDate() < 10){
    fromDateDay = "0" + currentDate.getDate();
  }
  var fromDate =fromDateDay + "/" +(fromDateMonth) + "/" + currentDate.getFullYear();


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
      onChangeMonthYear: function(year, month, inst){
      // Set date to picker
      $(this).datepicker('setDate', new Date(year, inst.selectedMonth, inst.selectedDay));
      // Hide (close) the picker
      // $(this).datepicker('hide');
      // // Change ttrigger the on change function
      // $(this).trigger('change');
     }
  });

   $("#dateFrom").val(fromDate);
   $("#dateTo").val(begunDate);

    templateObject.getAgedPayableReports = function (dateFrom, dateTo, ignoreDate) {
      templateObject.records.set('');
      templateObject.grandrecords.set('');
      if(!localStorage.getItem('VS1AgedPayablesSummary_Report')){
        reportService.getAgedPayableDetailsSummaryData(dateFrom, dateTo, ignoreDate).then(function (data) {
       let totalRecord = [];
       let grandtotalRecord = [];

     if(data.tapreport.length){
       localStorage.setItem('VS1AgedPayablesSummary_Report', JSON.stringify(data)||'');
       let records = [];
       let reportrecords =[];
       let allRecords = [];
       let current = [];

       let totalNetAssets = 0;
       let GrandTotalLiability = 0;
       let GrandTotalAsset = 0;
       let incArr = [];
       let cogsArr = [];
       let expArr = [];
       let accountData = data.tapreport;
       let accountType = '';

       for (let i = 0; i < accountData.length; i++) {

         let amountdue = utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || 0;
         let current = utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || 0;
         let day30 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || 0;
         let day60 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || 0;
         let day90 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || 0;
         let dayabove90 = utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || 0;
         var dataList = {
           id: data.tapreport[i].PurchaseOrderID || '',
           contact:data.tapreport[i].Name || '',
           clientid:data.tapreport[i].ClientID || '',
           type: '',
           invoiceno: '',
           duedate:'',
           amountdue: amountdue || 0.00,
           current: current || 0.00,
           day30: day30 || 0.00,
           day60: day60 || 0.00,
           day90: day90 || 0.00,
           dayabove90: dayabove90 || 0.00
       };

       reportrecords.push(dataList);

         let recordObj = {};
       recordObj.Id = data.tapreport[i].PurchaseOrderID;
       recordObj.type = data.tapreport[i].Type;
       recordObj.SupplierName = data.tapreport[i].Name;
       recordObj.dataArr = [
           '',
           data.tapreport[i].Type,
           data.tapreport[i].PurchaseOrderID,
           // moment(data.tapreport[i].InvoiceDate).format("DD MMM YYYY") || '-',
           data.tapreport[i].DueDate !=''? moment(data.tapreport[i].DueDate).format("DD/MM/YYYY"): data.tapreport[i].DueDate,
           // data.tapreport[i].InvoiceNumber || '-',
           utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || '-',
           utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || '-',
           utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || '-',
           utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || '-',
           utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || '-',
           utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || '-',

           //
       ];

     //   if((data.tapreport[i].AmountDue != 0) || (data.tapreport[i].Current != 0)
     //   || (data.tapreport[i]["30Days"] != 0) || (data.tapreport[i]["60Days"] != 0)
     // || (data.tapreport[i]["90Days"] != 0) || (data.tapreport[i]["120Days"] != 0)){
         records.push(recordObj);
       //}



     }

     reportrecords = _.sortBy(reportrecords, 'contact');
     templateObject.reportrecords.set(reportrecords);
       records = _.sortBy(records, 'SupplierName');
     records = _.groupBy(records, 'SupplierName');
     for (let key in records) {
         let obj = [{key: key}, {data: records[key]}];
         allRecords.push(obj);
     }

     let iterator = 0;
   for (let i = 0; i < allRecords.length; i++) {
       let amountduetotal = 0;
       let Currenttotal = 0;
       let lessTnMonth = 0;
       let oneMonth = 0;
       let twoMonth = 0;
       let threeMonth = 0;
       let Older = 0;
       const currencyLength = Currency.length;
       for (let k = 0; k < allRecords[i][1].data.length; k++) {
           amountduetotal = amountduetotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[4]);
           Currenttotal = Currenttotal + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[5]);
           oneMonth = oneMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[6]);
           twoMonth = twoMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[7]);
           threeMonth = threeMonth + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[8]);
           Older = Older + utilityService.convertSubstringParseFloat(allRecords[i][1].data[k].dataArr[9]);
       }
       let val = [allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(amountduetotal), utilityService.modifynegativeCurrencyFormat(Currenttotal),
           utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
       current.push(val);

   }

//grandtotalRecord
let grandamountduetotal = 0;
let grandCurrenttotal = 0;
let grandlessTnMonth = 0;
let grandoneMonth = 0;
let grandtwoMonth = 0;
let grandthreeMonth = 0;
let grandOlder = 0;

 for (let n = 0; n < current.length; n++) {

     const grandcurrencyLength = Currency.length;

     //for (let m = 0; m < current[n].data.length; m++) {
          grandamountduetotal = grandamountduetotal + utilityService.convertSubstringParseFloat(current[n][4]);
          grandCurrenttotal = grandCurrenttotal + utilityService.convertSubstringParseFloat(current[n][5]);
         // grandlessTnMonth = grandlessTnMonth + utilityService.convertSubstringParseFloat(current[n][5]);
          grandoneMonth = grandoneMonth + utilityService.convertSubstringParseFloat(current[n][6]);
          grandtwoMonth = grandtwoMonth + utilityService.convertSubstringParseFloat(current[n][7]);
          grandthreeMonth = grandthreeMonth + utilityService.convertSubstringParseFloat(current[n][8]);
          grandOlder = grandOlder + utilityService.convertSubstringParseFloat(current[n][9]);
     //}
     // let val = ['Total ' + allRecords[i][0].key+'', '', '', '', utilityService.modifynegativeCurrencyFormat(Currenttotal), utilityService.modifynegativeCurrencyFormat(lessTnMonth),
     //     utilityService.modifynegativeCurrencyFormat(oneMonth), utilityService.modifynegativeCurrencyFormat(twoMonth), utilityService.modifynegativeCurrencyFormat(threeMonth), utilityService.modifynegativeCurrencyFormat(Older)];
     // current.push(val);

 }


 let grandval = ['Grand Total ', '', '','',
 utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
 // utilityService.modifynegativeCurrencyFormat(grandamountduetotal),
 utilityService.modifynegativeCurrencyFormat(grandCurrenttotal),
     utilityService.modifynegativeCurrencyFormat(grandoneMonth),
     utilityService.modifynegativeCurrencyFormat(grandtwoMonth),
     utilityService.modifynegativeCurrencyFormat(grandthreeMonth),
     utilityService.modifynegativeCurrencyFormat(grandOlder)];

   for (let key in records) {
       let dataArr = current[iterator]
       let obj = [{key: key}, {data: records[key]},{total:[{dataArr:dataArr}]}];
       totalRecord.push(obj);
       iterator += 1;
   }

     templateObject.records.set(totalRecord);
     templateObject.grandrecords.set(grandval);


     if(templateObject.records.get()){
       setTimeout(function () {
         $('td a').each(function(){
           if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
            });
        $('td').each(function(){
          if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
         });

         $('td').each(function(){

           let lineValue = $(this).first().text()[0];
           if(lineValue != undefined){
             if(lineValue.indexOf(Currency) >= 0) $(this).addClass('text-right')
           }

          });

          $('td').each(function(){
            if($(this).first().text().indexOf('-'+Currency) >= 0) $(this).addClass('text-right')
           });

           $('.fullScreenSpin').css('display','none');
       }, 100);
     }

     }else{
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
         $('.fullScreenSpin').css('display','none');
     }

     }).catch(function (err) {
       //Bert.alert('<strong>' + err + '</strong>!', 'danger');
         $('.fullScreenSpin').css('display','none');
     });
      }else{
         let data = JSON.parse(localStorage.getItem('VS1AgedPayablesSummary_Report'));
      }
    };

    var currentDate2 = new Date();
    var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    let getDateFrom = currentDate2.getFullYear() + "-" + (currentDate2.getMonth()) + "-" + currentDate2.getDate();
    //templateObject.getAgedPayableReports(getDateFrom,getLoadDate,false);
    $('.ignoreDate').trigger('click');
    templateObject.getDepartments = function(){
      reportService.getDepartment().then(function(data){
        for(let i in data.tdeptclass){

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

  Template.agedpayablessummary.events({
    'click #btnDetails': function() {
        FlowRouter.go('/agedpayables');
    },
    'change #dateTo':function(){
        let templateObject = Template.instance();
          $('.fullScreenSpin').css('display','inline-block');
          $('#dateFrom').attr('readonly', false);
          $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        templateObject.grandrecords.set('');
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth()+1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth()+1) + "-" + dateTo.getDate();

      //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth()+1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if(($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")){
          templateObject.getAgedPayableReports('','',true);
          templateObject.dateAsAt.set('Current Date');
        }else{
          templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
          templateObject.dateAsAt.set(formatDate);
        }
        },500);
    },
    'change #dateFrom':function(){
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display','inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        templateObject.records.set('');
        templateObject.grandrecords.set('');
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth()+1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth()+1) + "-" + dateTo.getDate();

        //templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth()+1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if(($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")){
          templateObject.getAgedPayableReports('','',true);
          templateObject.dateAsAt.set('Current Date');
        }else{
          templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
          templateObject.dateAsAt.set(formatDate);
        }
        },500);

    },
    'click .btnRefresh': function () {
      $('.fullScreenSpin').css('display','inline-block');
      localStorage.setItem('VS1AgedPayablesSummary_Report', '');
      Meteor._reload.reload();
    },
    'click td a':function (event) {
        let redirectid = $(event.target).closest('tr').attr('id');

        let transactiontype = $(event.target).closest('tr').attr('class');;

        if(redirectid && transactiontype){
          if(transactiontype === 'Bill' ){
            window.open('/billcard?id=' + redirectid,'_self');
          }else if(transactiontype === 'PO'){
            window.open('/purchaseordercard?id=' + redirectid,'_self');
          }else if(transactiontype === 'Credit'){
            window.open('/creditcard?id=' + redirectid,'_self');
          }else if(transactiontype === 'Supplier Payment'){
            window.open('/supplierpaymentcard?id=' + redirectid,'_self');
          }
        }
        // window.open('/balancetransactionlist?accountName=' + accountName+ '&toDate=' + toDate + '&fromDate=' + fromDate + '&isTabItem='+false,'_self');
    },
    'click .btnPrintReport':function (event) {

      let values = [];
      let basedOnTypeStorages = Object.keys(localStorage);
      basedOnTypeStorages = basedOnTypeStorages.filter((storage) => {
          let employeeId = storage.split('_')[2];
          return storage.includes('BasedOnType_') && employeeId == Session.get('mySessionEmployeeLoggedID')
      });
      let i = basedOnTypeStorages.length;
      if (i > 0) {
          while (i--) {
              values.push(localStorage.getItem(basedOnTypeStorages[i]));
          }
      }
      values.forEach(value => {
          let reportData = JSON.parse(value);
          reportData.HostURL = $(location).attr('protocal') ? $(location).attr('protocal') + "://" + $(location).attr('hostname') : 'http://' + $(location).attr('hostname');
          if (reportData.BasedOnType.includes("P")) {
              if (reportData.FormID == 1) {
                  let formIds = reportData.FormIDs.split(',');
                  if (formIds.includes("6")) {
                      reportData.FormID = 6;
                      Meteor.call('sendNormalEmail', reportData);
                  }
              } else {
                  if (reportData.FormID == 6)
                      Meteor.call('sendNormalEmail', reportData);
              }
          }
      });
      
        document.title = 'Aged Payables Summary Report';
      $(".printReport").print({
          title   :  document.title +" | Aged Payable | "+loggedCompany,
          noPrintSelector : ".addSummaryEditor",
      })
    },
'click .btnExportReport':function() {
  $('.fullScreenSpin').css('display', 'inline-block');    let utilityService = new UtilityService();
    let templateObject = Template.instance();
    var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    var dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth()+1) + "-" + dateFrom.getDate();
    let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth()+1) + "-" + dateTo.getDate();

    const filename = loggedCompany + '-Aged Payables Summary' + '.csv';
    utilityService.exportReportToCsvTable('tableExport', filename, 'csv');
    let rows = [];
    // reportService.getAgedPayableDetailsSummaryData(formatDateFrom,formatDateTo,false).then(function (data) {
    //     if(data.tapreport){
    //         rows[0] = ['Contact','Type', 'PO No.', 'Due Date', 'Amount Due', 'Currenct', '1 - 30 Days', '30 - 60 Days', '60 - 90 Days', '> 90 Days'];
    //         data.tapreport.forEach(function (e, i) {
    //             rows.push([
    //               data.tapreport[i].Name,
    //               '',
    //               '',
    //               '',
    //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i].AmountDue) || '-',
    //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i].Current) || '0.00',
    //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["30Days"]) || '0.00',
    //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["60Days"]) || '0.00',
    //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["90Days"]) || '0.00',
    //               utilityService.modifynegativeCurrencyFormat(data.tapreport[i]["120Days"]) || '0.00']);
    //         });
    //         setTimeout(function () {
    //             utilityService.exportReportToCsv(rows, filename, 'xls');
    //             $('.fullScreenSpin').css('display','none');
    //         }, 1000);
    //     }
    //
    // });
},
'click #lastMonth':function(){
    let templateObject = Template.instance();
    localStorage.setItem('VS1AgedPayablesSummary_Report', '');
    $('.fullScreenSpin').css('display','inline-block');
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
    templateObject.dateAsAt.set(fromDate);
    templateObject.getAgedPayableReports(getDateFrom,getLoadDate,false);

},
'click #lastQuarter':function(){
    let templateObject = Template.instance();
    localStorage.setItem('VS1AgedPayablesSummary_Report', '');
    $('.fullScreenSpin').css('display','inline-block');
    $('#dateFrom').attr('readonly', false);
    $('#dateTo').attr('readonly', false);
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");

    var begunDate = moment(currentDate).format("DD/MM/YYYY");
    function getQuarter(d) {
      d = d || new Date();
      var m = Math.floor(d.getMonth()/3) + 2;
      return m > 4? m - 4 : m;
    }

    var quarterAdjustment= (moment().month() % 3) + 1;
    var lastQuarterEndDate = moment().subtract({ months: quarterAdjustment }).endOf('month');
    var lastQuarterStartDate = lastQuarterEndDate.clone().subtract({ months: 2 }).startOf('month');

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
    templateObject.getAgedPayableReports(getDateFrom,getLoadDate,false);

},
'click #last12Months':function(){
  let templateObject = Template.instance();
  localStorage.setItem('VS1AgedPayablesSummary_Report', '');
  $('.fullScreenSpin').css('display','inline-block');
  $('#dateFrom').attr('readonly', false);
  $('#dateTo').attr('readonly', false);
  var currentDate = new Date();
  var begunDate = moment(currentDate).format("DD/MM/YYYY");

  let fromDateMonth = Math.floor(currentDate.getMonth()+1);
  let fromDateDay = currentDate.getDate();
  if((currentDate.getMonth()+1) < 10){
    fromDateMonth = "0" + (currentDate.getMonth()+1);
  }
  if(currentDate.getDate() < 10){
  fromDateDay = "0" + currentDate.getDate();
  }

  var fromDate =fromDateDay + "/" +(fromDateMonth) + "/" + Math.floor(currentDate.getFullYear() -1);
  templateObject.dateAsAt.set(begunDate);
  $("#dateFrom").val(fromDate);
  $("#dateTo").val(begunDate);

  var currentDate2 = new Date();
  var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
  let getDateFrom = Math.floor(currentDate2.getFullYear()-1) + "-" + Math.floor(currentDate2.getMonth() +1) + "-" + currentDate2.getDate() ;
  templateObject.getAgedPayableReports(getDateFrom,getLoadDate,false);


},
'click #ignoreDate':function(){
  let templateObject = Template.instance();
  localStorage.setItem('VS1AgedPayablesSummary_Report', '');
  $('.fullScreenSpin').css('display','inline-block');
  $('#dateFrom').attr('readonly', true);
  $('#dateTo').attr('readonly', true);
  templateObject.dateAsAt.set('Current Date');
  templateObject.getAgedPayableReports('','',true);

},
'keyup #myInputSearch':function(event){
  $('.table tbody tr').show();
  let searchItem = $(event.target).val();
  if(searchItem != ''){
    var value = searchItem.toLowerCase();
    $('.table tbody tr').each(function(){
     var found = 'false';
     $(this).each(function(){
          if($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0)
          {
               found = 'true';
          }
     });
     if(found == 'true')
     {
          $(this).show();
     }
     else
     {
          $(this).hide();
     }
});
  }else{
    $('.table tbody tr').show();
  }
},
'blur #myInputSearch':function(event){
  $('.table tbody tr').show();
  let searchItem = $(event.target).val();
  if(searchItem != ''){
    var value = searchItem.toLowerCase();
    $('.table tbody tr').each(function(){
     var found = 'false';
     $(this).each(function(){
          if($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0)
          {
               found = 'true';
          }
     });
     if(found == 'true')
     {
          $(this).show();
     }
     else
     {
          $(this).hide();
     }
});
  }else{
    $('.table tbody tr').show();
  }
}


  });
  Template.agedpayablessummary.helpers({
    records : () => {
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
    reportrecords : () => {
       return Template.instance().reportrecords.get();
    },

    grandrecords: () => {
       return Template.instance().grandrecords.get();
   },
    dateAsAt: () =>{
        return Template.instance().dateAsAt.get() || '-';
    },
    companyname: () =>{
        return loggedCompany;
    },
    deptrecords: () => {
        return Template.instance().deptrecords.get().sort(function(a, b){
          if (a.department == 'NA') {
        return 1;
            }
        else if (b.department == 'NA') {
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
      return (a.indexOf(b) >= 0 );
  });
