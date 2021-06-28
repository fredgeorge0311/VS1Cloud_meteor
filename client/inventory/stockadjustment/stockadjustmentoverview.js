import {StockTransferService} from "../stockadjust-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../../js/core-service';

import {UtilityService} from "../../utility-service";
import { SideBarService } from '../../js/sidebar-service';
import '../../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.stockadjustmentoverview.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.stockadjustmentoverview.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let stockTransferService = new StockTransferService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];

    if(Router.current().params.query.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }

    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockAdjustOverview', function(error, result){
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
    };
    // $('#tblStockAdjustOverview').DataTable();
    templateObject.getAllStockAdjustEntryData = function () {
        getVS1Data('TStockAdjustEntry').then(function (dataObject) {
            if(dataObject.length == 0){
                stockTransferService.getAllStockAdjustEntry().then(function (data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    for(let i=0; i<data.tstockadjustentry.length; i++){

                        let totalCostEx = utilityService.modifynegativeCurrencyFormat(data.tstockadjustentry[i].TotalCostEx)|| 0.00;
                        var dataList = {
                            id: data.tstockadjustentry[i].Id || '',
                            employee:data.tstockadjustentry[i].Employee || '',
                            sortdate: data.tstockadjustentry[i].CreationDate !=''? moment(data.tstockadjustentry[i].CreationDate).format("YYYY/MM/DD"): data.tstockadjustentry[i].CreationDate,
                            creationdate: data.tstockadjustentry[i].CreationDate !=''? moment(data.tstockadjustentry[i].CreationDate).format("DD/MM/YYYY"): data.tstockadjustentry[i].CreationDate,
                            adjustmentdate: data.tstockadjustentry[i].AdjustmentDate !=''? moment(data.tstockadjustentry[i].AdjustmentDate).format("DD/MM/YYYY"): data.tstockadjustentry[i].AdjustmentDate,
                            accountname: data.tstockadjustentry[i].AccountName || '',
                            totalcostex: totalCostEx || 0.00,
                            custfield1: '',
                            custfield2: '',
                            notes: data.tstockadjustentry[i].Notes || '',
                            processed: data.tstockadjustentry[i].Processed,
                            isstocktake: data.tstockadjustentry[i].IsStockTake,
                        };
                        dataTableList.push(dataList);
                    }

                    templateObject.datatablerecords.set(dataTableList);
                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockAdjustOverview', function(error, result){
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
                        //$.fn.dataTable.moment('DD/MM/YY');
                        $('#tblStockAdjustOverview').DataTable({
                            // dom: 'lBfrtip',
                            columnDefs: [
                                {type: 'date', targets: 0}
                                // ,
                                // { targets: 0, className: "text-center" }

                            ],
                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'excelHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Stock Adjustment List - "+ moment().format(),
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
                                    title: 'Stock Adjust Overview',
                                    filename: "Stock Adjustment List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    },
                                    // customize: function ( win ) {
                                    //     $(win.document.body)
                                    //         .css( 'font-size', '10pt' )
                                    //         .prepend(
                                    //             '<img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                                    //         );
                                    //
                                    //     $(win.document.body).find( 'table' )
                                    //         .addClass( 'compact' )
                                    //         .css( 'font-size', 'inherit' );
                                    // }
                                }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: 25,
                            lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
                            info: true,
                            responsive: true,
                            "order": [[ 0, "desc" ]],
                            // "aaSorting": [[1,'desc']],
                            action: function () {
                                $('#tblStockAdjustOverview').DataTable().ajax.reload();
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
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        });
                        $('.fullScreenSpin').css('display','none');
                    }, 0);

                    var columns = $('#tblStockAdjustOverview th');
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
                    $('#tblStockAdjustOverview tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        if(listData){
                            window.open('/stockadjustmentcard?id=' + listData,'_self');
                        }
                    });

                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tstockadjustentry;
                let lineItems = [];
                let lineItemObj = {};
                for(let i=0; i<useData.length; i++){

                    let totalCostEx = utilityService.modifynegativeCurrencyFormat(useData[i].fields.TotalCostEx)|| 0.00;
                    var dataList = {
                        id: useData[i].fields.ID || '',
                        employee:useData[i].fields.Employee || '',
                        sortdate: useData[i].fields.CreationDate !=''? moment(useData[i].fields.CreationDate).format("YYYY/MM/DD"): useData[i].fields.CreationDate,
                        creationdate: useData[i].fields.CreationDate !=''? moment(useData[i].fields.CreationDate).format("DD/MM/YYYY"): useData[i].fields.CreationDate,
                        adjustmentdate: useData[i].fields.AdjustmentDate !=''? moment(useData[i].fields.AdjustmentDate).format("DD/MM/YYYY"): useData[i].fields.AdjustmentDate,
                        accountname: useData[i].fields.AccountName || '',
                        totalcostex: totalCostEx || 0.00,
                        custfield1: '',
                        custfield2: '',
                        notes: useData[i].fields.Notes || '',
                        processed: useData[i].fields.Processed,
                        isstocktake: useData[i].fields.IsStockTake,
                    };
                    dataTableList.push(dataList);
                }

                templateObject.datatablerecords.set(dataTableList);
                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockAdjustOverview', function(error, result){
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
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblStockAdjustOverview').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [
                            {type: 'date', targets: 0}
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Stock Adjustment List - "+ moment().format(),
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
                                title: 'Stock Adjust Overview',
                                filename: "Stock Adjustment List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                },
                                // customize: function ( win ) {
                                //     $(win.document.body)
                                //         .css( 'font-size', '10pt' )
                                //         .prepend(
                                //             '<img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                                //         );
                                //
                                //     $(win.document.body).find( 'table' )
                                //         .addClass( 'compact' )
                                //         .css( 'font-size', 'inherit' );
                                // }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: 25,
                        lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblStockAdjustOverview').DataTable().ajax.reload();
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
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblStockAdjustOverview th');
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
                $('#tblStockAdjustOverview tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    if(listData){
                        Router.go('/stockadjustmentcard?id=' + listData);
                    }
                });


            }
        }).catch(function (err) {
            stockTransferService.getAllStockAdjustEntry().then(function (data) {
                let lineItems = [];
                let lineItemObj = {};
                for(let i=0; i<data.tstockadjustentry.length; i++){

                    let totalCostEx = utilityService.modifynegativeCurrencyFormat(data.tstockadjustentry[i].TotalCostEx)|| 0.00;
                    var dataList = {
                        id: data.tstockadjustentry[i].Id || '',
                        employee:data.tstockadjustentry[i].Employee || '',
                        sortdate: data.tstockadjustentry[i].CreationDate !=''? moment(data.tstockadjustentry[i].CreationDate).format("YYYY/MM/DD"): data.tstockadjustentry[i].CreationDate,
                        creationdate: data.tstockadjustentry[i].CreationDate !=''? moment(data.tstockadjustentry[i].CreationDate).format("DD/MM/YYYY"): data.tstockadjustentry[i].CreationDate,
                        adjustmentdate: data.tstockadjustentry[i].AdjustmentDate !=''? moment(data.tstockadjustentry[i].AdjustmentDate).format("DD/MM/YYYY"): data.tstockadjustentry[i].AdjustmentDate,
                        accountname: data.tstockadjustentry[i].AccountName || '',
                        totalcostex: totalCostEx || 0.00,
                        custfield1: '',
                        custfield2: '',
                        notes: data.tstockadjustentry[i].Notes || '',
                        processed: data.tstockadjustentry[i].Processed,
                        isstocktake: data.tstockadjustentry[i].IsStockTake,
                    };
                    dataTableList.push(dataList);
                }

                templateObject.datatablerecords.set(dataTableList);
                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblStockAdjustOverview', function(error, result){
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
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblStockAdjustOverview').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [
                            {type: 'date', targets: 0}
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Stock Adjustment List - "+ moment().format(),
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
                                title: 'Stock Adjust Overview',
                                filename: "Stock Adjustment List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                },
                                // customize: function ( win ) {
                                //     $(win.document.body)
                                //         .css( 'font-size', '10pt' )
                                //         .prepend(
                                //             '<img src="http://datatables.net/media/images/logo-fade.png" style="position:absolute; top:0; left:0;" />'
                                //         );
                                //
                                //     $(win.document.body).find( 'table' )
                                //         .addClass( 'compact' )
                                //         .css( 'font-size', 'inherit' );
                                // }
                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: 25,
                        lengthMenu: [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 0, "desc" ]],
                        // "aaSorting": [[1,'desc']],
                        action: function () {
                            $('#tblStockAdjustOverview').DataTable().ajax.reload();
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
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblStockAdjustOverview th');
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
                $('#tblStockAdjustOverview tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    if(listData){
                        window.open('/stockadjustmentcard?id=' + listData,'_self');
                    }
                });

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });

    }

    templateObject.getAllStockAdjustEntryData();

});

Template.stockadjustmentoverview.events({
    'click .btnRefresh': function () {
        $('.fullScreenSpin').css('display','inline-block');
        sideBarService.getAllStockAdjustEntry().then(function(data) {
            addVS1Data('TStockAdjustEntry',JSON.stringify(data)).then(function (datareturn) {
                window.open('/stockadjustmentoverview','_self');
            }).catch(function (err) {
                window.open('/stockadjustmentoverview','_self');
            });
        }).catch(function(err) {
            window.open('/stockadjustmentoverview','_self');
        });
    },
    'click .btnnewstockadjustment' : function(event){
        Router.go('/stockadjustmentcard');
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblStockAdjustOverview th');
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
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblStockAdjustOverview'});
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
        //let datatable =$('#tblStockAdjustOverview').DataTable();
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
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblStockAdjustOverview'});
                if (checkPrefDetails) {
                    CloudPreference.update({_id: checkPrefDetails._id},{$set: { userid: clientID,username:clientUsername,useremail:clientEmail,
                                                                               PrefGroup:'salesform',PrefName:'tblStockAdjustOverview',published:true,
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
                                            PrefGroup:'salesform',PrefName:'tblStockAdjustOverview',published:true,
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

        var datable = $('#tblStockAdjustOverview').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblStockAdjustOverview th');
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
        var columns = $('#tblStockAdjustOverview th');

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
        jQuery('#tblStockAdjustOverview_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .printConfirm' : function(event){

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblStockAdjustOverview_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
        // $('#html-2-pdfwrapper').css('display','block');
        // var pdf =  new jsPDF('portrait','mm','a4');
        // //new jsPDF('p', 'pt', 'a4');
        //   pdf.setFontSize(18);
        //   var source = document.getElementById('html-2-pdfwrapper');
        //   pdf.addHTML(source, function () {
        //      pdf.save('stockadjustmentoverview.pdf');
        //      $('#html-2-pdfwrapper').css('display','none');
        //  });
    }


});
Template.stockadjustmentoverview.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.creationdate == 'NA') {
                return 1;
            }
            else if (b.creationdate == 'NA') {
                return -1;
            }
            return (a.creationdate.toUpperCase() > b.creationdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblStockAdjustOverview'});
    },
    currentdate : () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    }
});
