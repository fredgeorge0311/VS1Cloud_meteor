import {SalesBoardService} from '../js/sales-service';
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {EmployeeProfileService} from "../js/profile-service";
import {AccountService} from "../accounts/account-service";
import {InvoiceService} from "../invoice/invoice-service";
import {UtilityService} from "../utility-service";
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.quoteslist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.quoteslist.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let salesService = new SalesBoardService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

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

    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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
                    // let columnindex = customcolumn[i].index + 1;
                    $("th."+columnClass+"").html(columData);
                    $("th."+columnClass+"").css('width',""+columnWidth+"px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function(){
            if($(this).text().indexOf('-'+Currency) >= 0) $(this).addClass('text-danger')
        });

        $('td.colStatus').each(function(){
            if($(this).text() == "Deleted") $(this).addClass('text-deleted');
            if ($(this).text() == "Full") $(this).addClass('text-fullyPaid');
            if ($(this).text() == "Part") $(this).addClass('text-partialPaid');
            if ($(this).text() == "Rec") $(this).addClass('text-reconciled');
        });
    };

    templateObject.resetData = function (dataVal) {
      if(FlowRouter.current().queryParams.converted){
        if(FlowRouter.current().queryParams.converted === true) {
          window.open('/quoteslist?converted=true&page=last','_self');
        }else{
          window.open('/quoteslist?converted=false&page=last','_self');
        }
      }else {
        window.open('/quoteslist?page=last', '_self');
      }

    }

    templateObject.getCustomFieldData = function() {

      let custFields = [];
      let customData = {};

      sideBarService
      .getAllCustomFields()
      .then(function (data) {
        for (let x = 0; x < data.tcustomfieldlist.length; x++) {
          if (data.tcustomfieldlist[x].fields.ListType == 'ltSales') {
            customData = {
              active: data.tcustomfieldlist[x].fields.Active || false,
              id: parseInt(data.tcustomfieldlist[x].fields.ID) || 0,
              custfieldlabel: data.tcustomfieldlist[x].fields.Description || "",
              datatype: data.tcustomfieldlist[x].fields.DataType || "",
              isempty: data.tcustomfieldlist[x].fields.ISEmpty || false,
              iscombo: data.tcustomfieldlist[x].fields.IsCombo || false,
              dropdown: data.tcustomfieldlist[x].fields.Dropdown || null,
            };
            custFields.push(customData);
          }
        }

        if (custFields.length < 3) {
          let remainder = 3 - custFields.length;
          let getRemCustomFields = parseInt(custFields.length); 
          for (let r = 0; r < remainder; r++) {
            getRemCustomFields++;
            customData = {
              active: false,
              id: "",
              custfieldlabel: "Custom Field " + getRemCustomFields,
              datatype: "",
              isempty: true,
              iscombo: false,
            };
            // count++;
            custFields.push(customData);
          }
        }
        if (custFields) { 
          $(".colCustFieldHeader1").html(custFields[0].custfieldlabel);
          $(".colCustFieldHeader2").html(custFields[1].custfieldlabel);
          $(".colCustFieldHeader3").html(custFields[2].custfieldlabel);

          if (custFields[0].active) {
            $(".colSaleCustField1").removeClass('hiddenColumn');
            $(".colSaleCustField1").addClass('showColumn');
          } else {
            $(".colSaleCustField1").addClass('hiddenColumn');
            $(".colSaleCustField1").removeClass('showColumn');
          }
    
          if (custFields[1].active) {
            $(".colSaleCustField2").removeClass('hiddenColumn');
            $(".colSaleCustField2").addClass('showColumn');
          } else {
            $(".colSaleCustField2").addClass('hiddenColumn');
            $(".colSaleCustField2").removeClass('showColumn');
          }

          if (custFields[2].active) {
            $(".colSaleCustField3").removeClass('hiddenColumn');
            $(".colSaleCustField3").addClass('showColumn');
          } else {
            $(".colSaleCustField3").addClass('hiddenColumn');
            $(".colSaleCustField3").removeClass('showColumn');
          }
        }
      })
    }

    templateObject.getAllQuoteData = function () {

      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if ((currentBeginDate.getMonth() + 1) < 10) {
          fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
      } else {
          fromDateMonth = (currentBeginDate.getMonth() + 1);
      }

      if (currentBeginDate.getDate() < 10) {
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


        getVS1Data('TQuoteList').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllTQuoteListData(prevMonth11Date,toDate, false,initialReportLoad,0).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TQuoteList',JSON.stringify(data));
                    if (data.Params.IgnoreDates == true) {
                        $('#dateFrom').attr('readonly', true);
                        $('#dateTo').attr('readonly', true);
                        FlowRouter.go('/quoteslist?ignoredate=true');
                    } else {
                        $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                        $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                    }
                    for(let i=0; i<data.tquotelist.length; i++){
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmount)|| 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalTax) || 0.00;
                        // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmountInc)|| 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalPaid)|| 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalBalance)|| 0.00;
                        let salestatus = data.tquotelist[i].QuoteStatus || '';
                        if(data.tquotelist[i].Deleted == true){
                          salestatus = "Deleted";
                        }
                        var dataList = {
                            id: data.tquotelist[i].SaleID || '',
                            employee:data.tquotelist[i].EmployeeName || '',
                            sortdate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("YYYY/MM/DD"): data.tquotelist[i].SaleDate,
                            saledate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("DD/MM/YYYY"): data.tquotelist[i].SaleDate,
                            duedate: data.tquotelist[i].DueDate !=''? moment(data.tquotelist[i].DueDate).format("DD/MM/YYYY"): data.tquotelist[i].DueDate,
                            customername: data.tquotelist[i].CustomerName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            salestatus: salestatus || '',
                            custfield1: data.tquotelist[i].SaleCustField1 || '',
                            custfield2: data.tquotelist[i].SaleCustField2 || '',
                            custfield3: data.tquotelist[i].SaleCustField3|| '',
                            comments: data.tquotelist[i].Comments || '',
                            isConverted: data.tquotelist[i].Converted
                        };
                        //if(data.tquoteex[i].fields.CustomerName != ''){
                            dataTableList.push(dataList);
                        //}

                        // splashArray.push(dataList);
                        //}
                    }
                    templateObject.datatablerecords.set(dataTableList);
                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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


                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display','none');

                    setTimeout(function () {
                        $('#tblquotelist').DataTable({
                            columnDefs: [
                                {type: 'date', targets: 0}
                            ],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Quote List - "+ moment().format(),
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
                                    title: 'Quote List',
                                    filename: "Quote List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    }
                                }],
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialDatatableLoad,
                            "bLengthChange": false,
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ],[ 2, "desc" ]],
                            action: function () {
                                $('#tblquotelist').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblquotelist_ellipsis').addClass('disabled');

                              if(oSettings._iDisplayLength == -1){
                                if(oSettings.fnRecordsDisplay() > 150){
                                  $('.paginate_button.page-item.previous').addClass('disabled');
                                  $('.paginate_button.page-item.next').addClass('disabled');
                                }
                              }else{

                              }
                              if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }

                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                               .on('click', function(){
                                 $('.fullScreenSpin').css('display','inline-block');
                                 let dataLenght = oSettings._iDisplayLength;
                                 var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                 var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                 let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                 let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                 if(checkurlIgnoreDate == 'true'){
                                   sideBarService.getAllTQuoteListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                     getVS1Data('TQuoteList').then(function (dataObjectold) {
                                       if(dataObjectold.length == 0){

                                       }else{
                                         let dataOld = JSON.parse(dataObjectold[0].data);

                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                         let objCombineData = {
                                           Params: dataOld.Params,
                                           tquotelist:thirdaryData
                                         }


                                           addVS1Data('TQuoteList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                             templateObject.resetData(objCombineData);
                                           $('.fullScreenSpin').css('display','none');
                                           }).catch(function (err) {
                                           $('.fullScreenSpin').css('display','none');
                                           });

                                       }
                                      }).catch(function (err) {

                                      });

                                   }).catch(function(err) {
                                     $('.fullScreenSpin').css('display','none');
                                   });
                                 }else{
                                 sideBarService.getAllTQuoteListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                   getVS1Data('TQuoteList').then(function (dataObjectold) {
                                     if(dataObjectold.length == 0){

                                     }else{
                                       let dataOld = JSON.parse(dataObjectold[0].data);

                                       var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                       let objCombineData = {
                                         Params: dataOld.Params,
                                         tquotelist:thirdaryData
                                       }


                                         addVS1Data('TQuoteList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                           templateObject.resetData(objCombineData);
                                         $('.fullScreenSpin').css('display','none');
                                         }).catch(function (err) {
                                         $('.fullScreenSpin').css('display','none');
                                         });

                                     }
                                    }).catch(function (err) {

                                    });

                                 }).catch(function(err) {
                                   $('.fullScreenSpin').css('display','none');
                                 });
                               }
                               });

                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },
                             "fnInitComplete": function () {

                               let urlParametersPage = FlowRouter.current().queryParams.page;
                               if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                                   this.fnPageChange('last');
                               }
                             $("<button class='btn btn-primary btnRefreshQuoteList' type='button' id='btnRefreshQuoteList' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblquotelist_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                        }).on('page', function () {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        }).on( 'length.dt', function ( e, settings, len ) {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        });

                        // $('#tblquotelist').DataTable().column( 0 ).visible( true );
                        $('.fullScreenSpin').css('display','none');


                    }, 0);

                    var columns = $('#tblquotelist th');
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
                    $('#tblquotelist tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                        if(listData){
                          if(checkDeleted == "Deleted"){
                            swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                          }else{
                            FlowRouter.go('/quotecard?id=' + listData);
                          }
                        }
                    });

                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
                templateObject.getCustomFieldData();
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tquotelist;
                let lineItems = [];
                let lineItemObj = {};
                $('.fullScreenSpin').css('display','none');
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    FlowRouter.go('/quoteslist?ignoredate=true');
                } else {
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }
                for(let i=0; i<data.tquotelist.length; i++){
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmount)|| 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalTax) || 0.00;
                    // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmountInc)|| 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalPaid)|| 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalBalance)|| 0.00;
                    let salestatus = data.tquotelist[i].QuoteStatus || '';
                    if(data.tquotelist[i].Deleted == true){
                      salestatus = "Deleted";
                    }
                    var dataList = {
                        id: data.tquotelist[i].SaleID || '',
                        employee:data.tquotelist[i].EmployeeName || '',
                        sortdate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("YYYY/MM/DD"): data.tquotelist[i].SaleDate,
                        saledate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("DD/MM/YYYY"): data.tquotelist[i].SaleDate,
                        duedate: data.tquotelist[i].DueDate !=''? moment(data.tquotelist[i].DueDate).format("DD/MM/YYYY"): data.tquotelist[i].DueDate,
                        customername: data.tquotelist[i].CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: salestatus || '',
                        custfield1: data.tquotelist[i].SaleCustField1 || '',
                        custfield2: data.tquotelist[i].SaleCustField2 || '',
                        custfield3: data.tquotelist[i].SaleCustField3 || '',
                        comments: data.tquotelist[i].Comments || '',
                        isConverted: data.tquotelist[i].Converted
                    };
                    //if(data.tquoteex[i].fields.CustomerName != ''){
                        dataTableList.push(dataList);
                    //}

                    // splashArray.push(dataList);
                    //}
                }
                templateObject.datatablerecords.set(dataTableList);
                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');

                setTimeout(function () {
                    $('#tblquotelist').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Quote List - "+ moment().format(),
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
                                title: 'Quote List',
                                filename: "Quote List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        "bLengthChange": false,
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblquotelist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblquotelist_ellipsis').addClass('disabled');

                          if(oSettings._iDisplayLength == -1){
                            if(oSettings.fnRecordsDisplay() > 150){
                              $('.paginate_button.page-item.previous').addClass('disabled');
                              $('.paginate_button.page-item.next').addClass('disabled');
                            }
                          }else{

                          }
                          if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                           .on('click', function(){
                             $('.fullScreenSpin').css('display','inline-block');
                             let dataLenght = oSettings._iDisplayLength;
                             var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                             var dateTo = new Date($("#dateTo").datepicker("getDate"));

                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                             if(checkurlIgnoreDate == 'true'){
                               sideBarService.getAllTQuoteListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                 getVS1Data('TQuoteList').then(function (dataObjectold) {
                                   if(dataObjectold.length == 0){

                                   }else{
                                     let dataOld = JSON.parse(dataObjectold[0].data);

                                     var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                     let objCombineData = {
                                       Params: dataOld.Params,
                                       tquotelist:thirdaryData
                                     }


                                       addVS1Data('TQuoteList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                         templateObject.resetData(objCombineData);
                                       $('.fullScreenSpin').css('display','none');
                                       }).catch(function (err) {
                                       $('.fullScreenSpin').css('display','none');
                                       });

                                   }
                                  }).catch(function (err) {

                                  });

                               }).catch(function(err) {
                                 $('.fullScreenSpin').css('display','none');
                               });
                             }else{
                             sideBarService.getAllTQuoteListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TQuoteList').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                   let objCombineData = {
                                     Params: dataOld.Params,
                                     tquotelist:thirdaryData
                                   }


                                     addVS1Data('TQuoteList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }
                           });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                         "fnInitComplete": function () {

                           let urlParametersPage = FlowRouter.current().queryParams.page;
                           if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                               this.fnPageChange('last');
                           }
                         $("<button class='btn btn-primary btnRefreshQuoteList' type='button' id='btnRefreshQuoteList' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblquotelist_filter");
                         $('.myvarFilterForm').appendTo(".colDateFilter");
                     },
                     "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                       let countTableData = data.Params.Count || 0; //get count from API data

                         return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                     }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    }).on( 'length.dt', function ( e, settings, len ) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#tblquotelist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');


                }, 0);

                var columns = $('#tblquotelist th');
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
                $('#tblquotelist tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                    if(listData){
                      if(checkDeleted == "Deleted"){
                        swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                      }else{
                        FlowRouter.go('/quotecard?id=' + listData);
                      }
                    }
                });
                templateObject.getCustomFieldData();
            }
        }).catch(function (err) {
          sideBarService.getAllTQuoteListData(prevMonth11Date,toDate, false,initialReportLoad,0).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              addVS1Data('TQuoteList',JSON.stringify(data));
              if (data.Params.IgnoreDates == true) {
                  $('#dateFrom').attr('readonly', true);
                  $('#dateTo').attr('readonly', true);
                  FlowRouter.go('/quoteslist?ignoredate=true');
              } else {
                  $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                  $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
              }
              for(let i=0; i<data.tquotelist.length; i++){
                  let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmount)|| 0.00;
                  let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalTax) || 0.00;
                  // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                  let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmountInc)|| 0.00;
                  let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalPaid)|| 0.00;
                  let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalBalance)|| 0.00;
                  let salestatus = data.tquotelist[i].QuoteStatus || '';
                  if(data.tquotelist[i].Deleted == true){
                    salestatus = "Deleted";
                  }
                  var dataList = {
                      id: data.tquotelist[i].SaleID || '',
                      employee:data.tquotelist[i].EmployeeName || '',
                      sortdate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("YYYY/MM/DD"): data.tquotelist[i].SaleDate,
                      saledate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("DD/MM/YYYY"): data.tquotelist[i].SaleDate,
                      duedate: data.tquotelist[i].DueDate !=''? moment(data.tquotelist[i].DueDate).format("DD/MM/YYYY"): data.tquotelist[i].DueDate,
                      customername: data.tquotelist[i].CustomerName || '',
                      totalamountex: totalAmountEx || 0.00,
                      totaltax: totalTax || 0.00,
                      totalamount: totalAmount || 0.00,
                      totalpaid: totalPaid || 0.00,
                      totaloustanding: totalOutstanding || 0.00,
                      salestatus: salestatus || '',
                      custfield1: data.tquotelist[i].SaleCustField1 || '',
                      custfield2: data.tquotelist[i].SaleCustField2 || '',
                      custfield3: data.tquotelist[i].SaleCustField3 || '',
                      comments: data.tquotelist[i].Comments || '',
                      isConverted: data.tquotelist[i].Converted
                  };
                  //if(data.tquoteex[i].fields.CustomerName != ''){
                      dataTableList.push(dataList);
                  //}

                  // splashArray.push(dataList);
                  //}
              }
              templateObject.datatablerecords.set(dataTableList);
              if(templateObject.datatablerecords.get()){

                  Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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


                  setTimeout(function () {
                      MakeNegative();
                  }, 100);
              }

              $('.fullScreenSpin').css('display','none');

              setTimeout(function () {
                  $('#tblquotelist').DataTable({
                      columnDefs: [
                          {type: 'date', targets: 0}
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      buttons: [
                          {
                              extend: 'excelHtml5',
                              text: '',
                              download: 'open',
                              className: "btntabletocsv hiddenColumn",
                              filename: "Quote List - "+ moment().format(),
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
                              title: 'Quote List',
                              filename: "Quote List - "+ moment().format(),
                              exportOptions: {
                                  columns: ':visible',
                                  stripHtml: false
                              }
                          }],
                      // bStateSave: true,
                      // rowId: 0,
                      pageLength: initialDatatableLoad,
                      "bLengthChange": false,
                      info: true,
                      responsive: true,
                      "order": [[ 0, "desc" ],[ 2, "desc" ]],
                      action: function () {
                          $('#tblquotelist').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                        let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblquotelist_ellipsis').addClass('disabled');

                        if(oSettings._iDisplayLength == -1){
                          if(oSettings.fnRecordsDisplay() > 150){
                            $('.paginate_button.page-item.previous').addClass('disabled');
                            $('.paginate_button.page-item.next').addClass('disabled');
                          }
                        }else{

                        }
                        if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                         .on('click', function(){
                           $('.fullScreenSpin').css('display','inline-block');
                           let dataLenght = oSettings._iDisplayLength;
                           var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                           var dateTo = new Date($("#dateTo").datepicker("getDate"));

                           let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                           let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                           if(checkurlIgnoreDate == 'true'){
                             sideBarService.getAllTQuoteListData(formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TQuoteList').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                   let objCombineData = {
                                     Params: dataOld.Params,
                                     tquotelist:thirdaryData
                                   }


                                     addVS1Data('TQuoteList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }else{
                           sideBarService.getAllTQuoteListData(formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                             getVS1Data('TQuoteList').then(function (dataObjectold) {
                               if(dataObjectold.length == 0){

                               }else{
                                 let dataOld = JSON.parse(dataObjectold[0].data);

                                 var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                 let objCombineData = {
                                   Params: dataOld.Params,
                                   tquotelist:thirdaryData
                                 }


                                   addVS1Data('TQuoteList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                     templateObject.resetData(objCombineData);
                                   $('.fullScreenSpin').css('display','none');
                                   }).catch(function (err) {
                                   $('.fullScreenSpin').css('display','none');
                                   });

                               }
                              }).catch(function (err) {

                              });

                           }).catch(function(err) {
                             $('.fullScreenSpin').css('display','none');
                           });
                         }
                         });

                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                       "fnInitComplete": function () {

                         let urlParametersPage = FlowRouter.current().queryParams.page;
                         if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                             this.fnPageChange('last');
                         }
                       $("<button class='btn btn-primary btnRefreshQuoteList' type='button' id='btnRefreshQuoteList' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblquotelist_filter");
                       $('.myvarFilterForm').appendTo(".colDateFilter");
                   },
                   "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                     let countTableData = data.Params.Count || 0; //get count from API data

                       return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                   }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                      let draftRecord = templateObject.datatablerecords.get();
                      templateObject.datatablerecords.set(draftRecord);
                  }).on('column-reorder', function () {

                  }).on( 'length.dt', function ( e, settings, len ) {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });

                  // $('#tblquotelist').DataTable().column( 0 ).visible( true );
                  $('.fullScreenSpin').css('display','none');


              }, 0);

              var columns = $('#tblquotelist th');
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
              $('#tblquotelist tbody').on( 'click', 'tr', function () {
                  var listData = $(this).closest('tr').attr('id');
                  var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                  if(listData){
                    if(checkDeleted == "Deleted"){
                      swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                    }else{
                      FlowRouter.go('/quotecard?id=' + listData);
                    }
                  }
              });

          }).catch(function (err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $('.fullScreenSpin').css('display','none');
              // Meteor._reload.reload();
          });
          templateObject.getCustomFieldData();
        });
    };

    templateObject.getAllQuoteFilterData = function (converted) {

      var currentBeginDate = new Date();
      var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
      let fromDateMonth = (currentBeginDate.getMonth() + 1);
      let fromDateDay = currentBeginDate.getDate();
      if ((currentBeginDate.getMonth() + 1) < 10) {
          fromDateMonth = "0" + (currentBeginDate.getMonth() + 1);
      } else {
          fromDateMonth = (currentBeginDate.getMonth() + 1);
      }

      if (currentBeginDate.getDate() < 10) {
          fromDateDay = "0" + currentBeginDate.getDate();
      }
      var toDate = currentBeginDate.getFullYear() + "-" + (fromDateMonth) + "-" + (fromDateDay);
      let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");


      getVS1Data('TQuoteFilterList').then(function (dataObject) {
            if(dataObject.length == 0){
                sideBarService.getAllTQuoteListFilterData(converted,prevMonth11Date,toDate, false,initialReportLoad,0).then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TQuoteFilterList',JSON.stringify(data));
                    if (data.Params.IgnoreDates == true) {
                        $('#dateFrom').attr('readonly', true);
                        $('#dateTo').attr('readonly', true);
                        if (FlowRouter.current().queryParams.converted == true) {
                          FlowRouter.go('/quoteslist?converted=true');
                        }else {
                          FlowRouter.go('/quoteslist?converted=false');
                        }

                    } else {
                        $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                        $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                    }
                    for(let i=0; i<data.tquotelist.length; i++){
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmount)|| 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalTax) || 0.00;
                        // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmountInc)|| 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalPaid)|| 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalBalance)|| 0.00;
                        let salestatus = data.tquotelist[i].QuoteStatus || '';
                        if(data.tquotelist[i].Deleted == true){
                          salestatus = "Deleted";
                        }
                        var dataList = {
                            id: data.tquotelist[i].SaleID || '',
                            employee:data.tquotelist[i].EmployeeName || '',
                            sortdate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("YYYY/MM/DD"): data.tquotelist[i].SaleDate,
                            saledate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("DD/MM/YYYY"): data.tquotelist[i].SaleDate,
                            duedate: data.tquotelist[i].DueDate !=''? moment(data.tquotelist[i].DueDate).format("DD/MM/YYYY"): data.tquotelist[i].DueDate,
                            customername: data.tquotelist[i].CustomerName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            salestatus: salestatus || '',
                            custfield1: data.tquotelist[i].SaleCustField1 || '',
                            custfield2: data.tquotelist[i].SaleCustField2 || '',
                            comments: data.tquotelist[i].Comments || '',
                            isConverted: data.tquotelist[i].Converted
                        };
                        //if(data.tquoteex[i].fields.CustomerName != ''){
                            dataTableList.push(dataList);
                        //}

                        // splashArray.push(dataList);
                        //}
                    }
                    templateObject.datatablerecords.set(dataTableList);
                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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


                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    }

                    $('.fullScreenSpin').css('display','none');

                    setTimeout(function () {
                        $('#tblquotelist').DataTable({
                            columnDefs: [
                                {type: 'date', targets: 0}
                            ],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Quote List - "+ moment().format(),
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
                                    title: 'Quote List',
                                    filename: "Quote List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    }
                                }],
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialDatatableLoad,
                            "bLengthChange": false,
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ],[ 2, "desc" ]],
                            action: function () {
                                $('#tblquotelist').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function (oSettings) {
                              let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                              $('.paginate_button.page-item').removeClass('disabled');
                              $('#tblquotelist_ellipsis').addClass('disabled');

                              if(oSettings._iDisplayLength == -1){
                                if(oSettings.fnRecordsDisplay() > 150){
                                  $('.paginate_button.page-item.previous').addClass('disabled');
                                  $('.paginate_button.page-item.next').addClass('disabled');
                                }
                              }else{

                              }
                              if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                                  $('.paginate_button.page-item.next').addClass('disabled');
                              }

                              $('.paginate_button.next:not(.disabled)', this.api().table().container())
                               .on('click', function(){
                                 $('.fullScreenSpin').css('display','inline-block');
                                 let dataLenght = oSettings._iDisplayLength;
                                 var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                                 var dateTo = new Date($("#dateTo").datepicker("getDate"));

                                 let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                                 let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                                 if(checkurlIgnoreDate == 'true'){
                                   sideBarService.getAllTQuoteListFilterData(converted,formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                     getVS1Data('TQuoteFilterList').then(function (dataObjectold) {
                                       if(dataObjectold.length == 0){

                                       }else{
                                         let dataOld = JSON.parse(dataObjectold[0].data);

                                         var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                         let objCombineData = {
                                           Params: dataOld.Params,
                                           tquotelist:thirdaryData
                                         }


                                           addVS1Data('TQuoteFilterList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                             templateObject.resetData(objCombineData);
                                           $('.fullScreenSpin').css('display','none');
                                           }).catch(function (err) {
                                           $('.fullScreenSpin').css('display','none');
                                           });

                                       }
                                      }).catch(function (err) {

                                      });

                                   }).catch(function(err) {
                                     $('.fullScreenSpin').css('display','none');
                                   });
                                 }else{
                                 sideBarService.getAllTQuoteListFilterData(converted,formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                   getVS1Data('TQuoteFilterList').then(function (dataObjectold) {
                                     if(dataObjectold.length == 0){

                                     }else{
                                       let dataOld = JSON.parse(dataObjectold[0].data);

                                       var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                       let objCombineData = {
                                         Params: dataOld.Params,
                                         tquotelist:thirdaryData
                                       }


                                         addVS1Data('TQuoteFilterList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                           templateObject.resetData(objCombineData);
                                         $('.fullScreenSpin').css('display','none');
                                         }).catch(function (err) {
                                         $('.fullScreenSpin').css('display','none');
                                         });

                                     }
                                    }).catch(function (err) {

                                    });

                                 }).catch(function(err) {
                                   $('.fullScreenSpin').css('display','none');
                                 });
                               }
                               });

                                setTimeout(function () {
                                    MakeNegative();
                                }, 100);
                            },
                             "fnInitComplete": function () {

                               let urlParametersPage = FlowRouter.current().queryParams.page;
                               if (urlParametersPage || FlowRouter.current().queryParams.ignoredate) {
                                   this.fnPageChange('last');
                               }
                             $("<button class='btn btn-primary btnRefreshQuoteList' type='button' id='btnRefreshQuoteList' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblquotelist_filter");
                             $('.myvarFilterForm').appendTo(".colDateFilter");
                         },
                         "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                           let countTableData = data.Params.Count || 0; //get count from API data

                             return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                         }

                        }).on('page', function () {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        }).on( 'length.dt', function ( e, settings, len ) {
                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        });

                        // $('#tblquotelist').DataTable().column( 0 ).visible( true );
                        $('.fullScreenSpin').css('display','none');


                    }, 0);

                    var columns = $('#tblquotelist th');
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
                    $('#tblquotelist tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                        if(listData){
                          if(checkDeleted == "Deleted"){
                            swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                          }else{
                            FlowRouter.go('/quotecard?id=' + listData);
                          }
                        }
                    });

                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tquotelist;
                let lineItems = [];
                let lineItemObj = {};
                $('.fullScreenSpin').css('display','none');
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                    if (FlowRouter.current().queryParams.converted == true) {
                      FlowRouter.go('/quoteslist?converted=true&page=last');
                    }else {
                      FlowRouter.go('/quoteslist?converted=false&page=last');
                    }
                } else {
                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }
                for(let i=0; i<data.tquotelist.length; i++){
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmount)|| 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalTax) || 0.00;
                    // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmountInc)|| 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalPaid)|| 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalBalance)|| 0.00;
                    let salestatus = data.tquotelist[i].QuoteStatus || '';
                    if(data.tquotelist[i].Deleted == true){
                      salestatus = "Deleted";
                    }
                    var dataList = {
                        id: data.tquotelist[i].SaleID || '',
                        employee:data.tquotelist[i].EmployeeName || '',
                        sortdate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("YYYY/MM/DD"): data.tquotelist[i].SaleDate,
                        saledate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("DD/MM/YYYY"): data.tquotelist[i].SaleDate,
                        duedate: data.tquotelist[i].DueDate !=''? moment(data.tquotelist[i].DueDate).format("DD/MM/YYYY"): data.tquotelist[i].DueDate,
                        customername: data.tquotelist[i].CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: salestatus || '',
                        custfield1: data.tquotelist[i].SaleCustField1 || '',
                        custfield2: data.tquotelist[i].SaleCustField2 || '',
                        comments: data.tquotelist[i].Comments || '',
                        isConverted: data.tquotelist[i].Converted
                    };
                    //if(data.tquoteex[i].fields.CustomerName != ''){
                        dataTableList.push(dataList);
                    //}

                    // splashArray.push(dataList);
                    //}
                }
                templateObject.datatablerecords.set(dataTableList);
                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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


                    setTimeout(function () {
                        MakeNegative();
                    }, 100);
                }

                $('.fullScreenSpin').css('display','none');

                setTimeout(function () {
                    $('#tblquotelist').DataTable({
                        columnDefs: [
                            {type: 'date', targets: 0}
                        ],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Quote List - "+ moment().format(),
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
                                title: 'Quote List',
                                filename: "Quote List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            }],
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        "bLengthChange": false,
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ],[ 2, "desc" ]],
                        action: function () {
                            $('#tblquotelist').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function (oSettings) {
                          let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                          $('.paginate_button.page-item').removeClass('disabled');
                          $('#tblquotelist_ellipsis').addClass('disabled');

                          if(oSettings._iDisplayLength == -1){
                            if(oSettings.fnRecordsDisplay() > 150){
                              $('.paginate_button.page-item.previous').addClass('disabled');
                              $('.paginate_button.page-item.next').addClass('disabled');
                            }
                          }else{

                          }
                          if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                              $('.paginate_button.page-item.next').addClass('disabled');
                          }

                          $('.paginate_button.next:not(.disabled)', this.api().table().container())
                           .on('click', function(){
                             $('.fullScreenSpin').css('display','inline-block');
                             let dataLenght = oSettings._iDisplayLength;
                             var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                             var dateTo = new Date($("#dateTo").datepicker("getDate"));

                             let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                             let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                             if(checkurlIgnoreDate == 'true'){
                               sideBarService.getAllTQuoteListFilterData(converted,formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                                 getVS1Data('TQuoteFilterList').then(function (dataObjectold) {
                                   if(dataObjectold.length == 0){

                                   }else{
                                     let dataOld = JSON.parse(dataObjectold[0].data);

                                     var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                     let objCombineData = {
                                       Params: dataOld.Params,
                                       tquotelist:thirdaryData
                                     }


                                       addVS1Data('TQuoteFilterList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                         templateObject.resetData(objCombineData);
                                       $('.fullScreenSpin').css('display','none');
                                       }).catch(function (err) {
                                       $('.fullScreenSpin').css('display','none');
                                       });

                                   }
                                  }).catch(function (err) {

                                  });

                               }).catch(function(err) {
                                 $('.fullScreenSpin').css('display','none');
                               });
                             }else{
                             sideBarService.getAllTQuoteListFilterData(converted,formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TQuoteFilterList').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                   let objCombineData = {
                                     Params: dataOld.Params,
                                     tquotelist:thirdaryData
                                   }


                                     addVS1Data('TQuoteFilterList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }
                           });

                            setTimeout(function () {
                                MakeNegative();
                            }, 100);
                        },
                         "fnInitComplete": function () {

                           let urlParametersPage = FlowRouter.current().queryParams.page;
                           if (urlParametersPage || FlowRouter.current().queryParams.ignoredate||FlowRouter.current().queryParams.converted) {
                               this.fnPageChange('last');
                           }
                         $("<button class='btn btn-primary btnRefreshQuoteList' type='button' id='btnRefreshQuoteList' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblquotelist_filter");
                         $('.myvarFilterForm').appendTo(".colDateFilter");
                     },
                     "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                       let countTableData = data.Params.Count || 0; //get count from API data

                         return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                     }

                    }).on('page', function () {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    }).on( 'length.dt', function ( e, settings, len ) {
                        setTimeout(function () {
                            MakeNegative();
                        }, 100);
                    });

                    // $('#tblquotelist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');


                }, 0);

                var columns = $('#tblquotelist th');
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
                $('#tblquotelist tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                    if(listData){
                      if(checkDeleted == "Deleted"){
                        swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                      }else{
                        FlowRouter.go('/quotecard?id=' + listData);
                      }
                    }
                });
            }
        }).catch(function (err) {
          sideBarService.getAllTQuoteListFilterData(converted,prevMonth11Date,toDate, false,initialReportLoad,0).then(function (data) {
              let lineItems = [];
              let lineItemObj = {};
              addVS1Data('TQuoteFilterList',JSON.stringify(data));
              if (data.Params.IgnoreDates == true) {
                  $('#dateFrom').attr('readonly', true);
                  $('#dateTo').attr('readonly', true);
                  if (FlowRouter.current().queryParams.converted == true) {
                    FlowRouter.go('/quoteslist?converted=true');
                  }else {
                    FlowRouter.go('/quoteslist?converted=false');
                  }
              } else {
                  $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                  $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
              }
              for(let i=0; i<data.tquotelist.length; i++){
                  let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmount)|| 0.00;
                  let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalTax) || 0.00;
                  // Currency+''+data.tinvoice[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                  let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalAmountInc)|| 0.00;
                  let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalPaid)|| 0.00;
                  let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquotelist[i].TotalBalance)|| 0.00;
                  let salestatus = data.tquotelist[i].QuoteStatus || '';
                  if(data.tquotelist[i].Deleted == true){
                    salestatus = "Deleted";
                  }
                  var dataList = {
                      id: data.tquotelist[i].SaleID || '',
                      employee:data.tquotelist[i].EmployeeName || '',
                      sortdate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("YYYY/MM/DD"): data.tquotelist[i].SaleDate,
                      saledate: data.tquotelist[i].SaleDate !=''? moment(data.tquotelist[i].SaleDate).format("DD/MM/YYYY"): data.tquotelist[i].SaleDate,
                      duedate: data.tquotelist[i].DueDate !=''? moment(data.tquotelist[i].DueDate).format("DD/MM/YYYY"): data.tquotelist[i].DueDate,
                      customername: data.tquotelist[i].CustomerName || '',
                      totalamountex: totalAmountEx || 0.00,
                      totaltax: totalTax || 0.00,
                      totalamount: totalAmount || 0.00,
                      totalpaid: totalPaid || 0.00,
                      totaloustanding: totalOutstanding || 0.00,
                      salestatus: salestatus || '',
                      custfield1: data.tquotelist[i].SaleCustField1 || '',
                      custfield2: data.tquotelist[i].SaleCustField2 || '',
                      comments: data.tquotelist[i].Comments || '',
                      isConverted: data.tquotelist[i].Converted
                  };
                  //if(data.tquoteex[i].fields.CustomerName != ''){
                      dataTableList.push(dataList);
                  //}

                  // splashArray.push(dataList);
                  //}
              }
              templateObject.datatablerecords.set(dataTableList);
              if(templateObject.datatablerecords.get()){

                  Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblquotelist', function(error, result){
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


                  setTimeout(function () {
                      MakeNegative();
                  }, 100);
              }

              $('.fullScreenSpin').css('display','none');

              setTimeout(function () {
                  $('#tblquotelist').DataTable({
                      columnDefs: [
                          {type: 'date', targets: 0}
                      ],
                      select: true,
                      destroy: true,
                      colReorder: true,
                      "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                      buttons: [
                          {
                              extend: 'excelHtml5',
                              text: '',
                              download: 'open',
                              className: "btntabletocsv hiddenColumn",
                              filename: "Quote List - "+ moment().format(),
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
                              title: 'Quote List',
                              filename: "Quote List - "+ moment().format(),
                              exportOptions: {
                                  columns: ':visible',
                                  stripHtml: false
                              }
                          }],
                      // bStateSave: true,
                      // rowId: 0,
                      pageLength: initialDatatableLoad,
                      "bLengthChange": false,
                      info: true,
                      responsive: true,
                      "order": [[ 0, "desc" ],[ 2, "desc" ]],
                      action: function () {
                          $('#tblquotelist').DataTable().ajax.reload();
                      },
                      "fnDrawCallback": function (oSettings) {
                        let checkurlIgnoreDate = FlowRouter.current().queryParams.ignoredate;

                        $('.paginate_button.page-item').removeClass('disabled');
                        $('#tblquotelist_ellipsis').addClass('disabled');

                        if(oSettings._iDisplayLength == -1){
                          if(oSettings.fnRecordsDisplay() > 150){
                            $('.paginate_button.page-item.previous').addClass('disabled');
                            $('.paginate_button.page-item.next').addClass('disabled');
                          }
                        }else{

                        }
                        if(oSettings.fnRecordsDisplay() < initialDatatableLoad){
                            $('.paginate_button.page-item.next').addClass('disabled');
                        }

                        $('.paginate_button.next:not(.disabled)', this.api().table().container())
                         .on('click', function(){
                           $('.fullScreenSpin').css('display','inline-block');
                           let dataLenght = oSettings._iDisplayLength;
                           var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
                           var dateTo = new Date($("#dateTo").datepicker("getDate"));

                           let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
                           let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();
                           if(checkurlIgnoreDate == 'true'){
                             sideBarService.getAllTQuoteListFilterData(converted,formatDateFrom, formatDateTo, true, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                               getVS1Data('TQuoteFilterList').then(function (dataObjectold) {
                                 if(dataObjectold.length == 0){

                                 }else{
                                   let dataOld = JSON.parse(dataObjectold[0].data);

                                   var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                   let objCombineData = {
                                     Params: dataOld.Params,
                                     tquotelist:thirdaryData
                                   }


                                     addVS1Data('TQuoteFilterList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                       templateObject.resetData(objCombineData);
                                     $('.fullScreenSpin').css('display','none');
                                     }).catch(function (err) {
                                     $('.fullScreenSpin').css('display','none');
                                     });

                                 }
                                }).catch(function (err) {

                                });

                             }).catch(function(err) {
                               $('.fullScreenSpin').css('display','none');
                             });
                           }else{
                           sideBarService.getAllTQuoteListFilterData(converted,formatDateFrom, formatDateTo, false, initialDatatableLoad, oSettings.fnRecordsDisplay()).then(function(dataObjectnew) {
                             getVS1Data('TQuoteFilterList').then(function (dataObjectold) {
                               if(dataObjectold.length == 0){

                               }else{
                                 let dataOld = JSON.parse(dataObjectold[0].data);

                                 var thirdaryData = $.merge($.merge([], dataObjectnew.tquotelist), dataOld.tquotelist);
                                 let objCombineData = {
                                   Params: dataOld.Params,
                                   tquotelist:thirdaryData
                                 }


                                   addVS1Data('TQuoteFilterList',JSON.stringify(objCombineData)).then(function (datareturn) {
                                     templateObject.resetData(objCombineData);
                                   $('.fullScreenSpin').css('display','none');
                                   }).catch(function (err) {
                                   $('.fullScreenSpin').css('display','none');
                                   });

                               }
                              }).catch(function (err) {

                              });

                           }).catch(function(err) {
                             $('.fullScreenSpin').css('display','none');
                           });
                         }
                         });

                          setTimeout(function () {
                              MakeNegative();
                          }, 100);
                      },
                       "fnInitComplete": function () {

                         let urlParametersPage = FlowRouter.current().queryParams.page;
                         if (urlParametersPage || FlowRouter.current().queryParams.ignoredate||FlowRouter.current().queryParams.converted) {
                             this.fnPageChange('last');
                         }
                       $("<button class='btn btn-primary btnRefreshQuoteList' type='button' id='btnRefreshQuoteList' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblquotelist_filter");
                       $('.myvarFilterForm').appendTo(".colDateFilter");
                   },
                   "fnInfoCallback": function (oSettings, iStart, iEnd, iMax, iTotal, sPre) {
                     let countTableData = data.Params.Count || 0; //get count from API data

                       return 'Showing '+ iStart + " to " + iEnd + " of " + countTableData;
                   }

                  }).on('page', function () {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                      let draftRecord = templateObject.datatablerecords.get();
                      templateObject.datatablerecords.set(draftRecord);
                  }).on('column-reorder', function () {

                  }).on( 'length.dt', function ( e, settings, len ) {
                      setTimeout(function () {
                          MakeNegative();
                      }, 100);
                  });

                  // $('#tblquotelist').DataTable().column( 0 ).visible( true );
                  $('.fullScreenSpin').css('display','none');


              }, 0);

              var columns = $('#tblquotelist th');
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
              $('#tblquotelist tbody').on( 'click', 'tr', function () {
                  var listData = $(this).closest('tr').attr('id');
                  var checkDeleted = $(this).closest('tr').find('.colStatus').text() || '';
                  if(listData){
                    if(checkDeleted == "Deleted"){
                      swal('You Cannot View This Transaction', 'Because It Has Been Deleted', 'info');
                    }else{
                      FlowRouter.go('/quotecard?id=' + listData);
                    }
                  }
              });

          }).catch(function (err) {
              // Bert.alert('<strong>' + err + '</strong>!', 'danger');
              $('.fullScreenSpin').css('display','none');
              // Meteor._reload.reload();
          });
        });
    }

    if (FlowRouter.current().queryParams.converted) {
      if(FlowRouter.current().queryParams.page){

      }else{
      addVS1Data('TQuoteFilterList', []);
      }
      setTimeout(function () {
        let checkConverted = FlowRouter.current().queryParams.converted || false;
        templateObject.getAllQuoteFilterData(checkConverted);
      }, 500);
    }else{
      templateObject.getAllQuoteData();
    }



    templateObject.getAllFilterQuoteData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getAllTQuoteListData(fromDate, toDate, ignoreDate,initialReportLoad,0).then(function(data) {
            addVS1Data('TQuoteList', JSON.stringify(data)).then(function(datareturn) {
                window.open('/quoteslist?toDate=' + toDate + '&fromDate=' + fromDate + '&ignoredate=' + ignoreDate, '_self');
            }).catch(function(err) {
                location.reload();
            });
        }).catch(function(err) {
            $('.fullScreenSpin').css('display', 'none');
        });
    }

    let urlParametersDateFrom = FlowRouter.current().queryParams.fromDate;
    let urlParametersDateTo = FlowRouter.current().queryParams.toDate;
    let urlParametersIgnoreDate = FlowRouter.current().queryParams.ignoredate;
    if (urlParametersDateFrom) {
        if (urlParametersIgnoreDate == true) {
            $('#dateFrom').attr('readonly', true);
            $('#dateTo').attr('readonly', true);
        } else {

            $("#dateFrom").val(urlParametersDateFrom != '' ? moment(urlParametersDateFrom).format("DD/MM/YYYY") : urlParametersDateFrom);
            $("#dateTo").val(urlParametersDateTo != '' ? moment(urlParametersDateTo).format("DD/MM/YYYY") : urlParametersDateTo);
        }
    }

});



Template.quoteslist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.saledate == 'NA') {
                return 1;
            }
            else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
            // return (a.saledate.toUpperCase() < b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblquotelist'});
    }

});

Template.quoteslist.events({
    'click #btnNewQuote':function(event){
        FlowRouter.go('/quotecard');
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblquotelist th');
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
     'keyup #tblquotelist_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshQuoteList").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshQuoteList").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshQuoteList").trigger("click");
          }
        },
        'blur #tblInventory_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshQuoteList").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshQuoteList").removeClass('btnSearchAlert');
          }

        },
    'click .btnRefreshQuoteList':function(event){
        let templateObject = Template.instance();
        let utilityService = new UtilityService();
        let tableProductList;
        const dataTableList = [];
        var splashArrayInvoiceList = new Array();
        const lineExtaSellItems = [];
        $('.fullScreenSpin').css('display', 'inline-block');
        let dataSearchName = $('#tblquotelist_filter input').val();
        if (dataSearchName.replace(/\s/g, '') != '') {
            sideBarService.getNewQuoteByNameOrID(dataSearchName).then(function (data) {
                $(".btnRefreshQuoteList_filter").removeClass('btnSearchAlert');
                let lineItems = [];
                let lineItemObj = {};
                if (data.tquoteex.length > 0) {
                    for (let i = 0; i < data.tquoteex.length; i++) {
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tquoteex[i].fields.TotalAmount) || 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tquoteex[i].fields.TotalTax) || 0.00;
                        // Currency+''+data.tquoteex[i].fields.TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tquoteex[i].fields.TotalAmountInc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tquoteex[i].fields.TotalPaid) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tquoteex[i].fields.TotalBalance) || 0.00;
                        let salestatus = data.tquoteex[i].fields.SalesStatus || '';
                        if(data.tquoteex[i].fields.Deleted == true){
                          salestatus = "Deleted";
                        }else if(data.tquoteex[i].fields.CustomerName == ''){
                          salestatus = "Deleted";
                        };
                        var dataList = {
                            id: data.tquoteex[i].fields.ID || '',
                            employee: data.tquoteex[i].fields.EmployeeName || '',
                            sortdate: data.tquoteex[i].fields.SaleDate != '' ? moment(data.tquoteex[i].fields.SaleDate).format("YYYY/MM/DD") : data.tquoteex[i].fields.SaleDate,
                            saledate: data.tquoteex[i].fields.SaleDate != '' ? moment(data.tquoteex[i].fields.SaleDate).format("DD/MM/YYYY") : data.tquoteex[i].fields.SaleDate,
                            duedate: data.tquoteex[i].fields.DueDate != '' ? moment(data.tquoteex[i].fields.DueDate).format("DD/MM/YYYY") : data.tquoteex[i].fields.DueDate,
                            customername: data.tquoteex[i].fields.CustomerName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            salestatus: salestatus || '',
                            custfield1: data.tquoteex[i].fields.SaleCustField1 || '',
                            custfield2: data.tquoteex[i].fields.SaleCustField2 || '',
                            comments: data.tquoteex[i].fields.Comments || '',
                            isConverted: data.tquoteex[i].fields.Converted
                            // shipdate:data.tquoteex[i].fields.ShipDate !=''? moment(data.tquoteex[i].fields.ShipDate).format("DD/MM/YYYY"): data.tquoteex[i].fields.ShipDate,

                        };

                        //if(data.tquoteex[i].fields.Deleted == false){
                        //splashArrayInvoiceList.push(dataList);
                        dataTableList.push(dataList);
                        //}


                        //}
                    }
                    templateObject.datatablerecords.set(dataTableList);
                    let item = templateObject.datatablerecords.get();
                    $('.fullScreenSpin').css('display', 'none');
                    if (dataTableList) {
                        var datatable = $('#tblquotelist').DataTable();
                        $("#tblquotelist > tbody").empty();
                        for (let x = 0; x < item.length; x++) {
                          let setConvertData = '<td class="colConverted" style="background-color: #f6c23e !important; color:#fff">Unconverted</td>';

                          if(item[x].isConverted == true){
                            setConvertData = '<td class="colConverted" style="background-color: #1cc88a !important; color:#fff">Converted</td>';
                          };
                            $("#tblquotelist > tbody").append(
                                ' <tr class="dnd-moved" id="' + item[x].id + '" style="cursor: pointer;">' +
                                '<td contenteditable="false" class="colSortDate hiddenColumn">' + item[x].sortdate + '</td>' +
                                '<td contenteditable="false" class="colSaleDate" ><span style="display:none;">' + item[x].sortdate + '</span>' + item[x].saledate + '</td>' +
                                '<td contenteditable="false" class="colSalesNo">' + item[x].id + '</td>' +
                                '<td contenteditable="false" class="colDueDate" >' + item[x].duedate + '</td>' +
                                '<td contenteditable="false" class="colCustomer">' + item[x].customername + '</td>' +
                                '<td contenteditable="false" class="colAmountEx" style="text-align: right!important;">' + item[x].totalamountex + '</td>' +
                                '<td contenteditable="false" class="colTax" style="text-align: right!important;">' + item[x].totaltax + '</td>' +
                                '<td contenteditable="false" class="colAmount" style="text-align: right!important;">' + item[x].totalamount + '</td>' +
                                // '<td contenteditable="false" class="colPaid" style="text-align: right!important;">' + item[x].totalpaid + '</td>' +

                                '<td contenteditable="false" class="colStatus">' + item[x].salestatus + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField1 hiddenColumn">' + item[x].custfield1 + '</td>' +
                                '<td contenteditable="false" class="colSaleCustField2 hiddenColumn">' + item[x].custfield2 + '</td>' +
                                '<td contenteditable="false" class="colEmployee hiddenColumn">' + item[x].employee + '</td>' +
                                setConvertData +
                                '<td contenteditable="false" class="colComments">' + item[x].comments + '</td>' +
                                '</tr>');

                        }
                        $('.dataTables_info').html('Showing 1 to ' + data.tquoteex.length + ' of ' + data.tquoteex.length + ' entries');

                    }

                } else {
                    $('.fullScreenSpin').css('display', 'none');

                    swal({
                        title: 'Question',
                        text: "Quote does not exist, would you like to create it?",
                        type: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Yes',
                        cancelButtonText: 'No'
                    }).then((result) => {
                        if (result.value) {
                            FlowRouter.go('/quotecard');
                        } else if (result.dismiss === 'cancel') {
                            //$('#productListModal').modal('toggle');
                        }
                    });
                }
            }).catch(function (err) {
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
          $(".btnRefresh").trigger("click");
        }
       // $(".btnRefresh").trigger("click");
    },
    'click .resetTable' : function(event){
        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblquotelist'});
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

        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblquotelist'});
                if (checkPrefDetails) {
                    CloudPreference.update({_id: checkPrefDetails._id},{$set: { userid: clientID,username:clientUsername,useremail:clientEmail,
                                                                               PrefGroup:'salesform',PrefName:'tblquotelist',published:true,
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
                                            PrefGroup:'salesform',PrefName:'tblquotelist',published:true,
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

    },
    'blur .divcolumn' : function(event){
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        var datable = $('#tblquotelist').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblquotelist th');
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
        var columns = $('#tblquotelist th');

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
        jQuery('#tblquotelist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .printConfirm' : function(event){

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
                    if (formIds.includes("71")) {
                        reportData.FormID = 71;
                        Meteor.call('sendNormalEmail', reportData);
                    }
                } else {
                    if (reportData.FormID == 71)
                        Meteor.call('sendNormalEmail', reportData);
                }
            }
        });

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblquotelist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    },
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        let currentDate = new Date();
        let hours = currentDate.getHours(); //returns 0-23
        let minutes = currentDate.getMinutes(); //returns 0-59
        let seconds = currentDate.getSeconds(); //returns 0-59
        let month = (currentDate.getMonth()+1);
        let days = currentDate.getDate();

        if((currentDate.getMonth()+1) < 10){
            month = "0" + (currentDate.getMonth()+1);
        }

        if(currentDate.getDate() < 10){
            days = "0" + currentDate.getDate();
        }
        let currenctTodayDate = currentDate.getFullYear() + "-" + month + "-" + days + " "+ hours+ ":"+ minutes+ ":"+ seconds;
        let templateObject = Template.instance();

        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDate = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        let prevMonth11Date = (moment().subtract(reportsloadMonths, 'months')).format("YYYY-MM-DD");

        sideBarService.getAllTQuoteListData(prevMonth11Date,toDate, false,initialReportLoad,0).then(function(dataQuote) {
            addVS1Data('TQuoteList',JSON.stringify(dataQuote)).then(function (datareturn) {
              sideBarService.getAllQuoteList(initialDataLoad,0).then(function(data) {
                  addVS1Data('TQuote',JSON.stringify(data)).then(function (datareturn) {
                      window.open('/quoteslist','_self');
                  }).catch(function (err) {
                      window.open('/quoteslist','_self');
                  });
              }).catch(function(err) {
                  window.open('/quoteslist','_self');
              });
            }).catch(function (err) {
              sideBarService.getAllQuoteList(initialDataLoad,0).then(function(data) {
                  addVS1Data('TQuote',JSON.stringify(data)).then(function (datareturn) {
                      window.open('/quoteslist','_self');
                  }).catch(function (err) {
                      window.open('/quoteslist','_self');
                  });
              }).catch(function(err) {
                  window.open('/quoteslist','_self');
              });
            });
        }).catch(function(err) {
            window.open('/quoteslist','_self');
        });


    },
    'change #dateTo': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterQuoteData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'change #dateFrom': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        setTimeout(function(){
        var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
        var dateTo = new Date($("#dateTo").datepicker("getDate"));

        let formatDateFrom = dateFrom.getFullYear() + "-" + (dateFrom.getMonth() + 1) + "-" + dateFrom.getDate();
        let formatDateTo = dateTo.getFullYear() + "-" + (dateTo.getMonth() + 1) + "-" + dateTo.getDate();

        //  templateObject.getAgedPayableReports(formatDateFrom,formatDateTo,false);
        var formatDate = dateTo.getDate() + "/" + (dateTo.getMonth() + 1) + "/" + dateTo.getFullYear();
        //templateObject.dateAsAt.set(formatDate);
        if (($("#dateFrom").val().replace(/\s/g, '') == "") && ($("#dateFrom").val().replace(/\s/g, '') == "")) {

        } else {
            templateObject.getAllFilterQuoteData(formatDateFrom, formatDateTo, false);
        }
        },500);
    },
    'click #today': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterQuoteData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastweek': function () {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
        var currentBeginDate = new Date();
        var begunDate = moment(currentBeginDate).format("DD/MM/YYYY");
        let fromDateMonth = (currentBeginDate.getMonth() + 1);
        let fromDateDay = currentBeginDate.getDate();
        if((currentBeginDate.getMonth()+1) < 10){
            fromDateMonth = "0" + (currentBeginDate.getMonth()+1);
        }else{
          fromDateMonth = (currentBeginDate.getMonth()+1);
        }

        if(currentBeginDate.getDate() < 10){
            fromDateDay = "0" + currentBeginDate.getDate();
        }
        var toDateERPFrom = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay - 7);
        var toDateERPTo = currentBeginDate.getFullYear()+ "-" +(fromDateMonth) + "-"+(fromDateDay);

        var toDateDisplayFrom = (fromDateDay -7)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();
        var toDateDisplayTo = (fromDateDay)+ "/" +(fromDateMonth) + "/"+currentBeginDate.getFullYear();

        $("#dateFrom").val(toDateDisplayFrom);
        $("#dateTo").val(toDateDisplayTo);
        templateObject.getAllFilterQuoteData(toDateERPFrom,toDateERPTo, false);
    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
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
        templateObject.getAllFilterQuoteData(getDateFrom, getLoadDate, false);
    },
    'click #lastQuarter': function() {
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
        templateObject.getAllFilterQuoteData(getDateFrom, getLoadDate, false);
    },
    'click #last12Months': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
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
        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        if ((currentDate2.getMonth() + 1) < 10) {
            fromDateMonth2 = "0" + Math.floor(currentDate2.getMonth() + 1);
        }
        if (currentDate2.getDate() < 10) {
            fromDateDay2 = "0" + currentDate2.getDate();
        }
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = Math.floor(currentDate2.getFullYear() - 1) + "-" + fromDateMonth2 + "-" + currentDate2.getDate();
        templateObject.getAllFilterQuoteData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterQuoteData('', '', true);
    },



});
