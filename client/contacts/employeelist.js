import {ContactService} from "./contact-service";
import { ReactiveVar } from 'meteor/reactive-var';
import { CoreService } from '../js/core-service';
import {UtilityService} from "../utility-service";
import XLSX from 'xlsx';
import { SideBarService } from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';
let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.employeelist.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);

    templateObject.selectedFile = new ReactiveVar();
});

Template.employeelist.onRendered(function() {
    $('.fullScreenSpin').css('display','inline-block');
    let templateObject = Template.instance();
    let contactService = new ContactService();
    const customerList = [];
    let salesOrderTable;
    var splashArray = new Array();
    const dataTableList = [];
    const tableHeaderList = [];
    if(FlowRouter.current().queryParams.success){
        $('.btnRefresh').addClass('btnRefreshAlert');
    }
    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblEmployeelist', function(error, result){
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

    templateObject.getEmployees = function () {
        getVS1Data('TEmployee').then(function (dataObject) {

            if(dataObject.length == 0){
                sideBarService.getAllEmployees(initialBaseDataLoad,0).then(function (data) {
                  addVS1Data('TEmployee',JSON.stringify(data));
                    let lineItems = [];
                    let lineItemObj = {};
                    for(let i=0; i<data.temployee.length; i++){
                        var dataList = {
                            id: data.temployee[i].fields.ID || '',
                            employeeno: data.temployee[i].fields.EmployeeNo || '',
                            employeename:data.temployee[i].fields.EmployeeName || '',
                            firstname: data.temployee[i].fields.FirstName || '',
                            lastname: data.temployee[i].fields.LastName || '',
                            phone: data.temployee[i].fields.Phone || '',
                            mobile: data.temployee[i].fields.Mobile || '',
                            email: data.temployee[i].fields.Email || '',
                            address: data.temployee[i].fields.Street || '',
                            country: data.temployee[i].fields.Country || '',
                            department: data.temployee[i].fields.DefaultClassName || '',
                            custFld1: data.temployee[i].fields.CustFld1 || '',
                            custFld2: data.temployee[i].fields.CustFld2 || '',
                            custFld3: data.temployee[i].fields.CustFld3 || '',
                            custFld4: data.temployee[i].fields.CustFld4 || ''
                        };

                        if(data.temployee[i].fields.EmployeeName.replace(/\s/g, '') != ''){
                            dataTableList.push(dataList);
                        }
                        //}
                    }

                    templateObject.datatablerecords.set(dataTableList);

                    if(templateObject.datatablerecords.get()){

                        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblEmployeelist', function(error, result){
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
                    }


                    setTimeout(function () {
                        $('#tblEmployeelist').DataTable({

                            "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                            buttons: [
                                {
                                    extend: 'csvHtml5',
                                    text: '',
                                    download: 'open',
                                    className: "btntabletocsv hiddenColumn",
                                    filename: "Employee List - "+ moment().format(),
                                    orientation:'portrait',
                                    exportOptions: {
                                        columns: ':visible'
                                    }
                                },{
                                    extend: 'print',
                                    download: 'open',
                                    className: "btntabletopdf hiddenColumn",
                                    text: '',
                                    title: 'Employee List',
                                    filename: "Employee List - "+ moment().format(),
                                    exportOptions: {
                                        columns: ':visible',
                                        stripHtml: false
                                    }
                                },
                                {
                                    extend: 'excelHtml5',
                                    title: '',
                                    download: 'open',
                                    className: "btntabletoexcel hiddenColumn",
                                    filename: "Employee List - "+ moment().format(),
                                    orientation:'portrait',
                                    exportOptions: {
                                        columns: ':visible'
                                    }

                                }],
                            select: true,
                            destroy: true,
                            colReorder: true,
                            // bStateSave: true,
                            // rowId: 0,
                            pageLength: initialDatatableLoad,
                            lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                            info: true,
                            responsive: true,
                            "order": [[ 1, "asc" ]],
                            action: function () {
                                $('#tblEmployeelist').DataTable().ajax.reload();
                            },
                             "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnRefreshEmployees' type='button' id='btnRefreshEmployees' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmployeelist_filter");
                        }

                        }).on('page', function () {

                            let draftRecord = templateObject.datatablerecords.get();
                            templateObject.datatablerecords.set(draftRecord);
                        }).on('column-reorder', function () {

                        });

                        // $('#tblEmployeelist').DataTable().column( 0 ).visible( true );
                        $('.fullScreenSpin').css('display','none');
                    }, 0);

                    var columns = $('#tblEmployeelist th');
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
                    $('#tblEmployeelist tbody').on( 'click', 'tr', function () {
                        var listData = $(this).closest('tr').attr('id');
                        if(listData){
                            FlowRouter.go('/employeescard?id=' + listData);
                        }
                    });

                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.temployee;

                let lineItems = [];
                let lineItemObj = {};
                for(let i=0; i<useData.length; i++){
                    var dataList = {
                        id: useData[i].fields.ID || '',
                        employeeno: useData[i].fields.EmployeeNo || '',
                        employeename:useData[i].fields.EmployeeName || '',
                        firstname: useData[i].fields.FirstName || '',
                        lastname: useData[i].fields.LastName || '',
                        phone: useData[i].fields.Phone || '',
                        mobile: useData[i].fields.Mobile || '',
                        email: useData[i].fields.Email || '',
                        address: useData[i].fields.Street || '',
                        country: useData[i].fields.Country || '',
                        department: useData[i].fields.DefaultClassName || '',
                        custFld1: useData[i].fields.CustFld1 || '',
                        custFld2: useData[i].fields.CustFld2 || '',
                        custFld3: useData[i].fields.CustFld3 || '',
                        custFld4: useData[i].fields.CustFld4 || ''
                    };

                    if(useData[i].fields.EmployeeName.replace(/\s/g, '') != ''){
                        dataTableList.push(dataList);
                    }
                    //}
                }

                templateObject.datatablerecords.set(dataTableList);

                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblEmployeelist', function(error, result){
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
                }


                setTimeout(function () {
                    $('#tblEmployeelist').DataTable({

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'csvHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Employee List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Employee List',
                                filename: "Employee List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            },
                            {
                                extend: 'excelHtml5',
                                title: '',
                                download: 'open',
                                className: "btntabletoexcel hiddenColumn",
                                filename: "Employee List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }

                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 1, "asc" ]],
                        action: function () {
                            $('#tblEmployeelist').DataTable().ajax.reload();
                        },
                         "fnInitComplete": function () {
                            $("<button class='btn btn-primary btnRefreshEmployees' type='button' id='btnRefreshEmployees' style='padding: 4px 10px; font-size: 14px; margin-left: 8px !important;'><i class='fas fa-search-plus' style='margin-right: 5px'></i>Search</button>").insertAfter("#tblEmployeelist_filter");
                        }

                    }).on('page', function () {

                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });

                    // $('#tblEmployeelist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblEmployeelist th');
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
                $('#tblEmployeelist tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    if(listData){
                        FlowRouter.go('/employeescard?id=' + listData);
                    }
                });
            }
        }).catch(function (err) {
            sideBarService.getAllEmployees(initialBaseDataLoad,0).then(function (data) {
              addVS1Data('TEmployee',JSON.stringify(data));
                let lineItems = [];
                let lineItemObj = {};
                for(let i=0; i<data.temployee.length; i++){
                    var dataList = {
                        id: data.temployee[i].fields.ID || '',
                        employeeno: data.temployee[i].fields.EmployeeNo || '',
                        employeename:data.temployee[i].fields.EmployeeName || '',
                        firstname: data.temployee[i].fields.FirstName || '',
                        lastname: data.temployee[i].fields.LastName || '',
                        phone: data.temployee[i].fields.Phone || '',
                        mobile: data.temployee[i].fields.Mobile || '',
                        email: data.temployee[i].fields.Email || '',
                        address: data.temployee[i].fields.Street || '',
                        country: data.temployee[i].fields.Country || '',
                        department: data.temployee[i].fields.DefaultClassName || '',
                        custFld1: data.temployee[i].fields.CustFld1 || '',
                        custFld2: data.temployee[i].fields.CustFld2 || '',
                        custFld3: data.temployee[i].fields.CustFld3 || '',
                        custFld4: data.temployee[i].fields.CustFld4 || ''
                    };

                    if(data.temployee[i].fields.EmployeeName.replace(/\s/g, '') != ''){
                        dataTableList.push(dataList);
                    }
                    //}
                }

                templateObject.datatablerecords.set(dataTableList);

                if(templateObject.datatablerecords.get()){

                    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblEmployeelist', function(error, result){
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
                }


                setTimeout(function () {
                    $('#tblEmployeelist').DataTable({

                        "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                        buttons: [
                            {
                                extend: 'csvHtml5',
                                text: '',
                                download: 'open',
                                className: "btntabletocsv hiddenColumn",
                                filename: "Employee List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }
                            },{
                                extend: 'print',
                                download: 'open',
                                className: "btntabletopdf hiddenColumn",
                                text: '',
                                title: 'Employee List',
                                filename: "Employee List - "+ moment().format(),
                                exportOptions: {
                                    columns: ':visible',
                                    stripHtml: false
                                }
                            },
                            {
                                extend: 'excelHtml5',
                                title: '',
                                download: 'open',
                                className: "btntabletoexcel hiddenColumn",
                                filename: "Employee List - "+ moment().format(),
                                orientation:'portrait',
                                exportOptions: {
                                    columns: ':visible'
                                }

                            }],
                        select: true,
                        destroy: true,
                        colReorder: true,
                        // bStateSave: true,
                        // rowId: 0,
                        pageLength: initialDatatableLoad,
                        lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                        info: true,
                        responsive: true,
                        "order": [[ 1, "asc" ]],
                        action: function () {
                            $('#tblEmployeelist').DataTable().ajax.reload();
                        },

                    }).on('page', function () {

                        let draftRecord = templateObject.datatablerecords.get();
                        templateObject.datatablerecords.set(draftRecord);
                    }).on('column-reorder', function () {

                    });

                    // $('#tblEmployeelist').DataTable().column( 0 ).visible( true );
                    $('.fullScreenSpin').css('display','none');
                }, 0);

                var columns = $('#tblEmployeelist th');
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
                $('#tblEmployeelist tbody').on( 'click', 'tr', function () {
                    var listData = $(this).closest('tr').attr('id');
                    if(listData){
                        FlowRouter.go('/employeescard?id=' + listData);
                    }
                });

            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });
    }

    templateObject.getEmployees();

    $('#tblEmployeelist tbody').on( 'click', 'tr', function () {
        var listData = $(this).closest('tr').attr('id');
        if(listData){
            FlowRouter.go('/employeescard?id=' + listData);
        }

    });


});


Template.employeelist.events({
    'click #btnNewEmployee':function(event){
        FlowRouter.go('/employeescard');
    },
    'click .btnAddVS1User':function(event){
        swal({
            title: 'Is this an existing Employee?',
            text: '',
            type: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result) => {
            if (result.value) {
                swal("Please select the employee from the list below.", "", "info");
                $('#employeeListModal').modal('toggle');
                // result.dismiss can be 'overlay', 'cancel', 'close', 'esc', 'timer'
            } else if (result.dismiss === 'cancel') {
                FlowRouter.go('/employeescard?addvs1user=true');
            }
        })
    },
    'click .chkDatatable' : function(event){
        var columns = $('#tblEmployeelist th');
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
    'keyup #tblEmployeelist_filter input': function (event) {
          if($(event.target).val() != ''){
            $(".btnRefreshEmployees").addClass('btnSearchAlert');
          }else{
            $(".btnRefreshEmployees").removeClass('btnSearchAlert');
          }
          if (event.keyCode == 13) {
             $(".btnRefreshEmployees").trigger("click");
          }
        },
        'click .btnRefreshEmployees':function(event){
        $(".btnRefresh").trigger("click");
    },
    'click .resetTable' : function(event){
        var getcurrentCloudDetails = CloudUser.findOne({_id:Session.get('mycloudLogonID'),clouddatabaseID:Session.get('mycloudLogonDBID')});
        if(getcurrentCloudDetails){
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblEmployeelist'});
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
                var checkPrefDetails = CloudPreference.findOne({userid:clientID,PrefName:'tblEmployeelist'});
                if (checkPrefDetails) {
                    CloudPreference.update({_id: checkPrefDetails._id},{$set: { userid: clientID,username:clientUsername,useremail:clientEmail,
                                                                               PrefGroup:'salesform',PrefName:'tblEmployeelist',published:true,
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
                                            PrefGroup:'salesform',PrefName:'tblEmployeelist',published:true,
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
        var datable = $('#tblEmployeelist').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblEmployeelist th');
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
        var columns = $('#tblEmployeelist th');

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
    'click .exportbtn': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .exportbtnExcel': function () {
        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletoexcel').click();
        $('.fullScreenSpin').css('display','none');
    },
    'click .btnRefresh': function () {

        $('.fullScreenSpin').css('display','inline-block');
        let templateObject = Template.instance();
        sideBarService.getAllAppointmentPredList().then(function (data) {
            addVS1Data('TAppointmentPreferences', JSON.stringify(data)).then(function (datareturn) {

            }).catch(function (err) {

            });
        }).catch(function (err) {

        });
        sideBarService.getAllEmployees(initialBaseDataLoad,0).then(function(data) {
            addVS1Data('TEmployee',JSON.stringify(data)).then(function (datareturn) {
                window.open('/employeelist','_self');
            }).catch(function (err) {
                window.open('/employeelist','_self');
            });
        }).catch(function(err) {
            window.open('/employeelist','_self');
        });
    },
    'click .printConfirm' : function(event){

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblEmployeelist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    },
    'click .templateDownload': function () {
        let utilityService = new UtilityService();
        let rows =[];
        const filename = 'SampleEmployee'+'.csv';
        rows[0]= ['First Name', 'Last Name', 'Phone','Mobile', 'Email','Skype', 'Street', 'City/Suburb', 'State', 'Post Code', 'Country', 'Gender'];
        rows[1]= ['John', 'Smith', '9995551213','9995551213', 'johnsmith@email.com','johnsmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'M'];
        rows[1]= ['Jane', 'Smith', '9995551213','9995551213', 'janesmith@email.com','janesmith', '123 Main Street', 'Brooklyn', 'New York', '1234', 'United States', 'F'];
        utilityService.exportToCsv(rows, filename, 'csv');
    },
    'click .templateDownloadXLSX': function (e) {

        e.preventDefault();  //stop the browser from following
        window.location.href = 'sample_imports/SampleEmployee.xlsx';
    },
    'click .btnUploadFile':function(event){
        $('#attachment-upload').val('');
        $('.file-name').text('');
        //$(".btnImport").removeAttr("disabled");
        $('#attachment-upload').trigger('click');

    },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        var filename = $('#attachment-upload')[0].files[0]['name'];
        var fileExtension = filename.split('.').pop().toLowerCase();
        var validExtensions = ["csv","txt","xlsx"];
        var validCSVExtensions = ["csv","txt"];
        var validExcelExtensions = ["xlsx","xls"];

        if (validExtensions.indexOf(fileExtension) == -1) {
            swal('Invalid Format', 'formats allowed are :' + validExtensions.join(', '), 'error');
            $('.file-name').text('');
            $(".btnImport").Attr("disabled");
        }else if(validCSVExtensions.indexOf(fileExtension) != -1){

            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            templateObj.selectedFile.set(selectedFile);
            if($('.file-name').text() != ""){
                $(".btnImport").removeAttr("disabled");
            }else{
                $(".btnImport").Attr("disabled");
            }
        }else if(fileExtension == 'xlsx'){
            $('.file-name').text(filename);
            let selectedFile = event.target.files[0];
            var oFileIn;
            var oFile = selectedFile;
            var sFilename = oFile.name;
            // Create A File Reader HTML5
            var reader = new FileReader();

            // Ready The Event For When A File Gets Selected
            reader.onload = function (e) {
                var data = e.target.result;
                data = new Uint8Array(data);
                var workbook = XLSX.read(data, {type: 'array'});

                var result = {};
                workbook.SheetNames.forEach(function (sheetName) {
                    var roa = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header: 1});
                    var sCSV = XLSX.utils.make_csv(workbook.Sheets[sheetName]);
                    templateObj.selectedFile.set(sCSV);

                    if (roa.length) result[sheetName] = roa;
                });
                // see the result, caution: it works after reader event is done.

            };
            reader.readAsArrayBuffer(oFile);

            if($('.file-name').text() != ""){
                $(".btnImport").removeAttr("disabled");
            }else{
                $(".btnImport").Attr("disabled");
            }

        }



    },
    'click .btnImport' : function () {
        $('.fullScreenSpin').css('display','inline-block');
        let templateObject = Template.instance();
        let contactService = new ContactService();
        let objDetails;
        var saledateTime = new Date();
        //let empStartDate = new Date().format("YYYY-MM-DD");
        var empStartDate = moment(saledateTime).format("YYYY-MM-DD");
        Papa.parse(templateObject.selectedFile.get(), {
            complete: function(results) {

                if(results.data.length > 0){
                    if( (results.data[0][0] == "First Name")
                       && (results.data[0][1] == "Last Name") && (results.data[0][2] == "Phone")
                       && (results.data[0][3] == "Mobile") && (results.data[0][4] == "Email")
                       && (results.data[0][5] == "Skype") && (results.data[0][6] == "Street")
                       && ((results.data[0][7] == "Street2")|| (results.data[0][7] == "City/Suburb")) && (results.data[0][8] == "State")
                       && (results.data[0][9] == "Post Code") && (results.data[0][10] == "Country")
                       && (results.data[0][11] == "Gender")) {

                        let dataLength = results.data.length * 500;
                        setTimeout(function(){
                            // $('#importModal').modal('toggle');
                            //Meteor._reload.reload();
                            window.open('/employeelist?success=true','_self');
                        },parseInt(dataLength));

                        for (let i = 0; i < results.data.length -1; i++) {
                            objDetails = {
                                type: "TEmployee",
                                fields:
                                {
                                    FirstName: results.data[i+1][0],
                                    LastName: results.data[i+1][1],
                                    Phone: results.data[i+1][2],
                                    Mobile: results.data[i+1][3],
                                    DateStarted: empStartDate,
                                    DOB: empStartDate,
                                    Sex: results.data[i+1][11]||"F",
                                    Email: results.data[i+1][4],
                                    SkypeName: results.data[i+1][5],
                                    Street: results.data[i+1][6],
                                    Street2: results.data[i+1][7],
                                    Suburb: results.data[i+1][7],
                                    State: results.data[i+1][8],
                                    PostCode:results.data[i+1][9],
                                    Country:results.data[i+1][10]

                                    // BillStreet: results.data[i+1][6],
                                    // BillStreet2: results.data[i+1][7],
                                    // BillState: results.data[i+1][8],
                                    // BillPostCode:results.data[i+1][9],
                                    // Billcountry:results.data[i+1][10]
                                }
                            };
                            if(results.data[i+1][1]){
                                if(results.data[i+1][1] !== "") {
                                    contactService.saveEmployee(objDetails).then(function (data) {
                                        ///$('.fullScreenSpin').css('display','none');
                                        //Meteor._reload.reload();
                                    }).catch(function (err) {
                                        //$('.fullScreenSpin').css('display','none');
                                        swal({ title: 'Oooops...', text: err, type: 'error', showCancelButton: false, confirmButtonText: 'Try Again' }).then((result) => { if (result.value) { Meteor._reload.reload(); } else if (result.dismiss === 'cancel') {}});
                                    });
                                }
                            }
                        }
                    }else{
                        $('.fullScreenSpin').css('display','none');
                        swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                    }
                }else{
                    $('.fullScreenSpin').css('display','none');
                    swal('Invalid Data Mapping fields ', 'Please check that you are importing the correct file with the correct column headers.', 'error');
                }

            }
        });
    }


});

Template.employeelist.helpers({
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.employeename == 'NA') {
                return 1;
            }
            else if (b.employeename == 'NA') {
                return -1;
            }
            return (a.employeename.toUpperCase() > b.employeename.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblEmployeelist'});
    },
    loggedCompany: () => {
        return localStorage.getItem('mySession') || '';
    }
});
