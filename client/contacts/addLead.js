import {ContactService} from "./contact-service";
import {ReactiveVar} from 'meteor/reactive-var';
import {UtilityService} from "../utility-service";
import {CountryService} from '../js/country-service';
import {PaymentsService} from '../payments/payments-service';
import {CRMService} from '../crm/crm-service';
import '../lib/global/erp-objects';
import 'jquery-ui-dist/external/jquery/jquery';
import 'jquery-ui-dist/jquery-ui';
import 'jQuery.print/jQuery.print.js';
import 'jquery-editable-select';
import {SideBarService} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();

Template.leadscard.onCreated(function () {
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.leadrecords = new ReactiveVar([]);
    templateObject.crmRecords = new ReactiveVar([]);
    templateObject.crmTableheaderRecords = new ReactiveVar([]);
    templateObject.isSameAddress = new ReactiveVar();
    templateObject.isSameAddress.set(false);
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
});

Template.leadscard.onRendered(function () {

    $('.fullScreenSpin').css('display', 'inline-block');
    let templateObject = Template.instance();
    const contactService = new ContactService();
    const countryService = new CountryService();
    const paymentService = new PaymentsService();
    const crmService = new CRMService();
    let countries = [];
    let currentId = FlowRouter.current().queryParams;
    let leadID = '';
    let totAmount = 0;
    let totAmountOverDue = 0;
    let salestaxcode = '';

    setTimeout(function () {
        Meteor.call('readPrefMethod', Session.get('mycloudLogonID'), 'defaulttax', function (error, result) {
            if (error) {
                salestaxcode = loggedTaxCodeSalesInc;
                templateObject.defaultsaletaxcode.set(salestaxcode);
            } else {
                if (result) {
                    salestaxcode = result.customFields[1].taxvalue || loggedTaxCodeSalesInc;
                    templateObject.defaultsaletaxcode.set(salestaxcode);
                }

            }
        });
    }, 500);

    templateObject.getOverviewARData = function (CustomerName) {
        getVS1Data('TARReport').then(function (dataObject) {
            if (dataObject.length === 0) {
                paymentService.getOverviewARDetails().then(function (data) {
                    setOverviewARDetails(data, CustomerName);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setOverviewARDetails(data, CustomerName);
            }
        }).catch(function (err) {
            paymentService.getOverviewARDetails().then(function (data) {
                setOverviewARDetails(data, CustomerName);
            });
        });
    };
    function setOverviewARDetails(data, CustomerName) {
        let itemsAwaitingPaymentcount = [];
        let itemsOverduePaymentcount = [];
        let dataListAwaitingCust = {};

        let customerawaitingpaymentCount = '';
        for (let i = 0; i < data.tarreport.length; i++) {
            // dataListAwaitingCust = {
            // id: data.tinvoice[i].Id || '',
            // };
            if ((data.tarreport[i].AmountDue !== 0) && (CustomerName.replace(/\s/g, '') === data.tarreport[i].Printname.replace(/\s/g, ''))) {
                // itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                totAmount += Number(data.tarreport[i].AmountDue);
                let date = new Date(data.tarreport[i].DueDate);
                if (date < new Date()) {
                    // itemsOverduePaymentcount.push(dataListAwaitingCust);
                    totAmountOverDue += Number(data.tarreport[i].AmountDue);
                }
            }
        }
        $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
    }

    setTimeout(function () {
        $("#dtAsOf").datepicker({
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
    }, 100);

    templateObject.getCountryData = function () {
        getVS1Data('TCountries').then(function (dataObject) {
            if (dataObject.length === 0) {
                countryService.getCountry().then((data) => {
                    setCountry(data);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setCountry(data);
            }
        }).catch(function (err) {
            countryService.getCountry().then((data) => {
                setCountry(data);
            });
        });
    };
    function setCountry(data) {
        for (let i = 0; i < data.tcountries.length; i++) {
            countries.push(data.tcountries[i].Country)
        }
        countries = _.sortBy(countries);
        templateObject.countryData.set(countries);
    }
    templateObject.getCountryData();

    templateObject.getLeadData = function () {
        getVS1Data('TProspectEx').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneLeadDataEx(leadID).then(function (data) {
                    setOneLeadDataEx(data);

                    // add to custom field
                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                    //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                    //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                    // }, 5500);
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tprospect;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ID) === parseInt(leadID)) {
                        // add to custom field
                        // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(useData[i].fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(useData[i].fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(useData[i].fields.CUSTFLD3);
                        // }, 5500);
                        
                        added = true;
                        setOneLeadDataEx(useData[i]);
                        $('.fullScreenSpin').css('display', 'none');
                        setTimeout(function () {
                            const rowCount = $('.results tbody tr').length;
                            $('.counter').text(rowCount + ' items');
                        }, 500);
                    }
                }
                if (!added) {
                    contactService.getOneLeadDataEx(leadID).then(function (data) {
                        setOneLeadDataEx(data);
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneLeadDataEx(leadID).then(function (data) {
                $('.fullScreenSpin').css('display', 'none');
                setOneLeadDataEx(data);
            });
        });
    };
    templateObject.getLeadDataByName = function () {
        getVS1Data('TProspectEx').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getOneLeadDataExByName(leadID).then(function (data) {
                    setOneLeadDataEx(data.tprospect[0]);
                    $('.fullScreenSpin').css('display', 'none');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tprospect;
                let added = false;
                for (let i = 0; i < useData.length; i++) {
                    if (parseInt(useData[i].fields.ClientName) === parseInt(leadID)) {
                        added = true;
                        setOneLeadDataEx(useData[i]);
                        $('.fullScreenSpin').css('display', 'none');
                        setTimeout(function () {
                            const rowCount = $('.results tbody tr').length;
                            $('.counter').text(rowCount + ' items');
                        }, 500);
                    }
                }
                if (!added) {
                    contactService.getOneLeadDataExByName(leadID).then(function (data) {
                        setOneLeadDataEx(data.tprospect[0]);
                        $('.fullScreenSpin').css('display', 'none');
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneLeadDataExByName(leadID).then(function (data) {
                $('.fullScreenSpin').css('display', 'none');
                setOneLeadDataEx(data.tprospect[0]);
            });
        });
    };
    function setOneLeadDataEx(data) {
        // console.log(data);
        let lineItemObj = {
            id: data.fields.ID || '',
            lid: 'Edit Lead',
            isjob: data.fields.IsJob || '',
            issupplier: data.fields.IsSupplier || false,
            iscustomer: data.fields.IsCustomer || false,
            employeeName: data.fields.ClientName || '',
            email: data.fields.Email || '',
            title: data.fields.Title || '',
            firstname: data.fields.FirstName || '',
            middlename: data.fields.CUSTFLD10 || '',
            lastname: data.fields.LastName || '',
            tfn: '' || '',
            phone: data.fields.Phone || '',
            mobile: data.fields.Mobile || '',
            fax: data.fields.Faxnumber || '',
            skype: data.fields.SkypeName || '',
            website: data.fields.URL || '',
            shippingaddress: data.fields.Street || '',
            scity: data.fields.Street2 || '',
            sstate: data.fields.State || '',
            spostalcode: data.fields.Postcode || '',
            scountry: data.fields.Country || LoggedCountry,
            ssuburb: data.fields.Suburb || '',
            billingaddress: data.fields.BillStreet || '',
            bcity: data.fields.BillStreet2 || '',
            bstate: data.fields.BillState || '',
            bpostalcode: data.fields.BillPostcode || '',
            bcountry: data.fields.Billcountry || '',
            bsuburb: data.fields.Billsuburb || '',
            notes: data.fields.Notes || '',
            openingbalance: data.fields.RewardPointsOpeningBalance || 0.00,
            openingbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
            custfield1: data.fields.CUSTFLD1 || '',
            custfield2: data.fields.CUSTFLD2 || '',
            custfield3: data.fields.CUSTFLD3 || '',
            custfield4: data.fields.CUSTFLD4 || '',
        };

        if ((data.fields.Street === data.fields.BillStreet) && (data.fields.Street2 === data.fields.BillStreet2)
            && (data.fields.State === data.fields.BillState) && (data.fields.Postcode === data.fields.Postcode)
            && (data.fields.Country === data.fields.Billcountry) && (data.fields.Suburb === data.fields.Billsuburb)) {
            templateObject.isSameAddress.set(true);
        }
        //let attachmentData =  contactService.getCustomerAttachmentList(data.fields.ID);
        templateObject.getOverviewARData(data.fields.ClientName);
        templateObject.records.set(lineItemObj);

        templateObject.getAllCrm(data.fields.ClientName);
        /* START attachment */
        templateObject.attachmentCount.set(0);
        if (data.fields.Attachments) {
            if (data.fields.Attachments.length) {
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);
            }
        }
        /* END  attachment */

        //templateObject.uploadedFiles.set(attachmentData);
        // $('.fullScreenSpin').css('display','none');
        setTimeout(function () {
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            setTab();
        }, 1000);
    }
    function setInitialForEmptyCurrentID() {
        let lineItemObj = {
            id: '',
            lid: 'Add Lead',
            company: '',
            email: '',
            title: '',
            firstname: '',
            middlename: '',
            lastname: '',
            tfn: '',
            phone: '',
            mobile: '',
            fax: '',
            shippingaddress: '',
            scity: '',
            sstate: '',
            spostalcode: '',
            scountry: LoggedCountry || '',
            ssuburb: '',
            billingaddress: '',
            bcity: '',
            bstate: '',
            bpostalcode: '',
            bcountry: LoggedCountry || '',
            bsuburb: '',
            custFld1: '',
            custFld2: ''
        };
        templateObject.isSameAddress.set(true);
        templateObject.records.set(lineItemObj);
        setTimeout(function () {
            $('#tblCrmlist').DataTable();
            setTab();
            $('.fullScreenSpin').css('display', 'none');
        }, 500);
        // setTimeout(function () {
        //     $('.termsSelect').val(templateObject.defaultsaleterm.get()||'');
        // }, 2000);
        $('.fullScreenSpin').css('display', 'none');
        // setTimeout(function () {
        //   var rowCount = $('.results tbody tr').length;
        //     $('.counter').text(rowCount + ' items');
        // }, 500);
    }
    function setTab() {
        if (currentId.crmTab === 'active') {
            $('.leadTab').removeClass('active');
            $('.crmTab').trigger('click');
        } else {
            $('.leadTab').addClass('active');
            $('.leadTab').trigger('click');
        }
    }

    function MakeNegative() {
        $('td').each(function () {
            if ($(this).text().indexOf('-' + Currency) >= 0) $(this).addClass('text-danger')
        });
    }

    if (currentId.id === "undefined") {
        setInitialForEmptyCurrentID();
    } else {
        if (!isNaN(currentId.id)) {
            leadID = currentId.id;
            templateObject.getLeadData();
        } else if((currentId.name)){
            leadID = currentId.name.replace(/%20/g, " ");
            templateObject.getLeadDataByName();
        } else {
            setInitialForEmptyCurrentID();
        }
    }

    templateObject.getAllCrm = function (leadName) {
        crmService.getAllTaskList().then(function (dataObject) {
            if (dataObject.tprojecttasks.length === 0) {
                sideBarService.getTProjectTasks().then(function (data) {
                    setCrmProjectTasks(data, leadName);
                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display', 'none');
                    // Meteor._reload.reload();
                });
            } else {
                setCrmProjectTasks(dataObject, leadName);
            }
        }).catch(function (err) {
            sideBarService.getTProjectTasks('').then(function (data) {
                setCrmProjectTasks(data, leadName);
            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display', 'none');
                // Meteor._reload.reload();
            });
        });
    };
    function setCrmProjectTasks(data, leadName) {
        let lineItems = [];
        let lineItemObj = {};
        let dataTableList = [];
        let tableHeaderList = [];
        // console.log(data);
        for (let i = 0; i < data.tprojecttasks.length; i++) {
            if (data.tprojecttasks[i].fields.TaskName === leadName) {
                let taskLabel = data.tprojecttasks[i].fields.TaskLabel;
                let taskLabelArray = [];
                if (taskLabel !== null) {
                    if (taskLabel.length === undefined || taskLabel.length === 0) {
                        taskLabelArray.push(taskLabel.fields);
                    } else {
                        for (let j = 0; j < taskLabel.length; j++) {
                            taskLabelArray.push(taskLabel[j].fields);
                        }
                    }
                }
                let taskDescription = data.tprojecttasks[i].fields.TaskDescription || '';
                taskDescription = taskDescription.length < 50 ? taskDescription : taskDescription.substring(0, 49) + "...";
                const dataList = {
                    id: data.tprojecttasks[i].fields.ID || 0,
                    priority: data.tprojecttasks[i].fields.priority || 0,
                    date: data.tprojecttasks[i].fields.due_date !== '' ? moment(data.tprojecttasks[i].fields.due_date).format("DD/MM/YYYY") : '',
                    taskName: data.tprojecttasks[i].fields.TaskName || '',
                    projectID: data.tprojecttasks[i].fields.ProjectID || '',
                    projectName: data.tprojecttasks[i].fields.ProjectName || '',
                    description: taskDescription,
                    labels: taskLabelArray
                };
                // if (data.tprojecttasks[i].fields.TaskLabel && data.tprojecttasks[i].fields.TaskLabel.fields.EnteredBy === leadName) {
                dataTableList.push(dataList);
                // }
            }
        }

        templateObject.crmRecords.set(dataTableList);

        if (templateObject.crmRecords.get()) {
            setTimeout(function () {
                MakeNegative();
                $("#dtAsOf").datepicker({
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
            }, 100);
        }
        // $('.custAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        // $('.custOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        $('.fullScreenSpin').css('display', 'none');
        setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblCrmList').DataTable({
                // dom: 'lBfrtip',
                columnDefs: [
                    { type: 'date', targets: 0 }
                ],
                "sDom": "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
                buttons: [
                    {
                        extend: 'excelHtml5',
                        text: '',
                        download: 'open',
                        className: "btntabletocsv hiddenColumn",
                        filename: "Leads CRM List - " + moment().format(),
                        orientation: 'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Leads CRM',
                        filename: "Leads CRM List - " + moment().format(),
                        exportOptions: {
                            columns: ':visible',
                            stripHtml: false
                        }
                    }],
                select: true,
                destroy: true,
                colReorder: true,
                pageLength: initialDatatableLoad,
                lengthMenu: [ [initialDatatableLoad, -1], [initialDatatableLoad, "All"] ],
                info: true,
                responsive: true,
                "order": [[ 0, "desc" ],[ 2, "desc" ]],
                action: function () {
                    $('#tblCrmList').DataTable().ajax.reload();
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
                let draftRecord = templateObject.crmRecords.get();
                templateObject.crmRecords.set(draftRecord);
            }).on('column-reorder', function () {

            });

            $('.fullScreenSpin').css('display', 'none');
        }, 0);

        const columns = $('#tblCrmList th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function (i, v) {
            if (v.hidden === false) {
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
        templateObject.crmTableheaderRecords.set(tableHeaderList);
        $('div.dataTables_filter input').addClass('form-control form-control-sm');
    }

    templateObject.getLeadsList = function () {
        getVS1Data('TProspectVS1').then(function (dataObject) {
            if (dataObject.length === 0) {
                contactService.getAllLeadSideDataVS1().then(function (data) {
                    setAllLeads(data);
                }).catch(function (err) {
                    //Bert.alert('<strong>' + err + '</strong>!', 'danger');
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllLeads(data);
            }
        }).catch(function (err) {
            contactService.getAllLeadSideDataVS1().then(function (data) {
                setAllLeads(data);
            }).catch(function (err) {
                //Bert.alert('<strong>' + err + '</strong>!', 'danger');
            });
        });

    };
    templateObject.getLeadsList();
    function setAllLeads(data) {
        let lineItems = [];
        for (let i = 0; i < data.tprospectvs1.length; i++) {
            let classname = '';
            if (!isNaN(currentId.id)) {
                if (data.tprospectvs1[i].Id === parseInt(currentId.id)) {
                    classname = 'currentSelect';
                }
            }
            const dataList = {
                id: data.tprospectvs1[i].Id || '',
                employeeName: data.tprospectvs1[i].ClientName || '',
                companyName: data.tprospectvs1[i].CompanyName || '',
                classname: classname
            };
            lineItems.push(dataList);
        }
        templateObject.leadrecords.set(lineItems);
        if (templateObject.leadrecords.get()) {
            setTimeout(function () {
                $('.counter').text(lineItems.length + ' items');
            }, 100);
        }
    }
    templateObject.saveCustomerDetails = async function () { //Rasheed
        return new Promise((resolve) => {
            sideBarService.getAllCustomersDataVS1(initialBaseDataLoad,0).then(function(data) {
                addVS1Data('TCustomerVS1', JSON.stringify(data)).then(() => {
                    resolve({success: true, ...res});
                }).catch(function (err) {
                    resolve({success: false, ...err})
                });
            });
        });
    };
});

Template.leadscard.events({
    'click .openBalance': function (event) {
        let customerName = $('#edtLeadEmployeeName').val() || $('#edtJobCustomerCompany').val() || '';
        if(customerName !== "") {
            if(customerName.indexOf('^') > 0) {
              customerName = customerName.split('^')[0]
            }
            window.open('/agedreceivables?contact='+customerName, '_self');
        } else {
            window.open('/agedreceivables','_self');
        }
    },
    'click .btnBack': function (event) {
        // event.preventDefault();
        history.back(1);
      //  FlowRouter.go('/leadlist');
    },
    'click #chkSameAsShipping': function (event) {
        /*if($(event.target).is(':checked')){
      let streetAddress = $('#edtShippingAddress').val();
      let city = $('#edtShippingCity').val();
      let state =  $('#edtShippingState').val();
      let zipcode =  $('#edtShippingZIP').val();
      let country =  $('#sedtCountry').val();

       $('#edtBillingAddress').val(streetAddress);
       $('#edtBillingCity').val(city);
       $('#edtBillingState').val(state);
       $('#edtBillingZIP').val(zipcode);
       $('#bedtCountry').val(country);
    }else{
      $('#edtBillingAddress').val('');
      $('#edtBillingCity').val('');
      $('#edtBillingState').val('');
      $('#edtBillingZIP').val('');
      $('#bedtCountry').val('');
    }
    */
    },
    'click .btnSave': async function (event) {
        let templateObject = Template.instance();
        let contactService = new ContactService();
        $('.fullScreenSpin').css('display', 'inline-block');

        let employeeName = $('#edtLeadEmployeeName').val();
        let email = $('#edtLeadEmail').val();
        let title = $('#edtTitle').val();
        let firstname = $('#edtFirstName').val();
        let middlename = $('#edtMiddleName').val();
        let lastname = $('#edtLastName').val();
        let phone = $('#edtLeadPhone').val();
        let mobile = $('#edtLeadMobile').val();
        let fax = $('#edtLeadFax').val();
        let skype = $('#edtSkypeID').val();
        let website = $('#edtWebsite').val();
        let streetAddress = $('#edtShippingAddress').val();
        let city = $('#edtShippingCity').val();
        let state = $('#edtShippingState').val();
        let postalcode = $('#edtShippingZIP').val();
        let country = $('#sedtCountry').val();
        let suburb = $('#edtShippingSuburb').val();
        let bstreetAddress = '';
        let bcity = '';
        let bstate = '';
        let bzipcode = '';
        let bcountry = '';
        let bsuburb = '';
        let isSupplier = !!$('#chkSameAsSupplier').is(':checked');
        if ($('#chkSameAsShipping2').is(':checked')) {
            bstreetAddress = streetAddress;
            bcity = city;
            bstate = state;
            bzipcode = postalcode;
            bcountry = country;
            // bsuburb = suburb;
        } else {
            bstreetAddress = $('#edtBillingAddress').val();
            bcity = $('#edtBillingCity').val();
            bstate = $('#edtBillingState').val();
            bzipcode = $('#edtBillingZIP').val();
            bcountry = $('#bedtCountry').val();
            // bsuburb = $('#edtBillingSuburb').val();
        }

        let rewardPointsOpeningBalance = $('#custOpeningBalance').val();
        // let sltRewardPointsOpeningDate =  $('#dtAsOf').val();
        const sltRewardPointsOpeningDate = new Date($("#dtAsOf").datepicker("getDate"));
        let openingDate = sltRewardPointsOpeningDate.getFullYear() + "-" + (sltRewardPointsOpeningDate.getMonth() + 1) + "-" + sltRewardPointsOpeningDate.getDate();
        let notes = $('#txaNotes').val(); 
        let custField4 = $('#edtCustomField4').val();
        // add to custom field
        let custField1 = $('#edtSaleCustField1').val()||'';
        let custField2 = $('#edtSaleCustField2').val()||'';
        let custField3 = $('#edtSaleCustField3').val()||'';

        let uploadedItems = templateObject.uploadedFiles.get();

        const url = FlowRouter.current().path;
        const getemp_id = url.split('?id=');
        let currentEmployee = getemp_id[getemp_id.length - 1];
        let TLeadID = 0;
        if (getemp_id[1]) {
            TLeadID = parseInt(currentEmployee);
        } else {
            let custdupID = 0;
            let checkCustData = await contactService.getCheckLeadsData(employeeName)||'';
            if (checkCustData !== ''){
                if (checkCustData.tprospect.length) {
                    TLeadID = checkCustData.tprospect[0].Id;
                }
            }
        }
        let objDetails = {
            type: "TProspectEx",
            fields: {
                ID: TLeadID,
                Title: title,
                ClientName: employeeName,
                FirstName: firstname,
                CUSTFLD10: middlename,
                LastName: lastname,
                PublishOnVS1: true,
                Email: email,
                Phone: phone,
                Mobile: mobile,
                SkypeName: skype,
                Faxnumber: fax,
                Street: streetAddress,
                Street2: city,
                Suburb: suburb,
                State: state,
                PostCode: postalcode,
                Country: country,
                BillStreet: bstreetAddress,
                BillStreet2: bcity,
                BillState: bstate,
                BillPostCode: bzipcode,
                Billcountry: bcountry,
                // Billsuburb: bsuburb,
                IsSupplier:isSupplier,
                Notes: notes,
                URL: website,
                Attachments: uploadedItems,
                CUSTFLD1: custField1,
                CUSTFLD2: custField2,
                CUSTFLD3: custField3,
                CUSTFLD4: custField4
            }
        };
        contactService.saveProspectEx(objDetails).then(function (objDetails) {
            let customerSaveID = objDetails.fields.ID;
            if (customerSaveID) {
                sideBarService.getAllLeads(initialBaseDataLoad,0).then(function (dataReload) {
                    addVS1Data('TProspectEx', JSON.stringify(dataReload)).then(function (datareturn) {
                        window.open('/leadlist', '_self');
                    }).catch(function (err) {
                        window.open('/leadlist', '_self');
                    });
                }).catch(function (err) {
                    window.open('/leadlist', '_self');
                });
            }
        }).catch(function (err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                    // Meteor._reload.reload();
                } else if (result.dismiss === 'cancel') {

                }
            });
            $('.fullScreenSpin').css('display', 'none');
        });
    },
    'keyup .search': function (event) {
        const searchTerm = $(".search").val();
        const listItem = $('.results tbody').children('tr');
        const searchSplit = searchTerm.replace(/ /g, "'):containsi('");
        $.extend($.expr[':'], {
            'containsi': function (elem, i, match, array) {
                return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
            }
        });
        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function (e) {
            $(this).attr('visible', 'false');
        });
        $(".results tbody tr:containsi('" + searchSplit + "')").each(function (e) {
            $(this).attr('visible', 'true');
        });
        const jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');
        if (jobCount === '0') { $('.no-result').show(); }
        else {
            $('.no-result').hide();
        }
        if (searchTerm === "") {
            $(".results tbody tr").each(function (e) {
                $(this).attr('visible', 'true');
                $('.no-result').hide();
            });
            //setTimeout(function () {
            const rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }
    },
    'click .tblLeadSideList tbody tr': function (event) {
        const leadLineID = $(event.target).attr('id');
        window.open('/leadscard?id=' + leadLineID, '_self');
    },
    'click .tblCrmList tbody tr': function (event) {
        const taskID = $(event.target).parent().attr('id');
        if (taskID !== undefined) {
            FlowRouter.go('/crmoverview?taskid=' + taskID);
        }
    },
    'click .chkDatatable': function (event) {
        const columns = $('#tblTransactionlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function (i, v) {
            let className = v.classList;
            let replaceClass = className[1];
            if (v.innerText === columnDataValue) {
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
    'click .resetTable': function (event) {
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                if (err) {

                } else {
                    Meteor._reload.reload();
                }
            });
        }
    },
    'click .saveTable': function (event) {
        let lineItems = [];
        //let datatable =$('#tblTransactionlist').DataTable();
        $('.columnSettings').each(function (index) {
            const $tblrow = $(this);
            const colTitle = $tblrow.find(".divcolumn").text() || '';
            const colWidth = $tblrow.find(".custom-range").val() || 0;
            const colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            const colHidden = !$tblrow.find(".custom-control-input").is(':checked');
            let lineItemObj = {
                index: index,
                label: colTitle,
                hidden: colHidden,
                width: colWidth,
                thclass: colthClass
            };
            lineItems.push(lineItemObj);
        });
        //datatable.state.save();

        const getcurrentCloudDetails = CloudUser.findOne({
            _id: Session.get('mycloudLogonID'),
            clouddatabaseID: Session.get('mycloudLogonDBID')
        });
        if (getcurrentCloudDetails) {
            if (getcurrentCloudDetails._id.length > 0) {
                var clientID = getcurrentCloudDetails._id;
                var clientUsername = getcurrentCloudDetails.cloudUsername;
                var clientEmail = getcurrentCloudDetails.cloudEmail;
                var checkPrefDetails = CloudPreference.findOne({ userid: clientID, PrefName: 'tblTransactionlist' });
                if (checkPrefDetails) {
                    CloudPreference.update({ _id: checkPrefDetails._id }, {
                        $set: {
                            userid: clientID, username: clientUsername, useremail: clientEmail,
                            PrefGroup: 'salesform', PrefName: 'tblTransactionlist', published: true,
                            customFields: lineItems,
                            updatedAt: new Date()
                        }
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');
                        }
                    });

                } else {
                    CloudPreference.insert({
                        userid: clientID, username: clientUsername, useremail: clientEmail,
                        PrefGroup: 'salesform', PrefName: 'tblTransactionlist', published: true,
                        customFields: lineItems,
                        createdAt: new Date()
                    }, function (err, idTag) {
                        if (err) {
                            $('#myModal2').modal('toggle');
                        } else {
                            $('#myModal2').modal('toggle');

                        }
                    });
                }
            }
        }
        $('#myModal2').modal('toggle');
        //Meteor._reload.reload();
    },
    'blur .divcolumn': function (event) {
        let columData = $(event.target).text();
        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');
        const datable = $('#tblTransactionlist').DataTable();
        const title = datable.column(columnDatanIndex).header();
        $(title).html(columData);
    },
    'change .rngRange': function (event) {
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');
        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        const datable = $('#tblTransactionlist th');
        $.each(datable, function (i, v) {
            if (v.innerText === columnDataValue) {
                let className = v.className;
                let replaceClass = className.replace(/ /g, ".");
                $("." + replaceClass + "").css('width', range + 'px');
            }
        });
    },
    'click .btnOpenSettingsCrm': function (event) {
        let templateObject = Template.instance();
        const columns = $('#tblCrmList th');
        const tableHeaderList = [];
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function (i, v) {
            if (v.hidden === false) {
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
        templateObject.crmTableheaderRecords.set(tableHeaderList);
    },
    'click #exportbtn': function () {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblCrmList_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .printConfirm': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        jQuery('#tblCrmList_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display', 'none');
    },
    'click .btnRefresh': function () {
        Meteor._reload.reload();
    },
    'click .btnRefreshCrm': function () {
        let currentId = FlowRouter.current().queryParams;
        $('.fullScreenSpin').css('display', 'inline-block');
        sideBarService.getTProjectTasks().then(function (data) {
            addVS1Data('Tprojecttasks', JSON.stringify(data)).then(function (datareturn) {
                if (!isNaN(currentId.id)) {
                    window.open('/leadscard?id=' + currentId.id +'&crmTab=active', '_self');
                }
            }).catch(function (err) {
                if (!isNaN(currentId.id)) {
                    window.open('/leadscard?id=' + currentId.id +'&crmTab=active', '_self');
                }
            });
        }).catch(function (err) {
            if (!isNaN(currentId.id)) {
                window.open('/leadscard?id=' + currentId.id +'&crmTab=active', '_self');
            }
        });
    },
    'click #activeChk': function (event) {
        if ($(event.target).is(':checked')) {
            $('#customerInfo').css('color', '#00A3D3');
        } else {
            $('#customerInfo').css('color', '#b7b9cc !important');
        }
    },
    'click .new_attachment_btn': function (event) {
        $('#attachment-upload').trigger('click');
    },
    'click #formCheck-one': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox1div').css('display', 'block');
        } else {
            $('.checkbox1div').css('display', 'none');
        }
    },
    'click #formCheck-two': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox2div').css('display', 'block');
        } else {
            $('.checkbox2div').css('display', 'none');
        }
    },
    'click #formCheck-three': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox3div').css('display', 'block');
        } else {
            $('.checkbox3div').css('display', 'none');
        }
    },
    'click #formCheck-four': function (event) {
        if ($(event.target).is(':checked')) {
            $('.checkbox4div').css('display', 'block');
        } else {
            $('.checkbox4div').css('display', 'none');
        }
    },
    'blur .customField1Text': function (event) {
        const inputValue1 = $('.customField1Text').text();
        $('.lblCustomField1').text(inputValue1);
    },
    'blur .customField2Text': function (event) {
        const inputValue2 = $('.customField2Text').text();
        $('.lblCustomField2').text(inputValue2);
    },
    'blur .customField3Text': function (event) {
        const inputValue3 = $('.customField3Text').text();
        $('.lblCustomField3').text(inputValue3);
    },
    'blur .customField4Text': function (event) {
        const inputValue4 = $('.customField4Text').text();
        $('.lblCustomField4').text(inputValue4);
    },
    'click .btnSaveSettings': function (event) {
        let templateObject = Template.instance();
        $('.lblCustomField1').html('');
        $('.lblCustomField2').html('');
        $('.lblCustomField3').html('');
        $('.lblCustomField4').html('');
        let getchkcustomField1 = true;
        let getchkcustomField2 = true;
        let getchkcustomField3 = true;
        let getchkcustomField4 = true;
        let getcustomField1 = $('.customField1Text').html();
        let getcustomField2 = $('.customField2Text').html();
        let getcustomField3 = $('.customField3Text').html();
        let getcustomField4 = $('.customField4Text').html();
        if ($('#formCheck-one').is(':checked')) {
            getchkcustomField1 = false;
        }
        if ($('#formCheck-two').is(':checked')) {
            getchkcustomField2 = false;
        }
        if ($('#formCheck-three').is(':checked')) {
            getchkcustomField3 = false;
        }
        if ($('#formCheck-four').is(':checked')) {
            getchkcustomField4 = false;
        }
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.update({ _id: checkPrefDetails._id }, {
                $set: {
                    username: clientUsername, useremail: clientEmail,
                    PrefGroup: 'contactform', PrefName: 'leadscard', published: true,
                    customFields: [{
                        index: '1',
                        label: getcustomField1,
                        hidden: getchkcustomField1
                    }, {
                        index: '2',
                        label: getcustomField2,
                        hidden: getchkcustomField2
                    }, {
                        index: '3',
                        label: getcustomField3,
                        hidden: getchkcustomField3
                    }, {
                        index: '4',
                        label: getcustomField4,
                        hidden: getchkcustomField4
                    }
                                  ],
                    updatedAt: new Date()
                }
            }, function (err, idTag) {
                if (err) {
                    $('#customfieldModal').modal('toggle');
                } else {
                    $('#customfieldModal').modal('toggle');
                    $('.btnSave').trigger('click');
                }
            });
        } else {
            CloudPreference.insert({
                userid: clientID, username: clientUsername, useremail: clientEmail,
                PrefGroup: 'contactform', PrefName: 'leadscard', published: true,
                customFields: [{
                        index: '1',
                        label: getcustomField1,
                        hidden: getchkcustomField1
                    }, {
                        index: '2',
                        label: getcustomField2,
                        hidden: getchkcustomField2
                    }, {
                        index: '3',
                        label: getcustomField3,
                        hidden: getchkcustomField3
                    }, {
                        index: '4',
                        label: getcustomField4,
                        hidden: getchkcustomField4
                    }
                ],
                createdAt: new Date()
            }, function (err, idTag) {
                if (err) {
                    $('#customfieldModal').modal('toggle');
                } else {
                    $('#customfieldModal').modal('toggle');
                    $('.btnSave').trigger('click');

                }
            });
        }
    },
    'click .btnResetSettings': function (event) {
        let checkPrefDetails = getCheckPrefDetails();
        if (checkPrefDetails) {
            CloudPreference.remove({ _id: checkPrefDetails._id }, function (err, idTag) {
                if (err) {

                } else {
                    let customerSaveID = FlowRouter.current().queryParams;
                    if (!isNaN(customerSaveID.id)) {
                        window.open('/leadscard?id=' + customerSaveID, '_self');
                    } else if (!isNaN(customerSaveID.jobid)) {
                        window.open('/leadscard?jobid=' + customerSaveID, '_self');
                    } else {
                        window.open('/leadscard', '_self');
                    }
                    //Meteor._reload.reload();
                }
            });
        }
    },
    'change #attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();
        let myFiles = $('#attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUploadTabs(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .img_new_attachment_btn': function (event) {
        $('#img-attachment-upload').trigger('click');
    },
    'change #img-attachment-upload': function (e) {
        let templateObj = Template.instance();
        let saveToTAttachment = false;
        let lineIDForAttachment = false;
        let uploadedFilesArray = templateObj.uploadedFiles.get();
        let myFiles = $('#img-attachment-upload')[0].files;
        let uploadData = utilityService.attachmentUpload(uploadedFilesArray, myFiles, saveToTAttachment, lineIDForAttachment);
        templateObj.uploadedFiles.set(uploadData.uploadedFilesArray);
        templateObj.attachmentCount.set(uploadData.totalAttachments);
    },
    'click .remove-attachment': function (event, ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if (tempObj.$("#confirm-action-" + attachmentID).length) {
            tempObj.$("#confirm-action-" + attachmentID).remove();
        } else {
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID + '"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-' + attachmentID + '">'
            + 'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-' + attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();
    },
    'click .file-name': function (event) {
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();
        $('#myModalAttachment').modal('hide');
        let previewFile = getPreviewFile(uploadedFiles, attachmentID);
        templateObj.uploadedFile.set(previewFile);
        $('#files_view').modal('show');
    },
    'click .confirm-delete-attachment': function (event, ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('#attachment-upload').val('');
        uploadedArray.splice(attachmentID, 1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount--;
        if (attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if (uploadedArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },
    'click .attachmentTab': function () {
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if (uploadedFileArray.length > 0) {
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedFileArray);
        } else {
            $(".attchment-tooltip").show();
        }
    },  
    'click .btnNewLead': function (event) {
        window.open('/leadscard', '_self');
    },
    'click .btnView': function (e) {
        const btnView = document.getElementById("btnView");
        const btnHide = document.getElementById("btnHide");
        const displayList = document.getElementById("displayList");
        const displayInfo = document.getElementById("displayInfo");
        if (displayList.style.display === "none") {
            displayList.style.display = "flex";
            $("#displayInfo").removeClass("col-12");
            $("#displayInfo").addClass("col-9");
            btnView.style.display = "none";
            btnHide.style.display = "flex";
        } else {
            displayList.style.display = "none";
            $("#displayInfo").removeClass("col-9");
            $("#displayInfo").addClass("col-12");
            btnView.style.display = "flex";
            btnHide.style.display = "none";
        }
    },
    'click .btnDeleteLead': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let contactService = new ContactService();
        let currentId = FlowRouter.current().queryParams;
        let objDetails = '';
        if (!isNaN(currentId.id)) {
            let currentLead = parseInt(currentId.id);
            objDetails = {
                type: "TProspectEx",
                fields: {
                    ID: currentLead,
                    Active: false
                }
            };
            contactService.saveProspectEx(objDetails).then(function (objDetails) {
                FlowRouter.go('/leadlist?success=true');
            }).catch(function (err) {
                swal({
                    title: 'Oooops...',
                    text: err,
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Try Again'
                }).then((result) => {
                    if (result.value) {
                    } else if (result.dismiss === 'cancel') {

                    }
                });
                $('.fullScreenSpin').css('display', 'none');
            });
        } else {
            FlowRouter.go('/leadlist?success=true');
        }
        $('#deleteLeadModal').modal('toggle');
    },
    'click .btnTask': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/crmoverview?leadid=' + customerID);
        } else {

        }
    },
    'click .btnEmail': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/crmoverview?leadid=' + customerID);
        } else {

        }
    },
    'click .btnAppointment': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let customerID = parseInt(currentId.id);
            FlowRouter.go('/appointments?leadid=' + customerID);
        } else {

        }
    },
    'click .btnQuote': async function (event) {
        convertToCustomer('quotecard');
    },
    'click .btnSalesOrder': function (event) {
        convertToCustomer('salesordercard');
    },
    'click .btnInvoice': function (event) {
        convertToCustomer('invoicecard');
    },
    'click .btnRefund': function (event) {
        convertToCustomer('refundcard');
    },

    // add to custom field
  "click #edtSaleCustField1": function (e) {
    $("#clickedControl").val("one");
  },

  // add to custom field
  "click #edtSaleCustField2": function (e) {
    $("#clickedControl").val("two");
  },

  // add to custom field
  "click #edtSaleCustField3": function (e) {
    $("#clickedControl").val("three");
  },
});

Template.leadscard.helpers({
    record: () => {
        return Template.instance().records.get();
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    leadrecords: () => {
        return Template.instance().leadrecords.get().sort(function (a, b) {
            if (a.employeeName === 'NA') {
                return 1;
            }
            else if (b.employeeName === 'NA') {
                return -1;
            }
            return (a.employeeName.toUpperCase() > b.employeeName.toUpperCase()) ? 1 : -1;
        });
    },
    crmRecords: () => {
        return Template.instance().crmRecords.get().sort(function (a, b) {
            if (a.id === 'NA') {
                return 1;
            }
            else if (b.id === 'NA') {
                return -1;
            }
            return (a.id > b.id) ? 1 : -1;
        });
    },
    crmTableheaderRecords: () => {
        return Template.instance().crmTableheaderRecords.get();
    },
    currentdate: () => {
        var currentDate = new Date();
        return moment(currentDate).format("DD/MM/YYYY");
    },
    uploadedFiles: () => {
        return Template.instance().uploadedFiles.get();
    },
    attachmentCount: () => {
        return Template.instance().attachmentCount.get();
    },
    uploadedFile: () => {
        return Template.instance().uploadedFile.get();
    },
    currentAttachLineID: () => {
        return Template.instance().currentAttachLineID.get();
    },
    contactCloudPreferenceRec: () => {
        return CloudPreference.findOne({ userid: Session.get('mycloudLogonID'), PrefName: 'leadscard' });
    },
    isSameAddress: () => {
        return Template.instance().isSameAddress.get();
    },
    isMobileDevices: () => {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }

        return isMobile;
    }
});

function getPreviewFile(uploadedFiles, attachmentID) {
    let previewFile = {};
    let input = uploadedFiles[attachmentID].fields.Description;
    previewFile.link = 'data:' + input + ';base64,' + uploadedFiles[attachmentID].fields.Attachment;
    previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
    let type = uploadedFiles[attachmentID].fields.Description;
    if (type === 'application/pdf') {
        previewFile.class = 'pdf-class';
    } else if (type === 'application/msword' || type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        previewFile.class = 'docx-class';
    }
    else if (type === 'application/vnd.ms-excel' || type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        previewFile.class = 'excel-class';
    }
    else if (type === 'application/vnd.ms-powerpoint' || type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        previewFile.class = 'ppt-class';
    }
    else if (type === 'application/vnd.oasis.opendocument.formula' || type === 'text/csv' || type === 'text/plain' || type === 'text/rtf') {
        previewFile.class = 'txt-class';
    }
    else if (type === 'application/zip' || type === 'application/rar' || type === 'application/x-zip-compressed' || type === 'application/x-zip,application/x-7z-compressed') {
        previewFile.class = 'zip-class';
    }
    else {
        previewFile.class = 'default-class';
    }
    previewFile.image = type.split('/')[0] === 'image';
    return previewFile;
}
function getCheckPrefDetails() {
    const getcurrentCloudDetails = CloudUser.findOne({
        _id: Session.get('mycloudLogonID'),
        clouddatabaseID: Session.get('mycloudLogonDBID')
    });
    let checkPrefDetails = null;
    if (getcurrentCloudDetails) {
        if (getcurrentCloudDetails._id.length > 0) {
            const clientID = getcurrentCloudDetails._id;
            const clientUsername = getcurrentCloudDetails.cloudUsername;
            const clientEmail = getcurrentCloudDetails.cloudEmail;
            checkPrefDetails = CloudPreference.findOne({userid: clientID, PrefName: 'leadscard'});
        }
    }
    return checkPrefDetails;
}
function convertToCustomer(nav) {
    $('.fullScreenSpin').css('display', 'inline-block');
    const templateObject = Template.instance();
    let contactService = new ContactService();
    let currentId = FlowRouter.current().queryParams;
    let objDetails = '';
    if (!isNaN(currentId.id)) {
        let currentLead = parseInt(currentId.id);
        objDetails = {
            type: "TProspectEx",
            fields: {
                ID: currentLead,
                IsCustomer: true
            }
        };
        contactService.saveProspectEx(objDetails).then(async function (data) {
            let customerID = data.fields.ID;
            await templateObject.saveCustomerDetails();
            $('.fullScreenSpin').css('display','none');
            FlowRouter.go('/' + nav + '?customerid=' + customerID);
        }).catch(function (err) {
            swal({
                title: 'Oooops...',
                text: err,
                type: 'error',
                showCancelButton: false,
                confirmButtonText: 'Try Again'
            }).then((result) => {
                if (result.value) {
                } else if (result.dismiss === 'cancel') {

                }
            });
            $('.fullScreenSpin').css('display', 'none');
        });
    } else {

    }
}
function removeAttachment(suffix, event) {
    let tempObj = Template.instance();
    let attachmentID = parseInt(event.target.id.split('remove-attachment'+suffix+'-')[1]);
    if (tempObj.$("#confirm-action"+suffix+"-" + attachmentID).length) {
        tempObj.$("#confirm-action"+suffix+"-" + attachmentID).remove();
    } else {
        let actionElement = '<div class="confirm-action'+suffix+'" id="confirm-action'+suffix+'-' + attachmentID + '"><a class="confirm-delete-attachment'+suffix+' btn btn-default" id="delete-attachment'+suffix+'-' + attachmentID + '">'
            + 'Delete</a><button class="save-to-library'+suffix+' btn btn-default">Remove & save to File Library</button></div>';
        tempObj.$('#attachment-name'+suffix+'-' + attachmentID).append(actionElement);
    }
    tempObj.$("#new-attachment2-tooltip"+suffix).show();
}
