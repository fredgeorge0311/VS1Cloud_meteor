import {
    SalesBoardService
} from '../js/sales-service';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    CoreService
} from '../js/core-service';
import {
    EmployeeProfileService
} from "../js/profile-service";
import {
    AccountService
} from "../accounts/account-service";
import {
    UtilityService
} from "../utility-service";
import {
    SideBarService
} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.salesoverview.onCreated(function() {
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
});

Template.salesoverview.onRendered(function() {
    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    let accountService = new AccountService();
    let salesService = new SalesBoardService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];


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
    });

    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblSalesOverview', function(error, result) {
        if (error) {

        } else {
            if (result) {

                for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split('.')[1];
                    let columnWidth = customcolumn[i].width;
                    // let columnindex = customcolumn[i].index + 1;
                    $("th." + columnClass + "").html(columData);
                    $("th." + columnClass + "").css('width', "" + columnWidth + "px");

                }
            }

        }
    });

    function MakeNegative() {
        $('td').each(function() {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    };
    // $('#tblSalesOverview').DataTable();
    templateObject.getAllSalesOrderData = function() {
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


        getVS1Data('TSalesList').then(function(dataObject) {
            if (dataObject.length == 0) {
                sideBarService.getSalesListData(prevMonth11Date, toDate, false).then(function(data) {
                    let lineItems = [];
                    let lineItemObj = {};
                    addVS1Data('TSalesList', JSON.stringify(data));
                    for (let i = 0; i < data.tsaleslist.length; i++) {
                        let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmount) || 0.00;
                        let totalTax = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalTax) || 0.00;
                        // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                        let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                        let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                        let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                        var dataList = {
                            id: data.tsaleslist[i].SaleId || '',
                            employee: data.tsaleslist[i].employeename || '',
                            sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                            saledate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                            customername: data.tsaleslist[i].CustomerName || '',
                            totalamountex: totalAmountEx || 0.00,
                            totaltax: totalTax || 0.00,
                            totalamount: totalAmount || 0.00,
                            totalpaid: totalPaid || 0.00,
                            totaloustanding: totalOutstanding || 0.00,
                            salestatus: data.tsaleslist[i].Status || '',
                            custfield1: '',
                            custfield2: '',
                            comments: data.tsaleslist[i].Comments || '',
                            type: data.tsaleslist[i].Type || '',
                        };
                        //if(data.tsaleslist[i].Deleted == false){
                        dataTableList.push(dataList);
                        //}

                    }
                    templateObject.datatablerecords.set(dataTableList);
                    if (templateObject.datatablerecords.get()) {

                        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblSalesOverview', function(error, result) {
                            if (error) {

                            } else {
                                if (result) {
                                    for (let i = 0; i < result.customFields.length; i++) {
                                        let customcolumn = result.customFields;
                                        let columData = customcolumn[i].label;
                                        let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                        let hiddenColumn = customcolumn[i].hidden;
                                        let columnClass = columHeaderUpdate.split('.')[1];
                                        let columnWidth = customcolumn[i].width;
                                        let columnindex = customcolumn[i].index + 1;

                                        if (hiddenColumn == true) {

                                            $("." + columnClass + "").addClass('hiddenColumn');
                                            $("." + columnClass + "").removeClass('showColumn');
                                        } else if (hiddenColumn == false) {
                                            $("." + columnClass + "").removeClass('hiddenColumn');
                                            $("." + columnClass + "").addClass('showColumn');
                                        }

                                    }
                                }

                            }
                        });


                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                    }


                    setTimeout(function() {
                        $('.fullScreenSpin').css('display', 'none');
                        //$.fn.dataTable.moment('DD/MM/YY');
                        $('#tblSalesOverview').DataTable({
                            // dom: 'lBfrtip',
                            columnDefs: [{
                                    type: 'date',
                                    targets: 0
                                }
                                // ,
                                // { targets: 0, className: "text-center" }

                            ],
                            "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [{
                                extend: 'excelHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Sales Overview List - " + moment().format(),
                                orientation: 'portrait',
                                exportOptions: {
                                    columns: ':visible',
                                    format: {
                                        body: function(data, row, column) {
                                            if (data.includes("</span>")) {
                                                var res = data.split("</span>");
                                                data = res[1];
                                            }

                                            return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                        }
                                    }
                                }
                            }, {
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Sales Overview',
                                filename: "Sales Overview List - " + moment().format(),
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
                            pageLength: initialReportDatatableLoad,
                            "bLengthChange": false,
                            searching: true,
                            lengthMenu: [
                                [initialReportDatatableLoad, -1],
                                [initialReportDatatableLoad, "All"]
                            ],
                            info: true,
                            responsive: true,
                            "order": [
                                [0, "desc"],
                                [2, "desc"]
                            ],
                            // "aaSorting": [[1,'desc']],
                            action: function() {
                                $('#tblSalesOverview').DataTable().ajax.reload();
                            },
                            "fnDrawCallback": function(oSettings) {
                                setTimeout(function() {
                                    MakeNegative();
                                }, 100);
                            },
                            "fnInitComplete": function () {
                                let urlParametersPage = FlowRouter.current().queryParams.page;
                                if (urlParametersPage) {
                                    this.fnPageChange('last');
                                }
                                $("<button class='btn btn-primary btnRefreshSalesOverview' type='button' id='btnRefreshSalesOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSalesOverview_filter");

                                $('.myvarFilterForm').appendTo(".colDateFilter");
                            }

                        }).on('page', function() {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function() {

                        });

                    }, 0);

                    var columns = $('#tblSalesOverview th');
                    let sTible = "";
                    let sWidth = "";
                    let sIndex = "";
                    let sVisible = "";
                    let columVisible = false;
                    let sClass = "";
                    $.each(columns, function(i, v) {
                        if (v.hidden == false) {
                            columVisible = true;
                        }
                        if ((v.className.includes("hiddenColumn"))) {
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

                }).catch(function(err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                if (data.Params.IgnoreDates == true) {
                    $('#dateFrom').attr('readonly', true);
                    $('#dateTo').attr('readonly', true);
                } else {

                    $("#dateFrom").val(data.Params.DateFrom != '' ? moment(data.Params.DateFrom).format("DD/MM/YYYY") : data.Params.DateFrom);
                    $("#dateTo").val(data.Params.DateTo != '' ? moment(data.Params.DateTo).format("DD/MM/YYYY") : data.Params.DateTo);
                }

                let useData = data.tsaleslist;
                let lineItems = [];
                let lineItemObj = {};

                $('.fullScreenSpin').css('display', 'none');
                for (let i = 0; i < useData.length; i++) {
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(useData[i].TotalAmount) || 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(useData[i].TotalTax) || 0.00;
                    // Currency+''+useData[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(useData[i].TotalAmountinc) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(useData[i].Payment) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(useData[i].Balance) || 0.00;
                    var dataList = {
                        id: useData[i].SaleId || '',
                        employee: useData[i].employeename || '',
                        sortdate: useData[i].SaleDate != '' ? moment(useData[i].SaleDate).format("YYYY/MM/DD") : useData[i].SaleDate,
                        saledate: useData[i].SaleDate != '' ? moment(useData[i].SaleDate).format("DD/MM/YYYY") : useData[i].SaleDate,
                        customername: useData[i].CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: useData[i].Status || '',
                        custfield1: '',
                        custfield2: '',
                        comments: useData[i].Comments || '',
                        type: useData[i].Type || '',
                    };
                    //if(useData[i].Deleted == false){
                    dataTableList.push(dataList);
                    //}

                }
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblSalesOverview', function(error, result) {
                        if (error) {

                        } else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }


                setTimeout(function() {
                    $('.fullScreenSpin').css('display', 'none');
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblSalesOverview').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [{
                                type: 'date',
                                targets: 0
                            }
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Sales Overview List - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible',
                                format: {
                                    body: function(data, row, column) {
                                        if (data.includes("</span>")) {
                                            var res = data.split("</span>");
                                            data = res[1];
                                        }

                                        return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                    }
                                }
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Sales Overview',
                            filename: "Sales Overview List - " + moment().format(),
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
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,
                        searching: true,
                        lengthMenu: [
                            [initialReportDatatableLoad, -1],
                            [initialReportDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "desc"],
                            [2, "desc"]
                        ],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblSalesOverview').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                            let urlParametersPage = FlowRouter.current().queryParams.page;
                            if (urlParametersPage) {
                                this.fnPageChange('last');
                            }
                            $("<button class='btn btn-primary btnRefreshSalesOverview' type='button' id='btnRefreshSalesOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSalesOverview_filter");

                            $('.myvarFilterForm').appendTo(".colDateFilter");
                        }

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function() {

                    });

                }, 0);

                var columns = $('#tblSalesOverview th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
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


            }
        }).catch(function(err) {
            sideBarService.getSalesListData(prevMonth11Date, toDate, false).then(function(data) {
                let lineItems = [];
                let lineItemObj = {};
                addVS1Data('TSalesList', JSON.stringify(data));
                for (let i = 0; i < data.tsaleslist.length; i++) {
                    let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmount) || 0.00;
                    let totalTax = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalTax) || 0.00;
                    // Currency+''+data.tsaleslist[i].TotalTax.toLocaleString(undefined, {minimumFractionDigits: 2});
                    let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].TotalAmountinc) || 0.00;
                    let totalPaid = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Payment) || 0.00;
                    let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tsaleslist[i].Balance) || 0.00;
                    var dataList = {
                        id: data.tsaleslist[i].SaleId || '',
                        employee: data.tsaleslist[i].employeename || '',
                        sortdate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("YYYY/MM/DD") : data.tsaleslist[i].SaleDate,
                        saledate: data.tsaleslist[i].SaleDate != '' ? moment(data.tsaleslist[i].SaleDate).format("DD/MM/YYYY") : data.tsaleslist[i].SaleDate,
                        customername: data.tsaleslist[i].CustomerName || '',
                        totalamountex: totalAmountEx || 0.00,
                        totaltax: totalTax || 0.00,
                        totalamount: totalAmount || 0.00,
                        totalpaid: totalPaid || 0.00,
                        totaloustanding: totalOutstanding || 0.00,
                        salestatus: data.tsaleslist[i].Status || '',
                        custfield1: '',
                        custfield2: '',
                        comments: data.tsaleslist[i].Comments || '',
                        type: data.tsaleslist[i].Type || '',
                    };
                    //if(data.tsaleslist[i].Deleted == false){
                    dataTableList.push(dataList);
                    //}

                }
                templateObject.datatablerecords.set(dataTableList);
                if (templateObject.datatablerecords.get()) {

                    Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'tblSalesOverview', function(error, result) {
                        if (error) {

                        } else {
                            if (result) {
                                for (let i = 0; i < result.customFields.length; i++) {
                                    let customcolumn = result.customFields;
                                    let columData = customcolumn[i].label;
                                    let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                                    let hiddenColumn = customcolumn[i].hidden;
                                    let columnClass = columHeaderUpdate.split('.')[1];
                                    let columnWidth = customcolumn[i].width;
                                    let columnindex = customcolumn[i].index + 1;

                                    if (hiddenColumn == true) {

                                        $("." + columnClass + "").addClass('hiddenColumn');
                                        $("." + columnClass + "").removeClass('showColumn');
                                    } else if (hiddenColumn == false) {
                                        $("." + columnClass + "").removeClass('hiddenColumn');
                                        $("." + columnClass + "").addClass('showColumn');
                                    }

                                }
                            }

                        }
                    });


                    setTimeout(function() {
                        MakeNegative();
                    }, 100);
                }


                setTimeout(function() {
                    $('.fullScreenSpin').css('display', 'none');
                    //$.fn.dataTable.moment('DD/MM/YY');
                    $('#tblSalesOverview').DataTable({
                        // dom: 'lBfrtip',
                        columnDefs: [{
                                type: 'date',
                                targets: 0
                            }
                            // ,
                            // { targets: 0, className: "text-center" }

                        ],
                        "sDom": "<'row'><'row'<'col-sm-12 col-lg-6'f><'col-sm-12 col-lg-6 colDateFilter'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [{
                            extend: 'excelHtml5',
                            text: '',
                            download: 'open',
                            className: "btntabletocsv hiddenColumn",
                            filename: "Sales Overview List - " + moment().format(),
                            orientation: 'portrait',
                            exportOptions: {
                                columns: ':visible',
                                format: {
                                    body: function(data, row, column) {
                                        if (data.includes("</span>")) {
                                            var res = data.split("</span>");
                                            data = res[1];
                                        }

                                        return column === 1 ? data.replace(/<.*?>/ig, "") : data;

                                    }
                                }
                            }
                        }, {
                            extend: 'print',
                            download: 'open',
                            className: "btntabletopdf hiddenColumn",
                            text: '',
                            title: 'Sales Overview',
                            filename: "Sales Overview List - " + moment().format(),
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
                        pageLength: initialReportDatatableLoad,
                        "bLengthChange": false,
                        searching: true,
                        lengthMenu: [
                            [initialReportDatatableLoad, -1],
                            [initialReportDatatableLoad, "All"]
                        ],
                        info: true,
                        responsive: true,
                        "order": [
                            [0, "desc"],
                            [2, "desc"]
                        ],
                        // "aaSorting": [[1,'desc']],
                        action: function() {
                            $('#tblSalesOverview').DataTable().ajax.reload();
                        },
                        "fnDrawCallback": function(oSettings) {
                            setTimeout(function() {
                                MakeNegative();
                            }, 100);
                        },
                        "fnInitComplete": function () {
                            let urlParametersPage = FlowRouter.current().queryParams.page;
                            if (urlParametersPage) {
                                this.fnPageChange('last');
                            }
                            $("<button class='btn btn-primary btnRefreshSalesOverview' type='button' id='btnRefreshSalesOverview' style='padding: 4px 10px; font-size: 16px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblSalesOverview_filter");

                            $('.myvarFilterForm').appendTo(".colDateFilter");
                        }

                    }).on('page', function() {
                        setTimeout(function() {
                            MakeNegative();
                        }, 100);
                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function() {

                    });

                }, 0);

                var columns = $('#tblSalesOverview th');
                let sTible = "";
                let sWidth = "";
                let sIndex = "";
                let sVisible = "";
                let columVisible = false;
                let sClass = "";
                $.each(columns, function(i, v) {
                    if (v.hidden == false) {
                        columVisible = true;
                    }
                    if ((v.className.includes("hiddenColumn"))) {
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

            }).catch(function(err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });

        $('#tblSalesOverview tbody').on('click', 'tr', function() {
            var listData = $(this).closest('tr').attr('id');

            var transactiontype = $(event.target).closest("tr").find(".colType").text();
            if ((listData) && (transactiontype)) {
                if (transactiontype === 'Invoice') {
                    FlowRouter.go('/invoicecard?id=' + listData);
                } else if (transactiontype === 'Quote') {
                    FlowRouter.go('/quotecard?id=' + listData);
                } else if (transactiontype === 'Sales Order') {
                    FlowRouter.go('/salesordercard?id=' + listData);
                } else if (transactiontype === 'Refund') {
                    FlowRouter.go('/refundcard?id=' + listData);
                } else {
                    //FlowRouter.go('/purchaseordercard?id=' + listData);
                }

            }
        });
    }

    templateObject.getAllSalesOrderData();

    templateObject.getAllFilterSalesOrderData = function(fromDate, toDate, ignoreDate) {
        sideBarService.getSalesListData(fromDate, toDate, ignoreDate).then(function(data) {

            addVS1Data('TSalesList', JSON.stringify(data)).then(function(datareturn) {
                window.open('/salesoverview?toDate=' + toDate + '&fromDate=' + fromDate + '&ignoredate=' + ignoreDate, '_self');
            }).catch(function(err) {
                location.reload();
            });

        }).catch(function(err) {
            // Bert.alert('<strong>' + err + '</strong>!', 'danger');
            templateObject.datatablerecords.set('');
            $('.fullScreenSpin').css('display', 'none');
            // Meteor._reload.reload();
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

Template.salesoverview.events({
    'click .btnRefresh': function() {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
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

        sideBarService.getSalesListData(prevMonth11Date, toDate, false).then(function(data) {
            addVS1Data('TSalesList', JSON.stringify(data)).then(function(datareturn) {
                window.open('/salesoverview', '_self');
            }).catch(function(err) {
                window.open('/salesoverview', '_self');
            });
        }).catch(function(err) {
            window.open('/salesoverview', '_self');
        });

        sideBarService.getAllInvoiceList(initialDataLoad, 0).then(function(data) {
            addVS1Data('TInvoiceEx', JSON.stringify(data)).then(function(datareturn) {
                //Meteor._reload.reload();
            }).catch(function(err) {
                //Meteor._reload.reload();
            });
        }).catch(function(err) {
            //Meteor._reload.reload();
        });
    },
    'change #dateTo': function() {
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
            templateObject.getAllFilterSalesOrderData(formatDateFrom, formatDateTo, false);
        }

    },
    'change #dateFrom': function() {
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
            templateObject.getAllFilterSalesOrderData(formatDateFrom, formatDateTo, false);
        }

    },
    'click #lastMonth': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', false);
        $('#dateTo').attr('readonly', false);
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

        $("#dateFrom").val(fromDate);
        $("#dateTo").val(begunDate);

        var currentDate2 = new Date();
        var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
        let getDateFrom = currentDate2.getFullYear() + "-" + (fromDateMonth) + "-" + fromDateDay;
        templateObject.getAllFilterSalesOrderData(getDateFrom, getLoadDate, false);
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
        templateObject.getAllFilterSalesOrderData(getDateFrom, getLoadDate, false);
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
        templateObject.getAllFilterSalesOrderData(getDateFrom, getLoadDate, false);

    },
    'click #ignoreDate': function() {
        let templateObject = Template.instance();
        $('.fullScreenSpin').css('display', 'inline-block');
        $('#dateFrom').attr('readonly', true);
        $('#dateTo').attr('readonly', true);
        templateObject.getAllFilterSalesOrderData('', '', true);
    },
    'click .feeOnTopInput': function(event) {
        if ($(event.target).is(':checked')) {
            $('.feeInPriceInput').attr('checked', false);
        }
    },
    'click .feeInPriceInput': function(event) {
        if ($(event.target).is(':checked')) {
            $('.feeOnTopInput').attr('checked', false);
        }
    },
    'click #newSalesOrder': function(event) {
        FlowRouter.go('/salesordercard');
    },
    'click .salesOrderList': function(event) {
        FlowRouter.go('/salesorderslist');
    },
    'click #newInvoice': function(event) {
        FlowRouter.go('/invoicecard');
    },
    'click #newRefund': function(event) {
        FlowRouter.go('/refundcard');
    },
    'click .invoiceList': function(event) {
        FlowRouter.go('/invoicelist');
    },
    'click .invoiceListBO': function(event) {
        FlowRouter.go('/invoicelistBO');
    },
    'click #newQuote': function(event) {
        FlowRouter.go('/quotecard');
    },
    'click .QuoteList': function(event) {
        FlowRouter.go('/quoteslist');
    },
    'click .btnTaxRateSettings': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/taxratesettings');
    },
    'click .btnTermsSettings': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/termsettings');
    },
    'click .btnCurrencySettings': function(event) {
        $('.modal-backdrop').css('display', 'none');
        FlowRouter.go('/currenciesSettings');
    },
    'click .chkDatatable': function(event) {
        var columns = $('#tblSalesOverview th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();

        $.each(columns, function(i, v) {
            let className = v.classList;
            let replaceClass = className[1];

            if (v.innerText == columnDataValue) {
                if ($(event.target).is(':checked')) {
                    $("." + replaceClass + "").css('display', 'table-cell');
                    $("." + replaceClass + "").css('padding', '.75rem');
                    $("." + replaceClass + "").css('vertical-align', 'top');
                } else {
                    $("." + replaceClass + "").css('display', 'none');
                }
            }
        });
    },
    'click .resetTable': function(event) {
        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblSalesOverview'
                });
                if (checkPrefDetails) {
                    CloudPreference.remove({
                        _id: checkPrefDetails._id
                    }, function(err, idTag) {
                        if (err) {

                        } else {
                            Meteor._reload.reload();
                        }
                    });

                }
            }
        }
    },
    'click .saveTable': function(event) {
        let lineItems = [];
        //let datatable =$('#tblSalesOverview').DataTable();
        $('.columnSettings').each(function(index) {
            var $tblrow = $(this);
            var colTitle = $tblrow.find(".divcolumn").text() || '';
            var colWidth = $tblrow.find(".custom-range").val() || 0;
            var colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            var colHidden = false;
            if ($tblrow.find(".custom-control-input").is(':checked')) {
                colHidden = false;
            } else {
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

        var getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({
                    userid: clientID,
                    PrefName: 'tblSalesOverview'
                });
                if (checkPrefDetails) {
                    CloudPreference.update({
                        _id: checkPrefDetails._id
                    }, {
                        $set: {
                            userid: clientID,
                            username: clientUsername,
                            useremail: clientEmail,
                            PrefGroup: 'salesform',
                            PrefName: 'tblSalesOverview',
                            published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function(err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID,
                        username: clientUsername,
                        useremail: clientEmail,
                        PrefGroup: 'salesform',
                        PrefName: 'tblSalesOverview',
                        published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function(err, idTag) {
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
    'blur .divcolumn': function(event) {
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblSalesOverview').DataTable();
        var title = datable.column(columnDatanIndex).header();
        $(title).html(columData);

    },
    'change .rngRange': function(event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblSalesOverview th');
        $.each(datable, function(i, v) {

            if (v.innerText == columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');

            }
        });

    },
    'click .btnOpenSettings': function(event) {
        let templateObject = Template.instance();
        var columns = $('#tblSalesOverview th');

        const tableHeaderList = [];
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function(i, v) {
            if (v.hidden == false) {
                columVisible = true;
            }
            if ((v.className.includes("hiddenColumn"))) {
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
    'click #exportbtn': function() {

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblSalesOverview_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');

    },
    'click .printConfirm': function(event) {

        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblSalesOverview_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
        // $('#html-2-pdfwrapper').css('display','block');
        // var pdf =  new jsPDF('portrait','mm','a4');
        // //new jsPDF('p', 'pt', 'a4');
        //   pdf.setFontSize(18);
        //   var source = document.getElementById('html-2-pdfwrapper');
        //   pdf.addHTML(source, function () {
        //      pdf.save('salesoverview.pdf');
        //      $('#html-2-pdfwrapper').css('display','none');
        //  });
    },
    'click .close': function(event) {
        var vid = document.getElementById("myVideo");
        vid.pause();
    }


});
Template.salesoverview.helpers({
    datatablerecords: () => {
        return Template.instance().datatablerecords.get().sort(function(a, b) {
            if (a.saledate == 'NA') {
                return 1;
            } else if (b.saledate == 'NA') {
                return -1;
            }
            return (a.saledate.toUpperCase() > b.saledate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({
            userid: Session.get('mycloudLogonID'),
            PrefName: 'tblSalesOverview'
        });
    },
    currentdate: () => {
        var currentDate = new Date();
        var begunDate = moment(currentDate).format("DD/MM/YYYY");
        return begunDate;
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});
