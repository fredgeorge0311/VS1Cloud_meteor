import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jquery-ui-dist/jquery-ui.css';
import 'jquery-editable-select';
import {Random} from 'meteor/random';
const _ = require('lodash');
let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.shippingdocket.onCreated(function(){
  const templateObject = Template.instance();
    templateObject.includeInvoiceAttachment = new ReactiveVar();
    templateObject.includeInvoiceAttachment.set(false);
    templateObject.includeDocketAttachment = new ReactiveVar();
    templateObject.includeDocketAttachment.set(false);

    templateObject.includeIsPrintInvoice = new ReactiveVar();
    templateObject.includeIsPrintInvoice.set(false);
    templateObject.includeIsPrintDocket = new ReactiveVar();
    templateObject.includeIsPrintDocket.set(false);
    templateObject.includeBothPrint = new ReactiveVar();
    templateObject.hasPrintPrint = new ReactiveVar();
    templateObject.record = new ReactiveVar({});
    templateObject.shippingrecord = new ReactiveVar({});
    templateObject.shipviarecords = new ReactiveVar();
});

Template.shippingdocket.onRendered(function() {
  var erpGet = erpDb();
var url = window.location.href;
var getsale_id = url.split('?id=');
var salesID = FlowRouter.current().queryParams.id;
$('.fullScreenSpin').css('display','inline-block');
const templateObject = Template.instance();
let printDeliveryDocket = Session.get('CloudPrintDeliveryDocket');
let printInvoice = Session.get('CloudPrintInvoice');
const records = [];
const viarecords = [];

templateObject.SendShippingDetails = function (printType) {
  var splashLineArray = new Array();
  $('.fullScreenSpin').css('display','inline-block');

  let lineItemsForm = [];
  let lineItemObjForm = {};

  $('#tblShippingDocket > tbody > tr').each(function() {
      var lineID = this.id;
      let tdproduct = $('#' + lineID + " .colProduct").text()||'';
      let tddescription = $('#' + lineID + " .colDescription").text()||'';
      let tdQty = $('#' + lineID + " .lineQty").val()||0;
      let tdLineID = $('#' + lineID + " .ID").text() ||0;
      let tdUOMQtyShipped = $('#' + lineID + " .UOMQtyShipped").text()||0;

      let tdLinePQA = $('#' + lineID + " .pqa").text()||'';



      if (tdproduct != "") {

              lineItemObjForm = {
                  type: "TInvoiceLine",
                  fields: {
                      ProductName: tdproduct || '',
                      ProductDescription: tddescription || '',
                      ID: parseInt(tdLineID) || 0,
                      PQA: JSON.parse(tdLinePQA) || '',
                      UOMQtyShipped: parseFloat(tdUOMQtyShipped) || 0
                  }
              };


          //lineItemsForm.push(lineItemObjForm);
          splashLineArray.push(lineItemObjForm);
      }
  });

var custName = $("#edtCustomerName").val();
var empName = Session.get('mySession');
var shipAdress = $('textarea[name="txaShipingInfo"]').val();
var connote = $('textarea[name="shipconnote"]').val();
var shipVia = $("#shipvia").val();
//alert(shipVia);
var d = new Date();

var month = d.getMonth()+1;
var day = d.getDate();

var outputDate = d.getFullYear() + '-' +
  (month<10 ? '0' : '') + month + '-' +
  (day<10 ? '0' : '') + day;

var objDetails = {
type:"TInvoice",
fields:
{
Comments:$('textarea[name="shipcomments"]').val(),
ID:parseInt($("#SalesId").val()),
CustomerName:custName,
ConNote:connote,
EmployeeName:empName,
SaleDate: outputDate,
Shipping : shipVia,
ShipToDesc:shipAdress,
ShipDate: outputDate,
Lines:splashLineArray
}
};
var erpGet = erpDb();
var oPost = new XMLHttpRequest();

oPost.open("POST",'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/' + erpGet.ERPInvoiceCard, true);
oPost.setRequestHeader("database",erpGet.ERPDatabase);
oPost.setRequestHeader("username",erpGet.ERPUsername);
oPost.setRequestHeader("password",erpGet.ERPPassword);
oPost.setRequestHeader("Accept", "application/json");
oPost.setRequestHeader("Accept", "application/html");
oPost.setRequestHeader("Content-type", "application/json");
//oPost.setRequestHeader("Content-type", "text/plain; charset=UTF-8");

var myString = JSON.stringify(objDetails);
//alert(myString);
oPost.send(myString);

//oPost.timeout = 30000;
oPost.onreadystatechange = function() {


if (oPost.readyState == 4 && oPost.status == 200) {
  var dataReturnRes = JSON.parse(oPost.responseText);
  var shippedID = dataReturnRes.fields.ID;


  if(printType === "InvoiceOnly"){
    templateObject.SendPrintInvoiceOnly();
  }else if(printType === "DeliveryDocketsOnly"){
    templateObject.SendPrintDeliveryDocketOnly();
  }else if (printType === "InvoiceANDDeliveryDocket"){
    templateObject.SendPrintInvoiceANDDeliveryDocket();
  }else{
    $('.fullScreenSpin').css('display','none');
  }

} else if(oPost.readyState == 4 && oPost.status == 403){
  //alert(oPost.status);
  $('.fullScreenSpin').css('display','none');
  Bert.defaults = {
  hideDelay: 5000,
  style: 'fixed-top',
  type: 'default'
    };
  Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
  DangerSound();
}else if(oPost.readyState == 4 && oPost.status == 406){
  //oPost.setRequestHeader("Access-Control-Expose-Headers", "Content-Type");
  $('.fullScreenSpin').css('display','none');
  Bert.defaults = {
  hideDelay: 5000,
  style: 'fixed-top',
  type: 'default'
    };
    //oPost.setRequestHeader("Content-Length", "1");
    var ErrorResponse = oPost.getResponseHeader('errormessage');
    var segError = ErrorResponse.split(':');
    //alert(segError[1]);
  if((segError[1]) == ' "Unable to lock object'){
    //alert(oPost.getAllResponseHeaders());
    Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>. Please close the invoice in ERP!', 'now-error');
  }else{
    Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'now-error');
  }

  DangerSound();
}else if(oPost.readyState == 4 && oPost.status == 409){
  $('.fullScreenSpin').css('display','none');
  Bert.defaults = {
  hideDelay: 5000,
  style: 'fixed-top',
  type: 'default'
    };
  Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
  DangerSound();
}else if(oPost.readyState == 4 && oPost.status == 401){
  $('.fullScreenSpin').css('display','none');
  Bert.defaults = {
  hideDelay: 5000,
  style: 'fixed-top',
  type: 'default'
    };
  Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
  DangerSound();
}else if(oPost.readyState == 4 && oPost.status == 500){
  $('.fullScreenSpin').css('display','none');
  Bert.defaults = {
  hideDelay: 5000,
  style: 'fixed-top',
  type: 'default'
    };
  Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
  DangerSound();
}else{
  $('.fullScreenSpin').css('display','none');
}

}


};

/* Print Delivery Dockets only */
templateObject.SendPrintDeliveryDocketOnly = function () {
  let invoiceID = parseInt($("#SalesId").val());
  let templateObject = Template.instance();
  var objDetails = {
    TemplateName:"Delivery Docket",
    ReportType: "Delivery Docket",
    ID: invoiceID
  };

  var erpGet = erpDb();
  var oPost = new XMLHttpRequest();

  oPost.open("POST",'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/' + erpGet.ERPPrintShippingCard, true);
  oPost.setRequestHeader("database",erpGet.ERPDatabase);
  oPost.setRequestHeader("username",erpGet.ERPUsername);
  oPost.setRequestHeader("password",erpGet.ERPPassword);
  oPost.setRequestHeader("Accept", "application/json");
  oPost.setRequestHeader("Accept", "application/html");
  oPost.setRequestHeader("Content-type", "application/json");

  var myString = JSON.stringify(objDetails).replace(/\\/g,'');
  oPost.send(myString);
  //oPost.timeout = 30000;
  oPost.onreadystatechange = function() {


    if (oPost.readyState == 4 && oPost.status == 200) {
      var dataReturnRes = JSON.parse(oPost.responseText);
      if(dataReturnRes){
            let mimecodetoConvert = dataReturnRes.MimeEncodedFile;
            let mimecodeName = dataReturnRes.ReportType;
            var filename = invoiceID+'_'+mimecodeName+'.pdf';
            let a = document.createElement("a");
             a.href = "data:application/octet-stream;base64,"+mimecodetoConvert;
             a.download = filename;
             a.click();
             FlowRouter.go('/vs1shipping?success=true');
      }else{
      Bert.alert('<strong>Failed:</strong> sending Invoice details to ERP, please try again', 'now-error');
      }


    } else if(oPost.readyState == 4 && oPost.status == 403){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 406){
      //oPost.setRequestHeader("Access-Control-Expose-Headers", "Content-Type");
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
        var ErrorResponse = oPost.getResponseHeader('errormessage');
        var segError = ErrorResponse.split(':');
      if((segError[1]) == ' "Unable to lock object'){
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>. Please close the Invoice in ERP!', 'now-error');
      }else{
        Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'now-error');
      }

      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 409){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 401){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 500){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }

  }
  $('.fullScreenSpin').css('display','none');
};

/* Print Only Invoice */
templateObject.SendPrintInvoiceOnly = function () {
  let invoiceID = parseInt($("#SalesId").val());
  let templateObject = Template.instance();
  var objDetails = {
    TemplateName:"Invoice",
    ReportType: "Invoice",
    ID: invoiceID
  };

  var erpGet = erpDb();
  var oPost = new XMLHttpRequest();

  oPost.open("POST",'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/' + erpGet.ERPPrintShippingCard, true);
  oPost.setRequestHeader("database",erpGet.ERPDatabase);
  oPost.setRequestHeader("username",erpGet.ERPUsername);
  oPost.setRequestHeader("password",erpGet.ERPPassword);
  oPost.setRequestHeader("Accept", "application/json");
  oPost.setRequestHeader("Accept", "application/html");
  oPost.setRequestHeader("Content-type", "application/json");

  var myString = JSON.stringify(objDetails).replace(/\\/g,'');
  oPost.send(myString);
  //oPost.timeout = 30000;
  oPost.onreadystatechange = function() {


    if (oPost.readyState == 4 && oPost.status == 200) {
      var dataReturnRes = JSON.parse(oPost.responseText);
      if(dataReturnRes){
            let mimecodetoConvert = dataReturnRes.MimeEncodedFile;
            let mimecodeName = dataReturnRes.ReportType;
            var filename = invoiceID+'_'+mimecodeName+'.pdf';
            let a = document.createElement("a");
             a.href = "data:application/octet-stream;base64,"+mimecodetoConvert;
             a.download = filename;
             a.click();
             FlowRouter.go('/vs1shipping?success=true');
      }else{
      Bert.alert('<strong>Failed:</strong> sending Invoice details to ERP, please try again', 'now-error');
      }


    } else if(oPost.readyState == 4 && oPost.status == 403){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 406){
      //oPost.setRequestHeader("Access-Control-Expose-Headers", "Content-Type");
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
        var ErrorResponse = oPost.getResponseHeader('errormessage');
        var segError = ErrorResponse.split(':');
      if((segError[1]) == ' "Unable to lock object'){
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>. Please close the Invoice in ERP!', 'now-error');
      }else{
        Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'now-error');
      }

      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 409){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 401){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 500){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }

  }
  $('.fullScreenSpin').css('display','none');
};

/* Send Print Invoice and Delivery Dockets */
templateObject.SendPrintInvoiceANDDeliveryDocket = function () {
  let invoiceID = parseInt($("#SalesId").val());
  var objDetails = {
    Reports:[
      {
        TemplateName:"Invoice",
        ReportType:"Invoice",
        ID:invoiceID
      },
      {
        TemplateName:"Delivery Docket",
        ReportType:"Delivery Docket",
        ID:invoiceID
      }
    ]

  };
  var erpGet = erpDb();
  var oPost = new XMLHttpRequest();

  oPost.open("POST",'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/' + erpGet.ERPPrintShippingCard, true);
  oPost.setRequestHeader("database",erpGet.ERPDatabase);
  oPost.setRequestHeader("username",erpGet.ERPUsername);
  oPost.setRequestHeader("password",erpGet.ERPPassword);
  oPost.setRequestHeader("Accept", "application/json");
  oPost.setRequestHeader("Accept", "application/html");
  oPost.setRequestHeader("Content-type", "application/json");

  var myString = JSON.stringify(objDetails).replace(/\\/g,'');
  oPost.send(myString);
  oPost.onreadystatechange = function() {


    if (oPost.readyState == 4 && oPost.status == 200) {
      var dataReturnRes = JSON.parse(oPost.responseText);
      if(dataReturnRes.Reports){
        // alert(JSON.stringify(dataReturnRes.Reports));
        for(let i=0; i<dataReturnRes.Reports.length; i++){
          let mimecodetoConvert = dataReturnRes.Reports[i].MimeEncodedFile;
          let mimecodeName = dataReturnRes.Reports[i].ReportType;
          var filename = invoiceID+'_'+mimecodeName+'.pdf';
          let a = document.createElement("a");
           a.href = "data:application/octet-stream;base64,"+mimecodetoConvert;
           a.download = filename;
           a.click();
           FlowRouter.go('/vs1shipping?success=true');
        }

      }else{
      Bert.alert('<strong>Failed:</strong> sending Invoice details to ERP, please try again', 'now-error');
      }


    } else if(oPost.readyState == 4 && oPost.status == 403){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 406){
      //oPost.setRequestHeader("Access-Control-Expose-Headers", "Content-Type");
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
        var ErrorResponse = oPost.getResponseHeader('errormessage');
        var segError = ErrorResponse.split(':');
      if((segError[1]) == ' "Unable to lock object'){
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>. Please close the Invoice in ERP!', 'now-error');
      }else{
        Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'now-error');
      }

      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 409){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 401){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }else if(oPost.readyState == 4 && oPost.status == 500){
      Bert.defaults = {
      hideDelay: 5000,
      style: 'fixed-top',
      type: 'default'
        };
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
      DangerSound();
    }

  }
  $('.fullScreenSpin').css('display','none');
};

  if(printInvoice){
    templateObject.includeIsPrintInvoice.set(printInvoice);
  }
  if(printDeliveryDocket){
    templateObject.includeIsPrintDocket.set(printDeliveryDocket);
  }

  if((printDeliveryDocket) && (printInvoice)){
    templateObject.includeBothPrint.set(true);
  }else{
    templateObject.includeBothPrint.set(false);
  }

  if((printDeliveryDocket) || (printInvoice)){
    templateObject.hasPrintPrint.set(true);
  }else{
    templateObject.hasPrintPrint.set(false);
  }

$("#invnumber").val(salesID);
$("#SalesId").val(salesID);

$("#date-input,#dtShipDate,#dtDueDate").datepicker({
    showOn: 'button',
    buttonText: 'Show Date',
    buttonImageOnly: true,
    buttonImage: '/img/imgCal2.png',
    constrainInput: false,
    dateFormat: 'd/mm/yy',
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10",
});

getVS1Data('TInvoiceBackOrder').then(function(dataObject) {
    if (dataObject.length == 0) {
      templateObject.getShippingDocts();
    }else{
      let data = JSON.parse(dataObject[0].data);
      var added = false;
      for (let d = 0; d < data.tinvoicebackorder.length; d++) {
        if (parseInt(data.tinvoicebackorder[d].fields.ID) === parseInt(salesID)) {
              added = true;
              templateObject.getAllClients();
              let lineItems = [];
              let lineItemObj = {};
              let lineItemsTable = [];
              let lineItemTableObj = {};
              let exchangeCode = data.tinvoicebackorder[d].fields.ForeignExchangeCode;
              let currencySymbol = Currency;
              let total = currencySymbol + '' + data.tinvoicebackorder[d].fields.TotalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });
              let totalInc = currencySymbol + '' + data.tinvoicebackorder[d].fields.TotalAmountInc.toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });

              let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.tinvoicebackorder[d].fields.TotalDiscount).toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });
              let subTotal = currencySymbol + '' + data.tinvoicebackorder[d].fields.TotalAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });
              let totalTax = currencySymbol + '' + data.tinvoicebackorder[d].fields.TotalTax.toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });
              let totalBalance = utilityService.modifynegativeCurrencyFormat(data.tinvoicebackorder[d].fields.TotalBalance).toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });

              let totalPaidAmount = currencySymbol + '' + data.tinvoicebackorder[d].fields.TotalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2
              });
              if (data.tinvoicebackorder[d].fields.Lines.length) {
                  for (let i = 0; i < data.tinvoicebackorder[d].fields.Lines.length; i++) {
                      let AmountGbp = currencySymbol + '' + data.tinvoicebackorder[d].fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
                          minimumFractionDigits: 2
                      });
                      let lineAmountCalc = data.tinvoicebackorder[d].fields.Lines[i].fields.OriginalLinePrice * data.tinvoicebackorder[d].fields.Lines[i].fields.UOMOrderQty;
                      let currencyAmountGbp = currencySymbol + '' + data.tinvoicebackorder[d].fields.Lines[i].fields.TotalLineAmount.toFixed(2);
                      let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.tinvoicebackorder[d].fields.Lines[i].fields.LineTaxTotal);
                      let TaxRateGbp = (data.tinvoicebackorder[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
                      lineItemObj = {
                          lineID: Random.id(),
                          id: data.tinvoicebackorder[d].fields.Lines[i].fields.ID || '',
                          item: data.tinvoicebackorder[d].fields.Lines[i].fields.ProductName || '',
                          description: data.tinvoicebackorder[d].fields.Lines[i].fields.ProductDescription || '',
                          productid: data.tinvoicebackorder[d].fields.Lines[i].fields.ProductID || '',
                          pqa: JSON.stringify(data.tinvoicebackorder[d].fields.Lines[i].fields.PQA) || '',
                          quantity: data.tinvoicebackorder[d].fields.Lines[i].fields.UOMOrderQty || 0,
                          qtyordered: data.tinvoicebackorder[d].fields.Lines[i].fields.UOMQtySold || 0,
                          qtyshipped: data.tinvoicebackorder[d].fields.Lines[i].fields.UOMQtyShipped || 0,
                          qtybo: data.tinvoicebackorder[d].fields.Lines[i].fields.UOMQtyBackOrder || 0,
                          unitPrice: utilityService.modifynegativeCurrencyFormat(data.tinvoicebackorder[d].fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, {
                              minimumFractionDigits: 2
                          }) || 0,
                          lineCost: utilityService.modifynegativeCurrencyFormat(data.tinvoicebackorder[d].fields.Lines[i].fields.LineCost).toLocaleString(undefined, {
                              minimumFractionDigits: 2
                          }) || 0,
                          taxRate: (data.tinvoicebackorder[d].fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
                          taxCode: data.tinvoicebackorder[d].fields.Lines[i].fields.LineTaxCode || '',
                          TotalAmt: utilityService.modifynegativeCurrencyFormat(lineAmountCalc) || 0,
                          curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                          TaxTotal: TaxTotalGbp || 0,
                          TaxRate: TaxRateGbp || 0,
                          DiscountPercent: data.tinvoicebackorder[d].fields.Lines[i].fields.DiscountPercent || 0

                      };

                      lineItems.push(lineItemObj);
                  }
              } else {
                  let AmountGbp = data.tinvoicebackorder[d].fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
                      minimumFractionDigits: 2
                  });
                  let currencyAmountGbp = currencySymbol + '' + data.tinvoicebackorder[d].fields.Lines.fields.TotalLineAmount.toFixed(2);
                  let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.tinvoicebackorder[d].fields.Lines.fields.LineTaxTotal);
                  let TaxRateGbp = (data.tinvoicebackorder[d].fields.Lines.fields.LineTaxRate * 100).toFixed(2);
                  lineItemObj = {
                      lineID: Random.id(),
                      id: data.tinvoicebackorder[d].fields.Lines.fields.ID || '',
                      description: data.tinvoicebackorder[d].fields.Lines.fields.ProductDescription || '',
                      quantity: data.tinvoicebackorder[d].fields.Lines.fields.UOMOrderQty || 0,
                      qtyordered: data.tinvoicebackorder[d].fields.Lines.fields.UOMQtySold || 0,
                      unitPrice: data.tinvoicebackorder[d].fields.Lines[i].fields.OriginalLinePrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2
                      }) || 0,
                      lineCost: data.tinvoicebackorder[d].fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
                          minimumFractionDigits: 2
                      }) || 0,
                      taxRate: (data.tinvoicebackorder[d].fields.Lines.fields.LineTaxRate * 100).toFixed(2) || 0,
                      taxCode: data.tinvoicebackorder[d].fields.Lines.fields.LineTaxCode || '',
                      TotalAmt: AmountGbp || 0,
                      curTotalAmt: currencyAmountGbp || currencySymbol + '0',
                      TaxTotal: TaxTotalGbp || 0,
                      TaxRate: TaxRateGbp || 0,
                      DiscountPercent: data.tinvoicebackorder[d].fields.Lines.fields.DiscountPercent || 0
                  };
                  lineItems.push(lineItemObj);
              }

              let shippingrecord = {
                  id: data.tinvoicebackorder[d].fields.ID,
                  lid: 'Edit Invoice' + ' ' + data.tinvoicebackorder[d].fields.ID,
                  shipcustomer: data.tinvoicebackorder[d].fields.CustomerName,
                  salesOrderto: data.tinvoicebackorder[d].fields.InvoiceToDesc,
                  shipto: data.tinvoicebackorder[d].fields.ShipToDesc,
                  department: data.tinvoicebackorder[d].fields.SaleClassName,
                  docnumber: data.tinvoicebackorder[d].fields.DocNumber,
                  custPONumber: data.tinvoicebackorder[d].fields.CustPONumber,
                  saledate: data.tinvoicebackorder[d].fields.SaleDate ? moment(data.tinvoicebackorder[d].fields.SaleDate).format('DD/MM/YYYY') : "",
                  shipdate: data.tinvoicebackorder[d].fields.SaleDate ? moment(data.tinvoicebackorder[d].fields.ShipDate).format('DD/MM/YYYY') : "",
                  duedate: data.tinvoicebackorder[d].fields.DueDate ? moment(data.tinvoicebackorder[d].fields.DueDate).format('DD/MM/YYYY') : "",
                  employeename: data.tinvoicebackorder[d].fields.EmployeeName,
                  status: data.tinvoicebackorder[d].fields.SalesStatus,
                  category: data.tinvoicebackorder[d].fields.SalesCategory,
                  comments: data.tinvoicebackorder[d].fields.Comments,
                  pickmemo: data.tinvoicebackorder[d].fields.PickMemo,
                  ponumber: data.tinvoicebackorder[d].fields.CustPONumber,
                  via: data.tinvoicebackorder[d].fields.Shipping,
                  connote: data.tinvoicebackorder[d].fields.ConNote,
                  reference: data.tinvoicebackorder[d].fields.ReferenceNo,
                  currency: data.tinvoicebackorder[d].fields.ForeignExchangeCode,
                  branding: data.tinvoicebackorder[d].fields.MedType,
                  invoiceToDesc: data.tinvoicebackorder[d].fields.InvoiceToDesc,
                  shipToDesc: data.tinvoicebackorder[d].fields.ShipToDesc,
                  termsName: data.tinvoicebackorder[d].fields.TermsName,
                  Total: totalInc,
                  TotalDiscount: totalDiscount,
                  LineItems: lineItems,
                  TotalTax: totalTax,
                  SubTotal: subTotal,
                  balanceDue: totalBalance,
                  saleCustField1: data.tinvoicebackorder[d].fields.SaleCustField1,
                  saleCustField2: data.tinvoicebackorder[d].fields.SaleCustField2,
                  totalPaid: totalPaidAmount,
                  ispaid: data.tinvoicebackorder[d].fields.IsPaid
              };

              $('#edtCustomerName').val(data.tinvoicebackorder[d].fields.CustomerName);
              $('#txtshipconnote').val(data.tinvoicebackorder[d].fields.ConNote);
              $('input[name="deptID"]').val(data.tinvoicebackorder[d].fields.SaleClassId);
              $('#shipvia').append('<option selected="selected" value="'+data.tinvoicebackorder[d].fields.Shipping+'">'+data.tinvoicebackorder[d].fields.Shipping+'</option>');
              templateObject.shippingrecord.set(shippingrecord);
              setTimeout(function () {
                  //clickFirstRow();
                  $("#tblShippingDocket>tbody>tr:first").trigger('click');
              }, 300);
              $('.fullScreenSpin').css('display', 'none');
            }
      }
        if (!added) {
          templateObject.getShippingDocts();
        }
    }
}).catch(function(err) {
  console.log(err);
  templateObject.getShippingDocts();
});
templateObject.getShippingDocts = function() {
var oReq = new XMLHttpRequest();
oReq.open("GET",'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/TInvoice?SaleGroupID=' + salesID, true);
oReq.setRequestHeader("database",erpGet.ERPDatabase);
oReq.setRequestHeader("username",erpGet.ERPUsername);
oReq.setRequestHeader("password",erpGet.ERPPassword);
oReq.send();

oReq.timeout = 30000;
oReq.onreadystatechange = function() {
if (oReq.readyState == 4 && oReq.status == 200) {
  templateObject.getAllClients();
  var dataListRet = oReq.responseText;
  var data = $.parseJSON(dataListRet);
  let lineItems = [];
  let lineItemObj = {};
  let lineItemsTable = [];
  let lineItemTableObj = {};
  let exchangeCode = data.fields.ForeignExchangeCode;
  let currencySymbol = Currency;
  let total = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2
  });
  let totalInc = currencySymbol + '' + data.fields.TotalAmountInc.toLocaleString(undefined, {
      minimumFractionDigits: 2
  });

  let totalDiscount = utilityService.modifynegativeCurrencyFormat(data.fields.TotalDiscount).toLocaleString(undefined, {
      minimumFractionDigits: 2
  });
  let subTotal = currencySymbol + '' + data.fields.TotalAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2
  });
  let totalTax = currencySymbol + '' + data.fields.TotalTax.toLocaleString(undefined, {
      minimumFractionDigits: 2
  });
  let totalBalance = utilityService.modifynegativeCurrencyFormat(data.fields.TotalBalance).toLocaleString(undefined, {
      minimumFractionDigits: 2
  });

  let totalPaidAmount = currencySymbol + '' + data.fields.TotalPaid.toLocaleString(undefined, {
      minimumFractionDigits: 2
  });
  if (data.fields.Lines.length) {
      for (let i = 0; i < data.fields.Lines.length; i++) {
          let AmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toLocaleString(undefined, {
              minimumFractionDigits: 2
          });
          let lineAmountCalc = data.fields.Lines[i].fields.OriginalLinePrice * data.fields.Lines[i].fields.UOMOrderQty;
          let currencyAmountGbp = currencySymbol + '' + data.fields.Lines[i].fields.TotalLineAmount.toFixed(2);
          let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineTaxTotal);
          let TaxRateGbp = (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2);
          lineItemObj = {
              lineID: Random.id(),
              id: data.fields.Lines[i].fields.ID || '',
              item: data.fields.Lines[i].fields.ProductName || '',
              description: data.fields.Lines[i].fields.ProductDescription || '',
              productid: data.fields.Lines[i].fields.ProductID || '',
              pqa: JSON.stringify(data.fields.Lines[i].fields.PQA) || '',
              quantity: data.fields.Lines[i].fields.UOMOrderQty || 0,
              qtyordered: data.fields.Lines[i].fields.UOMQtySold || 0,
              qtyshipped: data.fields.Lines[i].fields.UOMQtyShipped || 0,
              qtybo: data.fields.Lines[i].fields.UOMQtyBackOrder || 0,
              unitPrice: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.OriginalLinePrice).toLocaleString(undefined, {
                  minimumFractionDigits: 2
              }) || 0,
              lineCost: utilityService.modifynegativeCurrencyFormat(data.fields.Lines[i].fields.LineCost).toLocaleString(undefined, {
                  minimumFractionDigits: 2
              }) || 0,
              taxRate: (data.fields.Lines[i].fields.LineTaxRate * 100).toFixed(2) || 0,
              taxCode: data.fields.Lines[i].fields.LineTaxCode || '',
              TotalAmt: utilityService.modifynegativeCurrencyFormat(lineAmountCalc) || 0,
              curTotalAmt: currencyAmountGbp || currencySymbol + '0',
              TaxTotal: TaxTotalGbp || 0,
              TaxRate: TaxRateGbp || 0,
              DiscountPercent: data.fields.Lines[i].fields.DiscountPercent || 0

          };

          lineItems.push(lineItemObj);
      }
  } else {
      let AmountGbp = data.fields.Lines.fields.TotalLineAmountInc.toLocaleString(undefined, {
          minimumFractionDigits: 2
      });
      let currencyAmountGbp = currencySymbol + '' + data.fields.Lines.fields.TotalLineAmount.toFixed(2);
      let TaxTotalGbp = utilityService.modifynegativeCurrencyFormat(data.fields.Lines.fields.LineTaxTotal);
      let TaxRateGbp = (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2);
      lineItemObj = {
          lineID: Random.id(),
          id: data.fields.Lines.fields.ID || '',
          description: data.fields.Lines.fields.ProductDescription || '',
          quantity: data.fields.Lines.fields.UOMOrderQty || 0,
          qtyordered: data.fields.Lines.fields.UOMQtySold || 0,
          unitPrice: data.fields.Lines[i].fields.OriginalLinePrice.toLocaleString(undefined, {
              minimumFractionDigits: 2
          }) || 0,
          lineCost: data.fields.Lines[i].fields.LineCost.toLocaleString(undefined, {
              minimumFractionDigits: 2
          }) || 0,
          taxRate: (data.fields.Lines.fields.LineTaxRate * 100).toFixed(2) || 0,
          taxCode: data.fields.Lines.fields.LineTaxCode || '',
          TotalAmt: AmountGbp || 0,
          curTotalAmt: currencyAmountGbp || currencySymbol + '0',
          TaxTotal: TaxTotalGbp || 0,
          TaxRate: TaxRateGbp || 0,
          DiscountPercent: data.fields.Lines.fields.DiscountPercent || 0
      };
      lineItems.push(lineItemObj);
  }

  let shippingrecord = {
      id: data.fields.ID,
      lid: 'Edit Invoice' + ' ' + data.fields.ID,
      shipcustomer: data.fields.CustomerName,
      salesOrderto: data.fields.InvoiceToDesc,
      shipto: data.fields.ShipToDesc,
      department: data.fields.SaleClassName,
      docnumber: data.fields.DocNumber,
      custPONumber: data.fields.CustPONumber,
      saledate: data.fields.SaleDate ? moment(data.fields.SaleDate).format('DD/MM/YYYY') : "",
      shipdate: data.fields.SaleDate ? moment(data.fields.ShipDate).format('DD/MM/YYYY') : "",
      duedate: data.fields.DueDate ? moment(data.fields.DueDate).format('DD/MM/YYYY') : "",
      employeename: data.fields.EmployeeName,
      status: data.fields.SalesStatus,
      category: data.fields.SalesCategory,
      comments: data.fields.Comments,
      pickmemo: data.fields.PickMemo,
      ponumber: data.fields.CustPONumber,
      via: data.fields.Shipping,
      connote: data.fields.ConNote,
      reference: data.fields.ReferenceNo,
      currency: data.fields.ForeignExchangeCode,
      branding: data.fields.MedType,
      invoiceToDesc: data.fields.InvoiceToDesc,
      shipToDesc: data.fields.ShipToDesc,
      termsName: data.fields.TermsName,
      Total: totalInc,
      TotalDiscount: totalDiscount,
      LineItems: lineItems,
      TotalTax: totalTax,
      SubTotal: subTotal,
      balanceDue: totalBalance,
      saleCustField1: data.fields.SaleCustField1,
      saleCustField2: data.fields.SaleCustField2,
      totalPaid: totalPaidAmount,
      ispaid: data.fields.IsPaid
  };

  $('#edtCustomerName').val(data.fields.CustomerName);
  $('#txtshipconnote').val(data.fields.ConNote);
  $('input[name="deptID"]').val(data.fields.SaleClassId);
  $('#shipvia').append('<option selected="selected" value="'+data.fields.Shipping+'">'+data.fields.Shipping+'</option>');
  templateObject.shippingrecord.set(shippingrecord);
  setTimeout(function () {
      //clickFirstRow();
      $("#tblShippingDocket>tbody>tr:first").trigger('click');
  }, 300);

$('.fullScreenSpin').css('display','none');
}
}
}

setTimeout(function () {
    $('.fullScreenSpin').css('display','none');
}, 3000);

templateObject.getShpVias = function() {
    getVS1Data('TShippingMethod').then(function(dataObject) {
        if (dataObject.length == 0) {
            sideBarService.getShippingMethodData().then(function(data) {
              addVS1Data('TShippingMethod',JSON.stringify(data));
                for (let i in data.tshippingmethod) {

                    let viarecordObj = {
                        shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                    };

                    viarecords.push(viarecordObj);
                    templateObject.shipviarecords.set(viarecords);

                }
            });
        } else {
            let data = JSON.parse(dataObject[0].data);
            let useData = data.tshippingmethod;
            for (let i in useData) {

                let viarecordObj = {
                    shippingmethod: useData[i].ShippingMethod || ' ',
                };

                viarecords.push(viarecordObj);

                templateObject.shipviarecords.set(viarecords);

            }

        }
    }).catch(function(err) {

        sideBarService.getShippingMethodData().then(function(data) {
          addVS1Data('TShippingMethod',JSON.stringify(data));

            for (let i in data.tshippingmethod) {

                let viarecordObj = {
                    shippingmethod: data.tshippingmethod[i].ShippingMethod || ' ',
                };

                viarecords.push(viarecordObj);
                templateObject.shipviarecords.set(viarecords);

            }
        });
    });

}
templateObject.getShpVias();
$(document).on('click', '.removebutton', function () {
  event.stopPropagation();
if($('#tblShippingDocket tbody>tr').length > 1){
  if(confirm("Are you sure you want to delete this row?")) {
      this.click;

          $(this).closest('tr').remove();
          //$("#btnsaveallocline").trigger("click");

    } else { }
    event.preventDefault();
    return false;
}

});

$(document).on("click", "#tblShippingDocket tbody tr", function(e) {

  e.preventDefault();
   $("#serialistclose").trigger("click");
  $("#serailscanlistdis tbody> tr").detach();
    var $tblrow = $(this);
    var rowIndex = $(this).index()+1;
    var prodPQALine = "";
      var dataListRet = "";
    //$('table tr').css('background','#ffffff');
    $('table tr').css('background','transparent');
    $(this).css('background','rgba(0,163,211,0.1)');
    //alert(rowIndex);
    $('input[name="salesLineRow"]').val(rowIndex);
    var $cell= $(e.target).closest('td');
    //($cell.index() != 1) && ($cell.index() != 3) &&
    if(($cell.index() != 6)){
      $('#serailscanlist').find('tbody').remove();
      var productDetails = $tblrow.find(".ProdName").val();
      var SegsProd = productDetails.split(',');
      var productName = SegsProd[0];

      var secondTable = $("#serailscanlistdis");

    prodPQALine = $tblrow.find(".lineID").text();
    $('input[name="prodID"]').val($tblrow.find(".ProductID").text());
    $('input[name="orderQty"]').val($tblrow.find(".colOrdered").val());

    secondTable.css('visibility','visible');
    $("#allocBarcode").focus();

    $('#serialistclose').click(function(){
      secondTable.css('visibility','hidden');
      });
      //Get the PQA data from TPQA to load on the second table

      dataListRet = prodPQALine;
      var id = '';
      var batchProduct = '';
      var binProduct = '';
      var serialNoProduct = '';
      var obj = $.parseJSON(dataListRet);
          $.each(obj, function() {
          id = this['ID'];
          serialNoProduct = this['PQASN'];

          });

    $('input[name="pqaID"]').val(id);


//PQA Serial Number Products

var serialNoproductLine = JSON.stringify(serialNoProduct);
var serialNoprodListRet = JSON.parse(serialNoproductLine)
for (var event2 in serialNoprodListRet) {
var serialNoproductCopy = serialNoprodListRet[event2];
for (var serialNodata in serialNoproductCopy) {
var serialNoproductData = serialNoproductCopy[serialNodata];
if ((serialNoproductData.BinID != null) ){
var allocRowIndex = $("#serailscanlist > tbody  > tr").length +1;
htmlAppend3 = '<tr class="dnd-moved"><td class="form_id">'+allocRowIndex+'</td><td>' + ''
+ '</td><td>' + '</td>'
+ '<td>' + '<input type="text" style="text-align: left !important;" name="serialNo" id="serialNo" class="highlightInput " value="'+serialNoproductData.SerialNumber+'">' + '</td><td style="width: 1%;"><span class="table-remove removesecondtablebutton"><button type="button" class="btn btn-danger btn-rounded btn-sm my-0 "><i class="fa fa-remove"></i></button></span></td>'
+ '</tr>';
jQuery("#serailscanlist").append(htmlAppend3);
}
}
};
  }

});

ShippingRow();
$("#btnsaveallocline").click(function() {
  $('#tblShippingDocket tr:eq(' + rowIndex + ')').find("[id=pqa]").text("");
//   var allocLinesTable = $('#serailscanlist tbody tr').map(function (idxRow, ele) {
//   var typeName = "TPQASN";
//   var retVal = {};
//   var $td = $(ele).find('td').map(function (idxCell, ele) {
//       var input = $(ele).find(':input');
//       if (input.length == 1) {
//           var attr = $('#serailscanlist thead tr th').eq(idxCell).text();
//           if (attr == "Batch"){
//             attr = "PQABatch";
//             retVal[attr] = input.val();
//           }
//           else if(attr == 'Bin'){
//             attr = "PQABins";
//             retVal[attr] = input.val();
//           }
//           else if(attr == 'Serial No'){
//               attr = "BinID";
//               attr2 = "SerialNumber";
//               retVal[attr] = 0;
//               retVal[attr2] = input.val();
//           }
//
//       }else {
//           var attr = $('#serailscanlist thead tr th').eq(idxCell).text();
//           if(attr == 'P1'){
//             attr = "UOMQty";
//             retVal[attr] =1;
//
//           }
//       }
//
//   });
//   var AllocLine = {type:typeName,fields:retVal };
//   return AllocLine;
// }).get();

var splashLineArrayAlloc = new Array();
let lineItemObjFormAlloc = {};

$('#serailscanlist > tbody > tr').each(function() {
  var $tblrowAlloc = $(this);
  let tdSerialNumber = $tblrowAlloc.find("#serialNo").val() || 0;
  lineItemObjFormAlloc = {
      type: "TPQASN",
      fields: {
          UOMQty: 1,
          BinID: 0,
          SerialNumber: tdSerialNumber|| '',

      }
  };
  splashLineArrayAlloc.push(lineItemObjFormAlloc);
});
var departmentID =  $('input[name="deptID"]').val()||0;
var pqaID =  $('input[name="pqaID"]').val();
var AllocLineObjDetails = {
type:"TPQA",
fields:
{
  DepartmentID:parseInt(departmentID),
  PQABatch:null,
  PQABins:null,
  ID:parseInt(pqaID),
  PQASN:splashLineArrayAlloc
}
};
 var rowIndex = parseInt($('input[name="salesLineRow"]').val());
 var qtyShipped = $('#serailscanlist tbody tr').length;
 var qtyOrder = parseInt($('#tblShippingDocket tr:eq(' + rowIndex + ')').find("[id=Ordered]").val());
 var qtyBackOrder = qtyOrder - qtyShipped;
$('#tblShippingDocket tr:eq(' + rowIndex + ')').find("[id=pqa]").text(JSON.stringify(AllocLineObjDetails));
$('#tblShippingDocket tr:eq(' + rowIndex + ')').find("[id=lineID]").text(JSON.stringify(AllocLineObjDetails));
$('#tblShippingDocket tr:eq(' + rowIndex + ')').find("[id=UOMQtyShipped]").text(qtyShipped);
$('#tblShippingDocket tr:eq(' + rowIndex + ')').find("[id=UOMQtyBackOrder]").text(qtyBackOrder);
});

//Send back to ERP
$(".save_shipping").click(function() {
  $('.fullScreenSpin').css('display', 'inline-block');
var splashLineArray = new Array();
$('#tblShippingDocket > tbody > tr').each(function() {
    var lineID = this.id;
    let tdproduct = $('#' + lineID + " .colProduct").text()||'';
    let tddescription = $('#' + lineID + " .colDescription").text()||'';
    let tdQty = $('#' + lineID + " .lineQty").val()||0;
    let tdLineID = $('#' + lineID + " .ID").text() ||0;
    let tdUOMQtyShipped = $('#' + lineID + " .UOMQtyShipped").text()||0;

    let tdLinePQA = $('#' + lineID + " .pqa").text()||'';

    if (tdproduct != "") {
      if(tdLinePQA != ""){
            lineItemObjForm = {
                type: "TInvoiceLine",
                fields: {
                    ProductName: tdproduct || '',
                    ProductDescription: tddescription || '',
                    ID: parseInt(tdLineID) || 0,
                    PQA: JSON.parse(tdLinePQA) || '',
                    UOMQtyShipped: parseFloat(tdUOMQtyShipped) || 0
                }
            };

   }else{
     lineItemObjForm = {
         type: "TInvoiceLine",
         fields: {
             ProductName: tdproduct || '',
             ProductDescription: tddescription || '',
             ID: parseInt(tdLineID) || 0,
         }
     };
   }
        //lineItemsForm.push(lineItemObjForm);
        splashLineArray.push(lineItemObjForm);
    }
});
//alert(JSON.stringify(allocTable));
var custName = $("#edtCustomerName").val();
var empName = Session.get('mySession');
var shipAdress = $('textarea[name="txaShipingInfo"]').val();
var connoteVal = $('#txtshipconnote').val();
var shipVia = $("#shipvia").val();
//alert(shipVia);
var d = new Date();

var month = d.getMonth()+1;
var day = d.getDate();

var outputDate = d.getFullYear() + '-' +
    (month<10 ? '0' : '') + month + '-' +
    (day<10 ? '0' : '') + day;

var objDetails = {
type:"TInvoice",
fields:
{
Comments:$('textarea[name="shipcomments"]').val(),
ID:parseInt($("#SalesId").val()),
CustomerName:custName,
ConNote:connoteVal||'',
EmployeeName:empName,
SaleDate: outputDate,
Shipping : shipVia,
ShipToDesc:shipAdress,
ShipDate: outputDate,
Lines:splashLineArray
}
};
var erpGet = erpDb();
var oPost = new XMLHttpRequest();

oPost.open("POST",'https://' + erpGet.ERPIPAddress + ':' + erpGet.ERPPort + '/' + erpGet.ERPApi + '/' + erpGet.ERPInvoiceCard, true);
oPost.setRequestHeader("database",erpGet.ERPDatabase);
oPost.setRequestHeader("username",erpGet.ERPUsername);
oPost.setRequestHeader("password",erpGet.ERPPassword);
oPost.setRequestHeader("Accept", "application/json");
oPost.setRequestHeader("Accept", "application/html");
oPost.setRequestHeader("Content-type", "application/json");
//oPost.setRequestHeader("Content-type", "text/plain; charset=UTF-8");

var myString = JSON.stringify(objDetails);
//alert(myString);
oPost.send(myString);

//oPost.timeout = 30000;
oPost.onreadystatechange = function() {

$('.fullScreenSpin').css('display', 'none');
  if (oPost.readyState == 4 && oPost.status == 200) {
    var dataReturnRes = JSON.parse(oPost.responseText);
    var shippedID = dataReturnRes.fields.ID;
    //alert(shippedID);
    if(shippedID){
      Bert.alert('<strong>SUCCESS:</strong> Sale successfully Updated!', 'success');
      FlowRouter.go('/vs1shipping?success=true');
    }else{
    Bert.alert('<strong>Failed:</strong> sending shipping details to ERP, please try again', 'now-error');
    }


  } else if(oPost.readyState == 4 && oPost.status == 403){
    //alert(oPost.status);

    Bert.defaults = {
    hideDelay: 5000,
    style: 'fixed-top',
    type: 'default'
      };
    Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
    DangerSound();
  }else if(oPost.readyState == 4 && oPost.status == 406){
    //oPost.setRequestHeader("Access-Control-Expose-Headers", "Content-Type");
    Bert.defaults = {
    hideDelay: 5000,
    style: 'fixed-top',
    type: 'default'
      };
      //oPost.setRequestHeader("Content-Length", "1");
      var ErrorResponse = oPost.getResponseHeader('errormessage');
      var segError = ErrorResponse.split(':');
      //alert(segError[1]);
    if((segError[1]) == ' "Unable to lock object'){
      //alert(oPost.getAllResponseHeaders());
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>. Please close the invoice in ERP!', 'now-error');
    }else{
      Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'</strong>!', 'now-error');
    }

    DangerSound();
  }else if(oPost.readyState == 4 && oPost.status == 409){
    Bert.defaults = {
    hideDelay: 5000,
    style: 'fixed-top',
    type: 'default'
      };
    Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
    DangerSound();
  }else if(oPost.readyState == 4 && oPost.status == 401){
    Bert.defaults = {
    hideDelay: 5000,
    style: 'fixed-top',
    type: 'default'
      };
    Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
    DangerSound();
  }else if(oPost.readyState == 4 && oPost.status == 500){
    Bert.defaults = {
    hideDelay: 5000,
    style: 'fixed-top',
    type: 'default'
      };
    Bert.alert('<strong>'+ oPost.getResponseHeader('errormessage')+'!</strong>', 'now-error');
    DangerSound();
  }

}

});

  $(document).ready(function() {
    $('#edtCustomerName').editableSelect();
  });

  $('#edtCustomerName').editableSelect()
      .on('click.editable-select', function(e, li) {
          var $earch = $(this);
          var offset = $earch.offset();
          $('#edtCustomerPOPID').val('');
          var customerDataName = e.target.value || '';
          var customerDataID = $('#edtCustomerName').attr('custid').replace(/\s/g, '') || '';
          if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
              $('#customerListModal').modal();
              setTimeout(function() {
                  $('#tblCustomerlist_filter .form-control-sm').focus();
                  $('#tblCustomerlist_filter .form-control-sm').val('');
                  $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                  var datatable = $('#tblCustomerlist').DataTable();
                  //datatable.clear();
                  //datatable.rows.add(splashArrayCustomerList);
                  datatable.draw();
                  $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                  //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
              }, 500);
          } else {
              if (customerDataName.replace(/\s/g, '') != '') {
                  //FlowRouter.go('/customerscard?name=' + e.target.value);
                  $('#edtCustomerPOPID').val('');
                  getVS1Data('TCustomerVS1').then(function(dataObject) {
                      if (dataObject.length == 0) {
                          $('.fullScreenSpin').css('display', 'inline-block');
                          sideBarService.getOneCustomerDataExByName(customerDataName).then(function(data) {
                              $('.fullScreenSpin').css('display', 'none');
                              let lineItems = [];
                              $('#add-customer-title').text('Edit Customer');
                              let popCustomerID = data.tcustomer[0].fields.ID || '';
                              let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                              let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                              let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                              let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                              let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                              let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                              let popCustomertfn = '' || '';
                              let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                              let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                              let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                              let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                              let popCustomerURL = data.tcustomer[0].fields.URL || '';
                              let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                              let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                              let popCustomerState = data.tcustomer[0].fields.State || '';
                              let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                              let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                              let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                              let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                              let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                              let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                              let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                              let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                              let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                              let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                              let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                              let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                              let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                              let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                              let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                              let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                              let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                              let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                              let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                              let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                              let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                              let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                              $('#edtCustomerCompany').val(popCustomerName);
                              $('#edtCustomerPOPID').val(popCustomerID);
                              $('#edtCustomerPOPEmail').val(popCustomerEmail);
                              $('#edtTitle').val(popCustomerTitle);
                              $('#edtFirstName').val(popCustomerFirstName);
                              $('#edtMiddleName').val(popCustomerMiddleName);
                              $('#edtLastName').val(popCustomerLastName);
                              $('#edtCustomerPhone').val(popCustomerPhone);
                              $('#edtCustomerMobile').val(popCustomerMobile);
                              $('#edtCustomerFax').val(popCustomerFaxnumber);
                              $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                              $('#edtCustomerWebsite').val(popCustomerURL);
                              $('#edtCustomerShippingAddress').val(popCustomerStreet);
                              $('#edtCustomerShippingCity').val(popCustomerStreet2);
                              $('#edtCustomerShippingState').val(popCustomerState);
                              $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                              $('#sedtCountry').val(popCustomerCountry);
                              $('#txaNotes').val(popCustomernotes);
                              $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                              $('#sltTermsPOP').val(popCustomerterms);
                              $('#sltCustomerType').val(popCustomerType);
                              $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                              $('#edtCustomeField1').val(popCustomercustfield1);
                              $('#edtCustomeField2').val(popCustomercustfield2);
                              $('#edtCustomeField3').val(popCustomercustfield3);
                              $('#edtCustomeField4').val(popCustomercustfield4);

                              $('#sltTaxCode').val(popCustomerTaxCode);

                              if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                  (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                  (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                  $('#chkSameAsShipping2').attr("checked", "checked");
                              }

                              if (data.tcustomer[0].fields.IsSupplier == true) {
                                  // $('#isformcontractor')
                                  $('#chkSameAsSupplier').attr("checked", "checked");
                              } else {
                                  $('#chkSameAsSupplier').removeAttr("checked");
                              }

                              setTimeout(function() {
                                  $('#addCustomerModal').modal('show');
                              }, 200);
                          }).catch(function(err) {
                              $('.fullScreenSpin').css('display', 'none');
                          });
                      } else {
                          let data = JSON.parse(dataObject[0].data);
                          let useData = data.tcustomervs1;

                          var added = false;
                          for (let i = 0; i < data.tcustomervs1.length; i++) {
                              if (data.tcustomervs1[i].fields.ClientName === customerDataName) {
                                  let lineItems = [];
                                  added = true;
                                  $('.fullScreenSpin').css('display', 'none');
                                  $('#add-customer-title').text('Edit Customer');
                                  let popCustomerID = data.tcustomervs1[i].fields.ID || '';
                                  let popCustomerName = data.tcustomervs1[i].fields.ClientName || '';
                                  let popCustomerEmail = data.tcustomervs1[i].fields.Email || '';
                                  let popCustomerTitle = data.tcustomervs1[i].fields.Title || '';
                                  let popCustomerFirstName = data.tcustomervs1[i].fields.FirstName || '';
                                  let popCustomerMiddleName = data.tcustomervs1[i].fields.CUSTFLD10 || '';
                                  let popCustomerLastName = data.tcustomervs1[i].fields.LastName || '';
                                  let popCustomertfn = '' || '';
                                  let popCustomerPhone = data.tcustomervs1[i].fields.Phone || '';
                                  let popCustomerMobile = data.tcustomervs1[i].fields.Mobile || '';
                                  let popCustomerFaxnumber = data.tcustomervs1[i].fields.Faxnumber || '';
                                  let popCustomerSkypeName = data.tcustomervs1[i].fields.SkypeName || '';
                                  let popCustomerURL = data.tcustomervs1[i].fields.URL || '';
                                  let popCustomerStreet = data.tcustomervs1[i].fields.Street || '';
                                  let popCustomerStreet2 = data.tcustomervs1[i].fields.Street2 || '';
                                  let popCustomerState = data.tcustomervs1[i].fields.State || '';
                                  let popCustomerPostcode = data.tcustomervs1[i].fields.Postcode || '';
                                  let popCustomerCountry = data.tcustomervs1[i].fields.Country || LoggedCountry;
                                  let popCustomerbillingaddress = data.tcustomervs1[i].fields.BillStreet || '';
                                  let popCustomerbcity = data.tcustomervs1[i].fields.BillStreet2 || '';
                                  let popCustomerbstate = data.tcustomervs1[i].fields.BillState || '';
                                  let popCustomerbpostalcode = data.tcustomervs1[i].fields.BillPostcode || '';
                                  let popCustomerbcountry = data.tcustomervs1[i].fields.Billcountry || LoggedCountry;
                                  let popCustomercustfield1 = data.tcustomervs1[i].fields.CUSTFLD1 || '';
                                  let popCustomercustfield2 = data.tcustomervs1[i].fields.CUSTFLD2 || '';
                                  let popCustomercustfield3 = data.tcustomervs1[i].fields.CUSTFLD3 || '';
                                  let popCustomercustfield4 = data.tcustomervs1[i].fields.CUSTFLD4 || '';
                                  let popCustomernotes = data.tcustomervs1[i].fields.Notes || '';
                                  let popCustomerpreferedpayment = data.tcustomervs1[i].fields.PaymentMethodName || '';
                                  let popCustomerterms = data.tcustomervs1[i].fields.TermsName || '';
                                  let popCustomerdeliverymethod = data.tcustomervs1[i].fields.ShippingMethodName || '';
                                  let popCustomeraccountnumber = data.tcustomervs1[i].fields.ClientNo || '';
                                  let popCustomerisContractor = data.tcustomervs1[i].fields.Contractor || false;
                                  let popCustomerissupplier = data.tcustomervs1[i].fields.IsSupplier || false;
                                  let popCustomeriscustomer = data.tcustomervs1[i].fields.IsCustomer || false;
                                  let popCustomerTaxCode = data.tcustomervs1[i].fields.TaxCodeName || '';
                                  let popCustomerDiscount = data.tcustomervs1[i].fields.Discount || 0;
                                  let popCustomerType = data.tcustomervs1[i].fields.ClientTypeName || '';
                                  $('#edtCustomerCompany').val(popCustomerName);
                                  $('#edtCustomerPOPID').val(popCustomerID);
                                  $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                  $('#edtTitle').val(popCustomerTitle);
                                  $('#edtFirstName').val(popCustomerFirstName);
                                  $('#edtMiddleName').val(popCustomerMiddleName);
                                  $('#edtLastName').val(popCustomerLastName);
                                  $('#edtCustomerPhone').val(popCustomerPhone);
                                  $('#edtCustomerMobile').val(popCustomerMobile);
                                  $('#edtCustomerFax').val(popCustomerFaxnumber);
                                  $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                  $('#edtCustomerWebsite').val(popCustomerURL);
                                  $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                  $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                  $('#edtCustomerShippingState').val(popCustomerState);
                                  $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                  $('#sedtCountry').val(popCustomerCountry);
                                  $('#txaNotes').val(popCustomernotes);
                                  $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                  $('#sltTermsPOP').val(popCustomerterms);
                                  $('#sltCustomerType').val(popCustomerType);
                                  $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                  $('#edtCustomeField1').val(popCustomercustfield1);
                                  $('#edtCustomeField2').val(popCustomercustfield2);
                                  $('#edtCustomeField3').val(popCustomercustfield3);
                                  $('#edtCustomeField4').val(popCustomercustfield4);

                                  $('#sltTaxCode').val(popCustomerTaxCode);

                                  if ((data.tcustomervs1[i].fields.Street == data.tcustomervs1[i].fields.BillStreet) && (data.tcustomervs1[i].fields.Street2 == data.tcustomervs1[i].fields.BillStreet2) &&
                                      (data.tcustomervs1[i].fields.State == data.tcustomervs1[i].fields.BillState) && (data.tcustomervs1[i].fields.Postcode == data.tcustomervs1[i].fields.BillPostcode) &&
                                      (data.tcustomervs1[i].fields.Country == data.tcustomervs1[i].fields.Billcountry)) {
                                      $('#chkSameAsShipping2').attr("checked", "checked");
                                  }

                                  if (data.tcustomervs1[i].fields.IsSupplier == true) {
                                      // $('#isformcontractor')
                                      $('#chkSameAsSupplier').attr("checked", "checked");
                                  } else {
                                      $('#chkSameAsSupplier').removeAttr("checked");
                                  }

                                  setTimeout(function() {
                                      $('#addCustomerModal').modal('show');
                                  }, 200);

                              }
                          }
                          if (!added) {
                              $('.fullScreenSpin').css('display', 'inline-block');
                              sideBarService.getOneCustomerDataExByName(customerDataName).then(function(data) {
                                  $('.fullScreenSpin').css('display', 'none');
                                  let lineItems = [];
                                  $('#add-customer-title').text('Edit Customer');
                                  let popCustomerID = data.tcustomer[0].fields.ID || '';
                                  let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                                  let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                                  let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                                  let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                                  let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                                  let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                                  let popCustomertfn = '' || '';
                                  let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                                  let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                                  let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                                  let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                                  let popCustomerURL = data.tcustomer[0].fields.URL || '';
                                  let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                                  let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                                  let popCustomerState = data.tcustomer[0].fields.State || '';
                                  let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                                  let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                                  let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                                  let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                                  let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                                  let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                                  let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                                  let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                                  let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                                  let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                                  let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                                  let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                                  let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                                  let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                                  let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                                  let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                                  let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                                  let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                                  let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                                  let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                                  let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                                  let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                                  $('#edtCustomerCompany').val(popCustomerName);
                                  $('#edtCustomerPOPID').val(popCustomerID);
                                  $('#edtCustomerPOPEmail').val(popCustomerEmail);
                                  $('#edtTitle').val(popCustomerTitle);
                                  $('#edtFirstName').val(popCustomerFirstName);
                                  $('#edtMiddleName').val(popCustomerMiddleName);
                                  $('#edtLastName').val(popCustomerLastName);
                                  $('#edtCustomerPhone').val(popCustomerPhone);
                                  $('#edtCustomerMobile').val(popCustomerMobile);
                                  $('#edtCustomerFax').val(popCustomerFaxnumber);
                                  $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                                  $('#edtCustomerWebsite').val(popCustomerURL);
                                  $('#edtCustomerShippingAddress').val(popCustomerStreet);
                                  $('#edtCustomerShippingCity').val(popCustomerStreet2);
                                  $('#edtCustomerShippingState').val(popCustomerState);
                                  $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                                  $('#sedtCountry').val(popCustomerCountry);
                                  $('#txaNotes').val(popCustomernotes);
                                  $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                                  $('#sltTermsPOP').val(popCustomerterms);
                                  $('#sltCustomerType').val(popCustomerType);
                                  $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                                  $('#edtCustomeField1').val(popCustomercustfield1);
                                  $('#edtCustomeField2').val(popCustomercustfield2);
                                  $('#edtCustomeField3').val(popCustomercustfield3);
                                  $('#edtCustomeField4').val(popCustomercustfield4);

                                  $('#sltTaxCode').val(popCustomerTaxCode);

                                  if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                                      (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                                      (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                                      $('#chkSameAsShipping2').attr("checked", "checked");
                                  }

                                  if (data.tcustomer[0].fields.IsSupplier == true) {
                                      // $('#isformcontractor')
                                      $('#chkSameAsSupplier').attr("checked", "checked");
                                  } else {
                                      $('#chkSameAsSupplier').removeAttr("checked");
                                  }

                                  setTimeout(function() {
                                      $('#addCustomerModal').modal('show');
                                  }, 200);
                              }).catch(function(err) {
                                  $('.fullScreenSpin').css('display', 'none');
                              });
                          }
                      }
                  }).catch(function(err) {
                      sideBarService.getOneCustomerDataExByName(customerDataName).then(function(data) {
                          $('.fullScreenSpin').css('display', 'none');
                          let lineItems = [];
                          $('#add-customer-title').text('Edit Customer');
                          let popCustomerID = data.tcustomer[0].fields.ID || '';
                          let popCustomerName = data.tcustomer[0].fields.ClientName || '';
                          let popCustomerEmail = data.tcustomer[0].fields.Email || '';
                          let popCustomerTitle = data.tcustomer[0].fields.Title || '';
                          let popCustomerFirstName = data.tcustomer[0].fields.FirstName || '';
                          let popCustomerMiddleName = data.tcustomer[0].fields.CUSTFLD10 || '';
                          let popCustomerLastName = data.tcustomer[0].fields.LastName || '';
                          let popCustomertfn = '' || '';
                          let popCustomerPhone = data.tcustomer[0].fields.Phone || '';
                          let popCustomerMobile = data.tcustomer[0].fields.Mobile || '';
                          let popCustomerFaxnumber = data.tcustomer[0].fields.Faxnumber || '';
                          let popCustomerSkypeName = data.tcustomer[0].fields.SkypeName || '';
                          let popCustomerURL = data.tcustomer[0].fields.URL || '';
                          let popCustomerStreet = data.tcustomer[0].fields.Street || '';
                          let popCustomerStreet2 = data.tcustomer[0].fields.Street2 || '';
                          let popCustomerState = data.tcustomer[0].fields.State || '';
                          let popCustomerPostcode = data.tcustomer[0].fields.Postcode || '';
                          let popCustomerCountry = data.tcustomer[0].fields.Country || LoggedCountry;
                          let popCustomerbillingaddress = data.tcustomer[0].fields.BillStreet || '';
                          let popCustomerbcity = data.tcustomer[0].fields.BillStreet2 || '';
                          let popCustomerbstate = data.tcustomer[0].fields.BillState || '';
                          let popCustomerbpostalcode = data.tcustomer[0].fields.BillPostcode || '';
                          let popCustomerbcountry = data.tcustomer[0].fields.Billcountry || LoggedCountry;
                          let popCustomercustfield1 = data.tcustomer[0].fields.CUSTFLD1 || '';
                          let popCustomercustfield2 = data.tcustomer[0].fields.CUSTFLD2 || '';
                          let popCustomercustfield3 = data.tcustomer[0].fields.CUSTFLD3 || '';
                          let popCustomercustfield4 = data.tcustomer[0].fields.CUSTFLD4 || '';
                          let popCustomernotes = data.tcustomer[0].fields.Notes || '';
                          let popCustomerpreferedpayment = data.tcustomer[0].fields.PaymentMethodName || '';
                          let popCustomerterms = data.tcustomer[0].fields.TermsName || '';
                          let popCustomerdeliverymethod = data.tcustomer[0].fields.ShippingMethodName || '';
                          let popCustomeraccountnumber = data.tcustomer[0].fields.ClientNo || '';
                          let popCustomerisContractor = data.tcustomer[0].fields.Contractor || false;
                          let popCustomerissupplier = data.tcustomer[0].fields.IsSupplier || false;
                          let popCustomeriscustomer = data.tcustomer[0].fields.IsCustomer || false;
                          let popCustomerTaxCode = data.tcustomer[0].fields.TaxCodeName || '';
                          let popCustomerDiscount = data.tcustomer[0].fields.Discount || 0;
                          let popCustomerType = data.tcustomer[0].fields.ClientTypeName || '';
                          $('#edtCustomerCompany').val(popCustomerName);
                          $('#edtCustomerPOPID').val(popCustomerID);
                          $('#edtCustomerPOPEmail').val(popCustomerEmail);
                          $('#edtTitle').val(popCustomerTitle);
                          $('#edtFirstName').val(popCustomerFirstName);
                          $('#edtMiddleName').val(popCustomerMiddleName);
                          $('#edtLastName').val(popCustomerLastName);
                          $('#edtCustomerPhone').val(popCustomerPhone);
                          $('#edtCustomerMobile').val(popCustomerMobile);
                          $('#edtCustomerFax').val(popCustomerFaxnumber);
                          $('#edtCustomerSkypeID').val(popCustomerSkypeName);
                          $('#edtCustomerWebsite').val(popCustomerURL);
                          $('#edtCustomerShippingAddress').val(popCustomerStreet);
                          $('#edtCustomerShippingCity').val(popCustomerStreet2);
                          $('#edtCustomerShippingState').val(popCustomerState);
                          $('#edtCustomerShippingZIP').val(popCustomerPostcode);
                          $('#sedtCountry').val(popCustomerCountry);
                          $('#txaNotes').val(popCustomernotes);
                          $('#sltPreferedPayment').val(popCustomerpreferedpayment);
                          $('#sltTermsPOP').val(popCustomerterms);
                          $('#sltCustomerType').val(popCustomerType);
                          $('#edtCustomerCardDiscount').val(popCustomerDiscount);
                          $('#edtCustomeField1').val(popCustomercustfield1);
                          $('#edtCustomeField2').val(popCustomercustfield2);
                          $('#edtCustomeField3').val(popCustomercustfield3);
                          $('#edtCustomeField4').val(popCustomercustfield4);

                          $('#sltTaxCode').val(popCustomerTaxCode);

                          if ((data.tcustomer[0].fields.Street == data.tcustomer[0].fields.BillStreet) && (data.tcustomer[0].fields.Street2 == data.tcustomer[0].fields.BillStreet2) &&
                              (data.tcustomer[0].fields.State == data.tcustomer[0].fields.BillState) && (data.tcustomer[0].fields.Postcode == data.tcustomer[0].fields.BillPostcode) &&
                              (data.tcustomer[0].fields.Country == data.tcustomer[0].fields.Billcountry)) {
                              $('#chkSameAsShipping2').attr("checked", "checked");
                          }

                          if (data.tcustomer[0].fields.IsSupplier == true) {
                              // $('#isformcontractor')
                              $('#chkSameAsSupplier').attr("checked", "checked");
                          } else {
                              $('#chkSameAsSupplier').removeAttr("checked");
                          }

                          setTimeout(function() {
                              $('#addCustomerModal').modal('show');
                          }, 200);
                      }).catch(function(err) {
                          $('.fullScreenSpin').css('display', 'none');
                      });
                  });
              } else {
                  $('#customerListModal').modal();
                  setTimeout(function() {
                      $('#tblCustomerlist_filter .form-control-sm').focus();
                      $('#tblCustomerlist_filter .form-control-sm').val('');
                      $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                      var datatable = $('#tblCustomerlist').DataTable();
                      //datatable.clear();
                      //datatable.rows.add(splashArrayCustomerList);
                      datatable.draw();
                      $('#tblCustomerlist_filter .form-control-sm').trigger("input");
                      //$('#tblCustomerlist').dataTable().fnFilter(' ').draw(false);
                  }, 500);
              }
          }


      });

      /* On click Customer List */
  $(document).on("click", "#tblCustomerlist tbody tr", function(e) {

          var tableCustomer = $(this);
          $('#edtCustomerName').val(tableCustomer.find(".colCompany").text());
          $('#edtCustomerName').attr("custid", tableCustomer.find(".colID").text());
          $('#customerListModal').modal('toggle');

          $('#edtCustomerEmail').val(tableCustomer.find(".colEmail").text());
          $('#edtCustomerEmail').attr('customerid', tableCustomer.find(".colID").text());
          $('#edtCustomerName').attr('custid', tableCustomer.find(".colID").text());
          $('#edtCustomerEmail').attr('customerfirstname', tableCustomer.find(".colCustomerFirstName").text());
          $('#edtCustomerEmail').attr('customerlastname', tableCustomer.find(".colCustomerLastName").text());

          let postalAddress = tableCustomer.find(".colCompany").text() + '\n' + tableCustomer.find(".colStreetAddress").text() + '\n' + tableCustomer.find(".colCity").text() + ' ' + tableCustomer.find(".colState").text() + ' ' + tableCustomer.find(".colZipCode").text() + '\n' + tableCustomer.find(".colCountry").text();
          $('#txaShipingInfo').val(postalAddress);




          $('#tblCustomerlist_filter .form-control-sm').val('');
          setTimeout(function() {
              //$('#tblCustomerlist_filter .form-control-sm').focus();
              $('.btnRefreshCustomer').trigger('click');
              $('.fullScreenSpin').css('display', 'none');
          }, 1000);
          // }
      });

      templateObject.getAllClients = function() {
          getVS1Data('TCustomerVS1').then(function(dataObject) {
              if (dataObject.length == 0) {
                if($('#edtCustomerName').val() != ''){
                sideBarService.getCustomersDataByName($('#edtCustomerName').val()).then(function(dataClient) {
                    for (var c = 0; c < dataClient.tcustomervs1.length; c++) {

                        $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                        $('#edtCustomerEmail').attr('customerid', dataClient.tcustomervs1[c].Id);
                        $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                        $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                        $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);

                    }

                });
              }
              } else {
                  let data = JSON.parse(dataObject[0].data);
                  let useData = data.tcustomervs1;
                  var checkISCustLoad = false;
                  for (let i in useData) {
                    if(useData[i].fields.Email === $('#edtCustomerName').val()){
                      checkISCustLoad = true;
                      setTimeout(function() {
                      $('#edtCustomerEmail').val(data.tcustomervs1[i].fields.Email);
                      $('#edtCustomerEmail').attr('customerid', data.tcustomervs1[i].fields.ID);
                      $('#edtCustomerName').attr('custid', data.tcustomervs1[i].fields.ID);
                      $('#edtCustomerEmail').attr('customerfirstname', data.tcustomervs1[i].fields.FirstName);
                      $('#edtCustomerEmail').attr('customerlastname', data.tcustomervs1[i].fields.LastName);
                    }, 300);
                    }

                  }

                  if (!checkISCustLoad) {
                      sideBarService.getCustomersDataByName($('#edtCustomerName').val()).then(function(dataClient) {
                          for (var c = 0; c < dataClient.tcustomervs1.length; c++) {

                              $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                              $('#edtCustomerEmail').attr('customerid', dataClient.tcustomervs1[c].Id);
                              $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                              $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                              $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);

                          }

                      });
                  }

              }
          }).catch(function(err) {
            if($('#edtCustomerName').val() != ''){
            sideBarService.getCustomersDataByName($('#edtCustomerName').val()).then(function(dataClient) {
                for (var c = 0; c < dataClient.tcustomervs1.length; c++) {

                    $('#edtCustomerEmail').val(dataClient.tcustomervs1[c].Email);
                    $('#edtCustomerEmail').attr('customerid', dataClient.tcustomervs1[c].Id);
                    $('#edtCustomerName').attr('custid', dataClient.tcustomervs1[c].Id);
                    $('#edtCustomerEmail').attr('customerfirstname', dataClient.tcustomervs1[c].FirstName);
                    $('#edtCustomerEmail').attr('customerlastname', dataClient.tcustomervs1[c].LastName);

                }

            });
          }
          });
      };

});

Template.shippingdocket.events({
  'click #includeInvoiceAttachment': function (e) {
    let templateObject = Template.instance();
    if ($('#includeInvoiceAttachment').prop('checked')) {
        templateObject.includeInvoiceAttachment.set(true);
        $(".btnprintDockets").attr("data-toggle", "modal");
        $(".btnprintDockets").attr("data-target", "#print-dockets");
        $(".btnprintDockets").attr("data-dismiss", "modal");
    } else {
        templateObject.includeInvoiceAttachment.set(false);
        let isInvoice = templateObject.includeInvoiceAttachment.get();
        let isShippingDocket = templateObject.includeDocketAttachment.get();
        if(!(isInvoice) && !(isShippingDocket) ){
          $(".btnprintDockets").removeAttr("data-toggle");
          $(".btnprintDockets").removeAttr("data-target");
          $(".btnprintDockets").removeAttr("data-dismiss");
        }
    }
},
'click #includeDocketAttachment': function (e) {
    let templateObject = Template.instance();

    if ($('#includeDocketAttachment').prop('checked')) {
        templateObject.includeDocketAttachment.set(true);
        $(".btnprintDockets").attr("data-toggle", "modal");
        $(".btnprintDockets").attr("data-target", "#print-dockets");
        $(".btnprintDockets").attr("data-dismiss", "modal");
    } else {
        templateObject.includeDocketAttachment.set(false);
        let isInvoice = templateObject.includeInvoiceAttachment.get();
        let isShippingDocket = templateObject.includeDocketAttachment.get();
        if(!(isInvoice) && !(isShippingDocket) ){
          $(".btnprintDockets").removeAttr("data-toggle");
          $(".btnprintDockets").removeAttr("data-target");
          $(".btnprintDockets").removeAttr("data-dismiss");
        }

    }
},
'click .btnprintDockets':function(e){

 let invoiceID = parseInt($("#SalesId").val());
 let templateObject = Template.instance();
 let isInvoice = templateObject.includeInvoiceAttachment.get();
 let isShippingDocket = templateObject.includeDocketAttachment.get();

  if(invoiceID){
    if((isInvoice) && (isShippingDocket)){
      let templateObject = Template.instance();
      let printType = "InvoiceANDDeliveryDocket";
      templateObject.SendShippingDetails(printType);

    }
    if((isInvoice) && !(isShippingDocket)){
      let templateObject = Template.instance();
      let printType = "InvoiceOnly";
      templateObject.SendShippingDetails(printType);
  }
  if((isShippingDocket) && !(isInvoice) ){
    let templateObject = Template.instance();
    let printType = "DeliveryDocketsOnly";
    templateObject.SendShippingDetails(printType);
  }
  }

},
'click .btnprintInvoice':function(e){
let templateObject = Template.instance();
let printType = "InvoiceOnly";
templateObject.SendShippingDetails(printType);
},
'click .btnprintDelDocket':function(e){
let templateObject = Template.instance();
let printType = "DeliveryDocketsOnly";
templateObject.SendShippingDetails(printType);
},
'click #printDockets':function(e){
const templateObject = Template.instance();
},
'click .btnBack': function(event) {
    event.preventDefault();
    history.back(1);


}
});

Template.shippingdocket.helpers({
  isPrintInvoice: () => {
      return Template.instance().includeIsPrintInvoice.get();
  },
  isPrintDeliveryDocket: () => {
      return Template.instance().includeIsPrintDocket.get();
  },
  includeBothPrint: () => {
      return Template.instance().includeBothPrint.get();
  },
  hasPrintPrint: () => {
      return Template.instance().hasPrintPrint.get();
  },
  shippingrecord: () => {
      return Template.instance().shippingrecord.get();
  },
  shipviarecords: () => {
      return Template.instance().shipviarecords.get().sort(function(a, b) {
          if (a.shippingmethod == 'NA') {
              return 1;
          } else if (b.shippingmethod == 'NA') {
              return -1;
          }
          return (a.shippingmethod.toUpperCase() > b.shippingmethod.toUpperCase()) ? 1 : -1;
      });
  }
});
