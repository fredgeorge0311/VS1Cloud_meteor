import {ContactService} from "./contact-service";
import {ReactiveVar} from 'meteor/reactive-var';
import {UtilityService} from "../utility-service";
import {CountryService} from '../js/country-service';
import {PaymentsService} from '../payments/payments-service';
import {SideBarService} from '../js/sidebar-service';
import '../lib/global/indexdbstorage.js';

let sideBarService = new SideBarService();
let utilityService = new UtilityService();
Template.supplierscard.onCreated(function(){
    const templateObject = Template.instance();
    templateObject.records = new ReactiveVar();
    templateObject.countryData = new ReactiveVar();
    templateObject.supplierrecords = new ReactiveVar([]);
    templateObject.recentTrasactions = new ReactiveVar([]);
    templateObject.datatablerecords = new ReactiveVar([]);
    templateObject.tableheaderrecords = new ReactiveVar([]);
    templateObject.preferredPaymentList = new ReactiveVar();
    templateObject.termsList = new ReactiveVar();
    templateObject.deliveryMethodList = new ReactiveVar();
    templateObject.taxCodeList = new ReactiveVar();
    templateObject.defaultpurchasetaxcode = new ReactiveVar();
    templateObject.defaultpurchaseterm = new ReactiveVar();
    templateObject.isSameAddress = new ReactiveVar();
    templateObject.isSameAddress.set(false);
    /* Attachments */
    templateObject.uploadedFile = new ReactiveVar();
    templateObject.uploadedFiles = new ReactiveVar([]);
    templateObject.attachmentCount = new ReactiveVar();
    templateObject.currentAttachLineID = new ReactiveVar();
});

Template.supplierscard.onRendered(function () {
    $('.fullScreenSpin').css('display','inline-block');

    let templateObject = Template.instance();
    const contactService = new ContactService();
    const countryService = new CountryService();
    const paymentService = new PaymentsService();
    let countries = [];

    let preferredPayments = [];
    let terms = [];
    let deliveryMethods = [];
    let taxCodes = [];
    let currentId = FlowRouter.current().queryParams;
    let supplierID = '';
    let totAmount = 0;
    let totAmountOverDue = 0;
    const dataTableList = [];
    const tableHeaderList = [];

    let purchasetaxcode = '';
    templateObject.defaultpurchasetaxcode.set(loggedTaxCodeSalesInc);
    setTimeout(function () {
        Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'defaulttax', function(error, result){
            if(error){
                purchasetaxcode =  loggedTaxCodeSalesInc;
                templateObject.defaultpurchasetaxcode.set(loggedTaxCodeSalesInc);
            }else{
                if(result){
                    purchasetaxcode = result.customFields[0].taxvalue || loggedTaxCodePurchaseInc;
                    templateObject.defaultpurchasetaxcode.set(purchasetaxcode);
                }

            }
        });
    }, 500);

    // $(document).ready(function () {
    //     history.pushState(null, document.title, location.href);
    //     window.addEventListener('popstate', function (event) {
    //         swal({
    //             title: 'Leave Supplier Screen',
    //             text: "Do you want to leave this screen?",
    //             type: 'info',
    //             showCancelButton: true,
    //             confirmButtonText: 'Save'
    //         }).then((result) => {
    //             if (result.value) {
    //                 $(".btnSave").trigger("click");
    //             } else if (result.dismiss === 'cancel') {
    //                 window.open('/supplierlist', "_self");
    //             } else {

    //             }
    //         });

    //     });


    // });
    $("#dtStartingDate,#dtDOB,#dtTermninationDate,#dtAsOf").datepicker({
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

    Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblTransactionlist', function(error, result){
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
    }

    templateObject.getOverviewAPData = function (supplierName) {
        getVS1Data('TAPReport').then(function (dataObject) {
            if(dataObject.length === 0){
                paymentService.getOverviewAPDetails().then(function (data) {
                    setOverviewAPDetails(data, supplierName);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setOverviewAPDetails(data, supplierName);
            }
        }).catch(function (err) {
            paymentService.getOverviewAPDetails().then(function (data) {
                setOverviewAPDetails(data, supplierName);
            });
        });
    };
    function setOverviewAPDetails(data, supplierName) {
        let itemsAwaitingPaymentcount = [];
        let itemsOverduePaymentcount = [];
        let dataListAwaitingCust = {};
        let customerawaitingpaymentCount = '';
        for(let i=0; i<data.tapreport.length; i++){
            if((data.tapreport[i].AmountDue !== 0) && supplierName.replace(/\s/g, '') === data.tapreport[i].Printname.replace(/\s/g, '')){
                //itemsAwaitingPaymentcount.push(dataListAwaitingCust);
                totAmount += Number(data.tapreport[i].AmountDue);
                let date = new Date(data.tapreport[i].DueDate);
                if (date < new Date()) {
                    //itemsOverduePaymentcount.push(dataListAwaitingCust);
                    totAmountOverDue += Number(data.tapreport[i].AmountDue);
                }
            }
        }
        $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
    }

    templateObject.getCountryData = function () {
        getVS1Data('TCountries').then(function (dataObject) {
            if(dataObject.length === 0){
                countryService.getCountry().then((data) => {
                    setCountry(data);
                });
            }else{
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

    templateObject.getAllProductRecentTransactions = function (supplierName) {
        getVS1Data('TbillReport').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getAllTransListBySupplier(supplierName).then(function (data) {
                    setAllProductRecentTransactions(data, supplierName);
                }).catch(function (err) {
                    // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                    $('.fullScreenSpin').css('display','none');
                    // Meteor._reload.reload();
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setAllProductRecentTransactions(data, supplierName);
            }
        }).catch(function (err) {
            contactService.getAllTransListBySupplier(supplierName).then(function (data) {
                setAllProductRecentTransactions(data, supplierName);
            }).catch(function (err) {
                // Bert.alert('<strong>' + err + '</strong>!', 'danger');
                $('.fullScreenSpin').css('display','none');
                // Meteor._reload.reload();
            });
        });

    };
    function setAllProductRecentTransactions(data, supplierName) {
        for(let i = 0; i < data.tbillreport.length; i++){
            let totalAmountEx = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Ex)'])|| 0.00;
            let totalTax = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Tax']) || 0.00;
            let totalAmount = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i]['Total Amount (Inc)'])|| 0.00;
            let amountPaidCalc = data.tbillreport[i]['Total Amount (Inc)'] - data.tbillreport[i].Balance;
            let totalPaid = utilityService.modifynegativeCurrencyFormat(amountPaidCalc)|| 0.00;
            let totalOutstanding = utilityService.modifynegativeCurrencyFormat(data.tbillreport[i].Balance)|| 0.00;
            const dataList = {
                id: data.tbillreport[i].PurchaseOrderID || '',
                employee: data.tbillreport[i].Contact || '',
                sortdate: data.tbillreport[i].OrderDate !== '' ? moment(data.tbillreport[i].OrderDate).format("YYYY/MM/DD") : data.tbillreport[i].OrderDate,
                orderdate: data.tbillreport[i].OrderDate !== '' ? moment(data.tbillreport[i].OrderDate).format("DD/MM/YYYY") : data.tbillreport[i].OrderDate,
                suppliername: data.tbillreport[i].Company || '',
                totalamountex: totalAmountEx || 0.00,
                totaltax: totalTax || 0.00,
                totalamount: totalAmount || 0.00,
                totalpaid: totalPaid || 0.00,
                totaloustanding: totalOutstanding || 0.00,
                orderstatus: '',
                type: data.tbillreport[i].Type || '',
                custfield1: data.tbillreport[i].Phone || '',
                custfield2: data.tbillreport[i].InvoiceNumber || '',
                comments: data.tbillreport[i].Comments || '',
            };
            if(data.tbillreport[i].Company === supplierName){
                dataTableList.push(dataList);
            }
        }
        templateObject.datatablerecords.set(dataTableList);
        if(templateObject.datatablerecords.get()){
            Meteor.call('readPrefMethod',Session.get('mycloudLogonID'),'tblTransactionlist', function(error, result){
                if (error) {

                } else {
                    if (result) {
                        for (let i = 0; i < result.customFields.length; i++) {
                            let customcolumn = result.customFields;
                            let columHeaderUpdate = customcolumn[i].thclass.replace(/ /g, ".");
                            let hiddenColumn = customcolumn[i].hidden;
                            let columnClass = columHeaderUpdate.split('.')[1];
                            if(hiddenColumn === true){
                                $("."+columnClass+"").addClass('hiddenColumn');
                                $("."+columnClass+"").removeClass('showColumn');
                            }else if(hiddenColumn === false){
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
        // $('.suppAwaitingAmt').text(utilityService.modifynegativeCurrencyFormat(totAmount));
        // $('.suppOverdueAmt').text(utilityService.modifynegativeCurrencyFormat(totAmountOverDue));
        $('.fullScreenSpin').css('display','none');
        setTimeout(function () {
            //$.fn.dataTable.moment('DD/MM/YY');
            $('#tblTransactionlist').DataTable({
                // dom: 'lBfrtip',
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
                        filename: "Supplier Purchase Transactions - "+ moment().format(),
                        orientation:'portrait',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },{
                        extend: 'print',
                        download: 'open',
                        className: "btntabletopdf hiddenColumn",
                        text: '',
                        title: 'Purchase Transaction',
                        filename: "Supplier Purchase Transactions - "+ moment().format(),
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
                "order": [[ 0, "asc" ]],
                action: function () {
                    $('#tblTransactionlist').DataTable().ajax.reload();
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

        const columns = $('#tblTransactionlist th');
        let sWidth = "";
        let columVisible = false;
        $.each(columns, function(i,v) {
            if(v.hidden === false){
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
        $('#tblTransactionlist tbody').on( 'click', 'tr', function () {
            const listData = $(this).closest('tr').attr('id');
            const transactiontype = $(event.target).closest("tr").find(".colStatus").text();
            if((listData) && (transactiontype)){
                if(transactiontype === 'Purchase Order' ){
                    window.open('/purchaseordercard?id=' + listData,'_self');
                }else if(transactiontype === 'Bill'){
                    window.open('/billcard?id=' + listData,'_self');
                }else if(transactiontype === 'Credit'){
                    window.open('/creditcard?id=' + listData,'_self');
                }else{
                    //window.open('/purchaseordercard?id=' + listData,'_self');
                }
            }
        });
    }

    templateObject.getPreferredPaymentList = function () {
        getVS1Data('TPaymentMethod').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getPaymentMethodDataVS1().then((data) => {
                    setPreferredPaymentList(data);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setPreferredPaymentList(data);
            }
        }).catch(function (err) {
            contactService.getPaymentMethodDataVS1().then((data) => {
                setPreferredPaymentList(data);
            });
        });
    };
    function setPreferredPaymentList(data) {
        for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
            preferredPayments.push(data.tpaymentmethodvs1[i].fields.PaymentMethodName)
        }
        preferredPayments = _.sortBy(preferredPayments);
        templateObject.preferredPaymentList.set(preferredPayments);
    }
    templateObject.getPreferredPaymentList();
    
    templateObject.getTermsList = function () {
        getVS1Data('TTermsVS1').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getTermDataVS1().then((data) => {
                    setTermsDataVS1(data);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setTermsDataVS1(data);
            }
        }).catch(function (err) {
            contactService.getTermDataVS1().then((data) => {
                setTermsDataVS1(data);
            });
        });
    };
    function setTermsDataVS1(data) {
        for (let i = 0; i < data.ttermsvs1.length; i++) {
            terms.push(data.ttermsvs1[i].TermsName);
            if(data.ttermsvs1[i].isPurchasedefault === true){
                templateObject.defaultpurchaseterm.set(data.ttermsvs1[i].TermsName);
            }
        }
        terms = _.sortBy(terms);
        templateObject.termsList.set(terms);
    }
    templateObject.getTermsList();

    templateObject.getDeliveryMethodList = function () {
        getVS1Data('TShippingMethod').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getShippingMethodData().then((data) => {
                    setShippingMethodData(data);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setShippingMethodData(data);
            }
        }).catch(function (err) {
            contactService.getShippingMethodData().then((data) => {
                setShippingMethodData(data);
            });
        });

    };
    function setShippingMethodData(data) {
        for (let i = 0; i < data.tshippingmethod.length; i++) {
            deliveryMethods.push(data.tshippingmethod[i].ShippingMethod)
        }
        deliveryMethods = _.sortBy(deliveryMethods);
        templateObject.deliveryMethodList.set(deliveryMethods);
    }
    templateObject.getDeliveryMethodList();

    templateObject.getTaxCodesList = function () {
        getVS1Data('TTaxcodeVS1').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getTaxCodesVS1().then((data) => {
                    setTaxCodesVS1(data);
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                setTaxCodesVS1(data);
            }
        }).catch(function (err) {
            contactService.getTaxCodesVS1().then((data) => {
                setTaxCodesVS1(data);
            });
        });

    };
    function setTaxCodesVS1(data) {
        for (let i = 0; i < data.ttaxcodevs1.length; i++) {
            taxCodes.push(data.ttaxcodevs1[i].CodeName)
        }
        taxCodes = _.sortBy(taxCodes);
        templateObject.taxCodeList.set(taxCodes);
    }
    templateObject.getTaxCodesList();

    templateObject.getEmployeeData = function () {
        getVS1Data('TSupplierVS1').then(function (dataObject) {
            if (dataObject.length === 0){
                contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                  
                    setOneSupplierDataEx(data);
                    // add to custom field
                    // tempcode
                    // setTimeout(function () {
                    //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                    //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                    //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                    // }, 5500);
                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for (let i=0; i<useData.length; i++) {
                    if(parseInt(useData[i].fields.ID) === parseInt(supplierID)){
                        added = true;
                        setOneSupplierDataEx(useData[i]);
                        // add to custom field
                    // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(useData[i].fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(useData[i].fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(useData[i].fields.CUSTFLD3);
                        // }, 5500);
                    }
                }
                if(!added) {
                    contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                        setOneSupplierDataEx(data);
                        // add to custom field
                        // tempcode
                        // setTimeout(function () {
                        //   $('#edtSaleCustField1').val(data.fields.CUSTFLD1);
                        //   $('#edtSaleCustField2').val(data.fields.CUSTFLD2);
                        //   $('#edtSaleCustField3').val(data.fields.CUSTFLD3);
                        // }, 5500);
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneSupplierDataEx(supplierID).then(function (data) {
                setOneSupplierDataEx(data);
            });
        });
    };
    templateObject.getEmployeeDataByName = function () {
        getVS1Data('TSupplierVS1').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getOneSupplierDataExByName(supplierID).then(function (data) {
                    setOneSupplierDataEx(data.tsupplier[0]);
                }).catch(function (err) {
                    $('.fullScreenSpin').css('display','none');
                });
            }else{
                let data = JSON.parse(dataObject[0].data);
                let useData = data.tsuppliervs1;
                let added = false;
                for(let i = 0; i < useData.length; i++){
                    if((useData[i].fields.ClientName) === supplierID){
                        added = true;
                        setOneSupplierDataEx(useData[i]);
                    }
                }
                if(!added) {
                    contactService.getOneSupplierDataExByName(supplierID).then(function (data) {
                        setOneSupplierDataEx(data.tsupplier[0]);
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display','none');
                    });
                }
            }
        }).catch(function (err) {
            contactService.getOneSupplierDataExByName(supplierID).then(function (data) {
                setOneSupplierDataEx(data.tsupplier[0]);
            }).catch(function (err) {
                $('.fullScreenSpin').css('display','none');
            });
        });
    };
    function setOneSupplierDataEx(data) {
        let lineItemObj = {
            id : data.fields.ID,
            lid : 'Edit Supplier',
            company : data.fields.ClientName || '',
            email : data.fields.Email || '',
            title : data.fields.Title || '',
            firstname : data.fields.FirstName || '',
            middlename : data.fields.CUSTFLD10|| '',
            lastname : data.fields.LastName || '',
            tfn: '' || '',
            phone : data.fields.Phone || '',
            mobile:  data.fields.Mobile || '',
            fax: data.fields.Faxnumber || '',
            skype: data.fields.SkypeName || '',
            website: data.fields.URL || '',
            shippingaddress : data.fields.Street || '',
            scity : data.fields.Street2 || '',
            sstate : data.fields.State || '',
            spostalcode : data.fields.Postcode || '',
            scountry : data.fields.Country || LoggedCountry,
            billingaddress : data.fields.BillStreet || '',
            bcity : data.fields.BillStreet2 || '',
            bstate : data.fields.BillState || '',
            bpostalcode : data.fields.BillPostcode || '',
            bcountry : data.fields.Billcountry || '',
            custfield1 : data.fields.CUSTFLD1 || '',
            custfield2 : data.fields.CUSTFLD2 || '',
            custfield3 : data.fields.CUSTFLD3 || '',
            custfield4 : data.fields.CUSTFLD4 || '',
            notes: data.fields.Notes || '',
            preferedpayment:data.fields.PaymentMethodName || '',
            terms:data.fields.TermsName || '',
            deliverymethod:data.fields.ShippingMethodName || '',
            accountnumber:data.fields.ClientNo || 0.00,
            isContractor:data.fields.Contractor || false,
            issupplier: data.fields.IsSupplier || false,
            iscustomer: data.fields.IsCustomer || false,
            // openingbalancedate: data.fields.RewardPointsOpeningDate ? moment(data.fields.RewardPointsOpeningDate).format('DD/MM/YYYY') : "",
            // taxcode:data.fields.TaxCodeName || templateObject.defaultsaletaxcode.get()
        };
        if((data.fields.Street === data.fields.BillStreet) && (data.fields.Street2 === data.fields.BillStreet2)
            && (data.fields.State === data.fields.BillState)&& (data.fields.Postcode === data.fields.Postcode)
            && (data.fields.Country === data.fields.Billcountry)){
            templateObject.isSameAddress.set(true);
        }
        if(data.fields.Contractor === true){
            // $('#isformcontractor')
            $('#isformcontractor').attr("checked","checked");
        } else {
            $('#isformcontractor').removeAttr("checked");
        }
        templateObject.getOverviewAPData(data.fields.ClientName);
        templateObject.records.set(lineItemObj);
        /* START attachment */
        templateObject.attachmentCount.set(0);
        if(data.fields.Attachments){
            if(data.fields.Attachments.length){
                templateObject.attachmentCount.set(data.fields.Attachments.length);
                templateObject.uploadedFiles.set(data.fields.Attachments);

            }
        }
        /* END  attachment */
        //templateObject.getAllProductRecentTransactions(data.fields.ClientName);
        $('.fullScreenSpin').css('display','none');
    }
    function setInitialForEmptyCurrentID() {
        let lineItemObj = {
            id : '',
            lid : 'Add Supplier',
            company : '',
            email : '',
            title : '',
            firstname : '',
            middlename : '',
            lastname : '',
            tfn: '',
            phone : '',
            mobile:  '',
            fax: '',
            shippingaddress : '',
            scity : '',
            sstate : '',
            spostalcode : '',
            scountry : LoggedCountry || '',
            billingaddress : '',
            bcity : '',
            bstate : '',
            bpostalcode : '',
            bcountry : LoggedCountry || '',
            custFld1 : '',
            custFld2 : ''
        };
        templateObject.isSameAddress.set(true);
        templateObject.records.set(lineItemObj);
        setTimeout(function () {
            $('#tblTransactionlist').DataTable();
            $('.supplierTab').trigger('click');
            $('.fullScreenSpin').css('display','none');
        }, 100);
        setTimeout(function () {
            $('#sltTerms').val(templateObject.defaultpurchaseterm.get()||'');

        }, 2000);
        $('.fullScreenSpin').css('display','none');
    }

    if(currentId.id === "undefined" || currentId.name === "undefined"){
        setInitialForEmptyCurrentID();
    } else {
        if(!isNaN(currentId.id)){
            supplierID = currentId.id;
            templateObject.getEmployeeData();
        } else if((currentId.name)){
            supplierID = currentId.name.replace(/%20/g, " ");
            templateObject.getEmployeeDataByName();
        } else {
            setInitialForEmptyCurrentID();
        }
    }

    templateObject.getSuppliersList = function () {
        getVS1Data('TSupplierVS1').then(function (dataObject) {
            if(dataObject.length === 0){
                contactService.getAllSupplierSideDataVS1().then(function (data) {
                    setAllSupplierSideDataVS1(data);
                }).catch(function (err) {

                });
            } else {
                let data = JSON.parse(dataObject[0].data);
                setAllSupplierSideDataVS1(data);
            }
        }).catch(function (err) {
            contactService.getAllSupplierSideDataVS1().then(function (data) {
                setAllSupplierSideDataVS1(data);
            }).catch(function (err) {

            });
        });
    };
    function setAllSupplierSideDataVS1(data) {
        let lineItemsSupp = [];
        for (let j=0; j < data.tsuppliervs1.length; j++){
            let classname ='';
            if(!isNaN(currentId.id)){
                if (data.tsuppliervs1[j].fields.ID === parseInt(currentId.id)){
                    classname = 'currentSelect';
                }
            }
            const dataListSupp = {
                id: data.tsuppliervs1[j].fields.ID || '',
                company: data.tsuppliervs1[j].fields.ClientName || '',
                classname: classname
            };
            lineItemsSupp.push(dataListSupp);
        }
        templateObject.supplierrecords.set(lineItemsSupp);
        if (templateObject.supplierrecords.get()){
            setTimeout(function () {
                $('.counter').text(lineItemsSupp.length + ' items');
            }, 100);
        }
    }
    templateObject.getSuppliersList();

    setTimeout(function () {
        const x = window.matchMedia("(max-width: 1024px)");
        function mediaQuery(x) {
            if (x.matches) {
                $("#displayList").removeClass("col-2");
                $("#displayList").addClass("col-3");
                $("#displayInfo").removeClass("col-10");
                $("#displayInfo").addClass("col-9");
            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 500);
    setTimeout(function () {
        const x = window.matchMedia("(max-width: 420px)");
        const btnView = document.getElementById("btnsViewHide");
        function mediaQuery(x) {
            if (x.matches) {
                $("#displayList").removeClass("col-3");
                $("#displayList").addClass("col-12");
                $("#supplierListCard").removeClass("cardB");
                $("#supplierListCard").addClass("cardB420");
                btnsViewHide.style.display = "none";
                $("#displayInfo").removeClass("col-10");
                $("#displayInfo").addClass("col-12");
            }
        }
        mediaQuery(x);
        x.addListener(mediaQuery)
    }, 500);

    $(document).on("click", "#paymentmethodList tbody tr", function(e) {
        let table = $(this);
        let linePaymentMethod = table.find(".colName").text();
        $("#sltPreferredPayment").val(linePaymentMethod);
        $('#paymentMethodModal').modal('toggle');
    });
    $(document).ready(function () {
        setTimeout(function () {
            $('#sltTerms').editableSelect();
            $('#sltPreferredPayment').editableSelect();
            $('#sltTerms').editableSelect()
            .on('click.editable-select', function (e, li) {
            var $earch = $(this);
            var offset = $earch.offset();
            var termsDataName = e.target.value || '';
            $('#edtTermsID').val('');
            if (e.pageX > offset.left + $earch.width() - 8) { // X button 16px wide?
                $('#termsListModal').modal('toggle');
            } else {
                if (termsDataName.replace(/\s/g, '') != '') {
                    $('#termModalHeader').text('Edit Terms');
                    getVS1Data('TTermsVS1').then(function (dataObject) { //edit to test indexdb
                        if (dataObject.length == 0) {
                            $('.fullScreenSpin').css('display', 'inline-block');
                            sideBarService.getTermsVS1().then(function (data) {
                                for (let i in data.ttermsvs1) {
                                    if (data.ttermsvs1[i].TermsName === termsDataName) {
                                        $('#edtTermsID').val(data.ttermsvs1[i].Id);
                                        $('#edtDays').val(data.ttermsvs1[i].Days);
                                        $('#edtName').val(data.ttermsvs1[i].TermsName);
                                        $('#edtDesc').val(data.ttermsvs1[i].Description);
                                        if (data.ttermsvs1[i].IsEOM === true) {
                                            $('#isEOM').prop('checked', true);
                                        } else {
                                            $('#isEOM').prop('checked', false);
                                        }
                                        if (data.ttermsvs1[i].IsEOMPlus === true) {
                                            $('#isEOMPlus').prop('checked', true);
                                        } else {
                                            $('#isEOMPlus').prop('checked', false);
                                        }
                                        if (data.ttermsvs1[i].isSalesdefault === true) {
                                            $('#chkCustomerDef').prop('checked', true);
                                        } else {
                                            $('#chkCustomerDef').prop('checked', false);
                                        }
                                        if (data.ttermsvs1[i].isPurchasedefault === true) {
                                            $('#chkSupplierDef').prop('checked', true);
                                        } else {
                                            $('#chkSupplierDef').prop('checked', false);
                                        }
                                    }
                                }
                                setTimeout(function () {
                                    $('.fullScreenSpin').css('display', 'none');
                                    $('#newTermsModal').modal('toggle');
                                }, 200);
                            });
                        } else {
                            let data = JSON.parse(dataObject[0].data);
                            let useData = data.ttermsvs1;
                            for (let i in useData) {
                                if (useData[i].TermsName === termsDataName) {
                                    $('#edtTermsID').val(useData[i].Id);
                                    $('#edtDays').val(useData[i].Days);
                                    $('#edtName').val(useData[i].TermsName);
                                    $('#edtDesc').val(useData[i].Description);
                                    if (useData[i].IsEOM === true) {
                                        $('#isEOM').prop('checked', true);
                                    } else {
                                        $('#isEOM').prop('checked', false);
                                    }
                                    if (useData[i].IsEOMPlus === true) {
                                        $('#isEOMPlus').prop('checked', true);
                                    } else {
                                        $('#isEOMPlus').prop('checked', false);
                                    }
                                    if (useData[i].isSalesdefault === true) {
                                        $('#chkCustomerDef').prop('checked', true);
                                    } else {
                                        $('#chkCustomerDef').prop('checked', false);
                                    }
                                    if (useData[i].isPurchasedefault === true) {
                                        $('#chkSupplierDef').prop('checked', true);
                                    } else {
                                        $('#chkSupplierDef').prop('checked', false);
                                    }
                                }
                            }
                            setTimeout(function () {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newTermsModal').modal('toggle');
                            }, 200);
                        }
                    }).catch(function (err) {
                        $('.fullScreenSpin').css('display', 'inline-block');
                        sideBarService.getTermsVS1().then(function (data) {
                            for (let i in data.ttermsvs1) {
                                if (data.ttermsvs1[i].TermsName === termsDataName) {
                                    $('#edtTermsID').val(data.ttermsvs1[i].Id);
                                    $('#edtDays').val(data.ttermsvs1[i].Days);
                                    $('#edtName').val(data.ttermsvs1[i].TermsName);
                                    $('#edtDesc').val(data.ttermsvs1[i].Description);
                                    if (data.ttermsvs1[i].IsEOM === true) {
                                        $('#isEOM').prop('checked', true);
                                    } else {
                                        $('#isEOM').prop('checked', false);
                                    }
                                    if (data.ttermsvs1[i].IsEOMPlus === true) {
                                        $('#isEOMPlus').prop('checked', true);
                                    } else {
                                        $('#isEOMPlus').prop('checked', false);
                                    }
                                    if (data.ttermsvs1[i].isSalesdefault === true) {
                                        $('#chkCustomerDef').prop('checked', true);
                                    } else {
                                        $('#chkCustomerDef').prop('checked', false);
                                    }
                                    if (data.ttermsvs1[i].isPurchasedefault === true) {
                                        $('#chkSupplierDef').prop('checked', true);
                                    } else {
                                        $('#chkSupplierDef').prop('checked', false);
                                    }
                                }
                            }
                            setTimeout(function () {
                                $('.fullScreenSpin').css('display', 'none');
                                $('#newTermsModal').modal('toggle');
                            }, 200);
                        });
                    });
                } else {
                    $('#termsListModal').modal();
                    setTimeout(function () {
                        $('#termsList_filter .form-control-sm').focus();
                        $('#termsList_filter .form-control-sm').val('');
                        $('#termsList_filter .form-control-sm').trigger("input");
                        var datatable = $('#termsList').DataTable();
                        datatable.draw();
                        $('#termsList_filter .form-control-sm').trigger("input");
                    }, 500);
                }
            }
        });


 $('#sltPreferredPayment').editableSelect()
 .on('click.editable-select', function (e, li) {
    var $earch = $(event.currentTarget);
        var offset = $earch.offset();

        // let customername = $('#edtCustomerName').val();
        const templateObject = Template.instance();
        $("#selectPaymentMethodLineID").val('');
        $('#edtPaymentMethodID').val('');
        $('#paymentMethodHeader').text('New Payment Method');
            var paymentDataName = $(event.target).val() || '';
            if (event.pageX > offset.left + $earch.width() - 10) { // X button 16px wide?
                $('#paymentMethodModal').modal('toggle');
                var targetID = $(event.target).closest('tr').attr('id');
                $('#selectPaymentMethodLineID').val(targetID);
                setTimeout(function () {
                    $('#paymentmethodList_filter .form-control-sm').focus();
                    $('#paymentmethodList_filter .form-control-sm').val('');
                    $('#paymentmethodList_filter .form-control-sm').trigger("input");

                    var datatable = $('#paymentmethodList').DataTable();
                    datatable.draw();
                    $('#paymentmethodList_filter .form-control-sm').trigger("input");

                }, 500);
            } else {
                // var productDataID = $(event.target).attr('prodid').replace(/\s/g, '') || '';
                if (paymentDataName.replace(/\s/g, '') != '') {
                  var targetID = $(event.target).closest('tr').attr('id');
                  $('#selectPaymentMethodLineID').val(targetID);

                  $('#paymentMethodHeader').text('Edit Payment Method');

                  getVS1Data('TPaymentMethod').then(function(dataObject) {
                      if (dataObject.length == 0) {
                          $('.fullScreenSpin').css('display', 'inline-block');
                          sideBarService.getPaymentMethodDataVS1().then(function(data) {
                              for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                                  if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                                      $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                                      $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                      if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
                                          $('#isformcreditcard').prop('checked', true);
                                      } else {
                                          $('#isformcreditcard').prop('checked', false);
                                      }
                                  }
                              }
                              setTimeout(function() {
                                  $('.fullScreenSpin').css('display', 'none');
                                  $('#newPaymentMethodModal').modal('toggle');
                              }, 200);
                          });
                      } else {
                          let data = JSON.parse(dataObject[0].data);
                          let useData = data.tpaymentmethodvs1;

                          for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                              if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                                  $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                                  $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                  if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
                                      $('#isformcreditcard').prop('checked', true);
                                  } else {
                                      $('#isformcreditcard').prop('checked', false);
                                  }
                              }
                          }
                          setTimeout(function() {
                              $('.fullScreenSpin').css('display', 'none');
                              $('#newPaymentMethodModal').modal('toggle');
                          }, 200);
                      }
                  }).catch(function(err) {
                      $('.fullScreenSpin').css('display', 'inline-block');
                      sideBarService.getPaymentMethodDataVS1().then(function(data) {
                          for (let i = 0; i < data.tpaymentmethodvs1.length; i++) {
                              if (data.tpaymentmethodvs1[i].fields.PaymentMethodName === paymentDataName) {
                                  $('#edtPaymentMethodID').val(data.tpaymentmethodvs1[i].fields.ID);
                                  $('#edtPaymentMethodName').val(data.tpaymentmethodvs1[i].fields.PaymentMethodName);
                                  if (data.tpaymentmethodvs1[i].fields.IsCreditCard === true) {
                                      $('#isformcreditcard').prop('checked', true);
                                  } else {
                                      $('#isformcreditcard').prop('checked', false);
                                  }
                              }
                          }
                          setTimeout(function() {
                              $('.fullScreenSpin').css('display', 'none');
                              $('#newPaymentMethodModal').modal('toggle');
                          }, 200);
                      });
                  });

                } else {
                    $('#paymentMethodModal').modal('toggle');
                    var targetID = $(event.target).closest('tr').attr('id');
                    $('#selectPaymentMethodLineID').val(targetID);
                    setTimeout(function () {
                        $('#paymentmethodList_filter .form-control-sm').focus();
                        $('#paymentmethodList_filter .form-control-sm').val('');
                        $('#paymentmethodList_filter .form-control-sm').trigger("input");

                        var datatable = $('#paymentmethodList').DataTable();
                        datatable.draw();
                        $('#paymentmethodList_filter .form-control-sm').trigger("input");

                    }, 500);
                }

            }

 });

 $(document).on("click", "#termsList tbody tr", function (e) {
     $('#sltTerms').val($(this).find(".colTermName").text());
    $('#termsListModal').modal('toggle');
});

},1000);
    });
});

Template.supplierscard.events({
    'click #supplierShipping-1': function (event) {
        if($(event.target).is(':checked')){
            $('.supplierShipping-2').css('display','none');

        }else{
            $('.supplierShipping-2').css('display','block');
        }
    },
    'click .openBalance': function (event) {
        let supplierName = $('#edtSupplierCompany').val() || '';
        if (supplierName !== "") {
            // if(supplierName.indexOf('^') > 0) {
            //   supplierName = supplierName.split('^')[0]
            // }
            window.open('/agedpayables?contact='+supplierName, '_self');
        } else {
            window.open('/agedpayables','_self');
        }
    },
    'click .btnBack':function(event){
        event.preventDefault();
        history.back(1);
    },
    'click #chkSameAsShipping':function(event){
        if($(event.target).is(':checked')){

            // let streetAddress = $('#edtSupplierShippingAddress').val();
            // let city = $('#edtSupplierShippingCity').val();
            // let state =  $('#edtSupplierShippingState').val();
            // let zipcode =  $('#edtSupplierShippingZIP').val();
            //
            // let country =  $('#sedtCountry').val();
            //  $('#edtSupplierBillingAddress').val(streetAddress);
            //  $('#edtSupplierBillingCity').val(city);
            //  $('#edtSupplierBillingState').val(state);
            //  $('#edtSupplierBillingZIP').val(zipcode);
            //  $('#bcountry').val(country);
        }else{
            // $('#edtSupplierBillingAddress').val('');
            // $('#edtSupplierBillingCity').val('');
            // $('#edtSupplierBillingState').val('');
            // $('#edtSupplierBillingZIP').val('');
            // $('#bcountry').val('');
        }
    },
    'click .btnSave': async function (event) {
        let templateObject = Template.instance();
        let contactService = new ContactService();
        if ($('#edtSupplierCompany').val() === ''){
            swal('Supplier Name should not be blank!', '', 'warning');
            e.preventDefault();
            return false;
        }
        $('.fullScreenSpin').css('display','inline-block');

        let company = $('#edtSupplierCompany').val()||'';
        let email = $('#edtSupplierCompanyEmail').val()||'';
        let title = $('#edtSupplierTitle').val()||'';
        let firstname = $('#edtSupplierFirstName').val()||'';
        let middlename = $('#edtSupplierMiddleName').val()||'';
        let lastname = $('#edtSupplierLastName').val()||'';
        let suffix = $('#suffix').val()||'';
        let phone = $('#edtSupplierPhone').val()||'';
        let mobile = $('#edtSupplierMobile').val()||'';
        let fax = $('#edtSupplierFax').val()||'';
        let accountno = $('#edtSupplierAccountNo').val()||'';
        let skype = $('#edtSupplierSkypeID').val()||'';
        let website = $('#edtSupplierWebsite').val()||'';
        let streetAddress = $('#edtSupplierShippingAddress').val()||'';
        let city = $('#edtSupplierShippingCity').val()||'';
        let state =  $('#edtSupplierShippingState').val()||'';
        let postalcode =  $('#edtSupplierShippingZIP').val()||'';
        let country =  $('#sedtCountry').val()||'';
        let bstreetAddress = '';
        let bcity = '';
        let bstate = '';
        let bpostalcode = '';
        let bcountry = '';
        let isContractor = false;
        let isCustomer = false;
        isCustomer = !!$('#chkSameAsCustomer').is(':checked');
        if($('#isformcontractor').is(':checked')){
            isContractor = true;
        }
        if($('#chkSameAsShipping').is(':checked')){
            bstreetAddress = streetAddress;
            bcity = city;
            bstate = state;
            bpostalcode = postalcode;
            bcountry = country;
        }else{
            bstreetAddress = $('#edtSupplierBillingAddress').val()||'';
            bcity = $('#edtSupplierBillingCity').val()||'';
            bstate =  $('#edtSupplierBillingState').val()||'';
            bpostalcode =  $('#edtSupplierBillingZIP').val()||'';
            bcountry =  $('#bcountry').val()||'';
        }
        let sltPaymentMethodName =  $('#sltPreferredPayment').val()||'';
        let sltTermsName =  $('#sltTerms').val()||'';
        let sltShippingMethodName =  '';
        let notes =  $('#txaNotes').val()||'';
        let suppaccountno =  $('#suppAccountNo').val()||'';

// add to custom field
        let custField1 = $('#edtSaleCustField1').val()||'';
        let custField2 = $('#edtSaleCustField2').val()||'';
        let custField3 = $('#edtSaleCustField3').val()||'';
        let custField4 = $('#edtCustomeField4').val()||'';

        const url = FlowRouter.current().path;
        const getemp_id = url.split('?id=');
        let currentEmployee = getemp_id[getemp_id.length - 1];
        let objDetails = '';
        let uploadedItems = templateObject.uploadedFiles.get();

        if(getemp_id[1]){
            currentEmployee = parseInt(currentEmployee);
            objDetails = {
                type: "TSupplierEx",
                fields: {
                    ID: currentEmployee,
                    Title:title,
                    ClientName:company,
                    FirstName: firstname,
                    CUSTFLD10:middlename,
                    LastName: lastname,
                    IsCustomer:isCustomer,
                    // TFN:suffix,
                    Email: email,
                    Phone: phone,
                    Mobile: mobile,
                    SkypeName: skype,
                    Faxnumber: fax,
                    // Sex: gender,
                    // Position: position,
                    Street: streetAddress,
                    Street2: city,
                    State: state,
                    PostCode:postalcode,
                    Country:country,
                    Contractor:isContractor,
                    BillStreet: bstreetAddress,
                    BillStreet2: bcity,
                    BillState: bstate,
                    BillPostCode:bpostalcode,
                    Billcountry:bcountry,
                    // CustFld1: custfield1,
                    // CustFld2: custfield2,
                    Notes:notes,
                    PaymentMethodName:sltPaymentMethodName,
                    TermsName:sltTermsName,
                    ShippingMethodName:sltShippingMethodName,
                    ClientNo:suppaccountno,
                    URL: website,
                    Attachments: uploadedItems,
                    CUSTFLD1: custField1,
                    CUSTFLD2: custField2,
                    CUSTFLD3: custField3,
                    // CUSTFLD4: custField4,
                    PublishOnVS1: true

                }
            };
        } else {
            let suppdupID = 0;
            let checkSuppData = await contactService.getCheckSuppliersData(company);
            if(checkSuppData.tsupplier.length){
                suppdupID = checkSuppData.tsupplier[0].Id;
                objDetails = {
                    type: "TSupplierEx",
                    fields: {
                        ID: suppdupID||0,
                        Title:title,
                        ClientName:company,
                        FirstName: firstname,
                        CUSTFLD10:middlename,
                        LastName: lastname,
                        IsCustomer:isCustomer,
                        // TFN:suffix,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Faxnumber: fax,
                        // Sex: gender,
                        // Position: position,
                        Street: streetAddress,
                        Street2: city,
                        State: state,
                        PostCode:postalcode,
                        Country:country,
                        Contractor:isContractor,
                        BillStreet: bstreetAddress,
                        BillStreet2: bcity,
                        BillState: bstate,
                        BillPostCode:bpostalcode,
                        Billcountry:bcountry,
                        // CustFld1: custfield1,
                        // CustFld2: custfield2,
                        Notes:notes,
                        PaymentMethodName:sltPaymentMethodName,
                        TermsName:sltTermsName,
                        ShippingMethodName:sltShippingMethodName,
                        ClientNo:suppaccountno,
                        URL: website,
                        Attachments: uploadedItems,
                        CUSTFLD1: custField1,
                        CUSTFLD2: custField2,
                        CUSTFLD3: custField3,
                        // CUSTFLD4: custField4,
                        PublishOnVS1: true

                    }
                };
            } else {
                objDetails = {
                    type: "TSupplierEx",
                    fields: {
                        Title:title,
                        ClientName:company,
                        FirstName: firstname,
                        CUSTFLD10:middlename,
                        LastName: lastname,
                        IsCustomer:isCustomer,
                        // TFN:suffix,
                        Email: email,
                        Phone: phone,
                        Mobile: mobile,
                        SkypeName: skype,
                        Faxnumber: fax,
                        // Sex: gender,
                        // Position: position,
                        Street: streetAddress,
                        Street2: city,
                        State: state,
                        PostCode:postalcode,
                        Country:country,
                        Contractor:isContractor,
                        BillStreet: bstreetAddress,
                        BillStreet2: bcity,
                        BillState: bstate,
                        BillPostCode:bpostalcode,
                        Billcountry:bcountry,
                        // CustFld1: custfield1,
                        // CustFld2: custfield2,
                        Notes:notes,
                        PaymentMethodName:sltPaymentMethodName,
                        TermsName:sltTermsName,
                        ShippingMethodName:sltShippingMethodName,
                        ClientNo:suppaccountno,
                        URL: website,
                        Attachments: uploadedItems,
                        CUSTFLD1: custField1,
                        CUSTFLD2: custField2,
                        CUSTFLD3: custField3,
                        // CUSTFLD4: custField4,
                        PublishOnVS1: true
                    }
                };
            }
        }

        contactService.saveSupplierEx(objDetails).then(function (objDetails) {
            let supplierSaveID = objDetails.fields.ID;
            if(supplierSaveID){
                //window.open('/supplierscard?id=' + supplierSaveID,'_self');
                //window.open('/supplierlist','_self');
                sideBarService.getAllSuppliersDataVS1(initialBaseDataLoad,0).then(function(dataReload) {
                  //console.log('getAllSuppliersDataVS1', dataReload)
                    addVS1Data('TSupplierVS1',JSON.stringify(dataReload)).then(function (datareturn) {
                        window.open('/supplierlist','_self');
                    }).catch(function (err) {
                        window.open('/supplierlist','_self');
                    });
                }).catch(function(err) {
                    window.open('/supplierlist','_self');
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
            $('.fullScreenSpin').css('display','none');
        });

    },
    'keyup .search': function (event) {
        var searchTerm = $(".search").val();
        var listItem = $('.results tbody').children('tr');
        var searchSplit = searchTerm.replace(/ /g, "'):containsi('");

        $.extend($.expr[':'], {'containsi': function(elem, i, match, array){
            return (elem.textContent || elem.innerText || '').toLowerCase().indexOf((match[3] || "").toLowerCase()) >= 0;
        }
                              });

        $(".results tbody tr").not(":containsi('" + searchSplit + "')").each(function(e){
            $(this).attr('visible','false');
        });

        $(".results tbody tr:containsi('" + searchSplit + "')").each(function(e){
            $(this).attr('visible','true');
        });

        var jobCount = $('.results tbody tr[visible="true"]').length;
        $('.counter').text(jobCount + ' items');

        if(jobCount == '0') {$('.no-result').show();}
        else {$('.no-result').hide();
             }
        if(searchTerm === ""){
            $(".results tbody tr").each(function(e){
                $(this).attr('visible','true');
                $('.no-result').hide();
            });

            //setTimeout(function () {
            var rowCount = $('.results tbody tr').length;
            $('.counter').text(rowCount + ' items');
            //}, 500);
        }

    },
    'click .tblSupplierSideList tbody tr': function (event) {
        const suppLineID = $(event.target).attr('id');
        if(suppLineID){
            window.open('/supplierscard?id=' + suppLineID,'_self');
        }
    },
    'click .chkDatatable' : function(event){
        const columns = $('#tblTransactionlist th');
        let columnDataValue = $(event.target).closest("div").find(".divcolumn").text();
        $.each(columns, function(i,v) {
            let className = v.classList;
            let replaceClass = className[1];
            if (v.innerText === columnDataValue){
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
        let checkPrefDetails = getCheckPrefDetails('tblTransactionlist');
        if (checkPrefDetails) {
            CloudPreference.remove({_id:checkPrefDetails._id}, function(err, idTag) {
                if (err) {

                }else{
                    Meteor._reload.reload();
                }
            });

        }
    },
    'click .saveTable' : function(event){
        let lineItems = [];
        //let datatable =$('#tblTransactionlist').DataTable();
        $('.columnSettings').each(function (index) {
            const $tblrow = $(this);
            const colTitle = $tblrow.find(".divcolumn").text() || '';
            const colWidth = $tblrow.find(".custom-range").val() || 0;
            const colthClass = $tblrow.find(".divcolumn").attr("valueupdate") || '';
            let colHidden = !$tblrow.find(".custom-control-input").is(':checked');
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
        let checkPrefDetails = getCheckPrefDetails('tblTransactionlist');
        if (checkPrefDetails) {
            CloudPreference.update({_id: checkPrefDetails._id},{$set: { userid: clientID, username:clientUsername, useremail:clientEmail,
                                                                       PrefGroup:'salesform', PrefName:'tblTransactionlist', published:true,
                                                                       customFields:lineItems,
                                                                       updatedAt: new Date() }}, function(err, idTag) {
                if (err) {
                    $('#myModal2').modal('toggle');
                } else {
                    $('#myModal2').modal('toggle');
                }
            });
        } else {
            CloudPreference.insert({ userid: clientID, username:clientUsername, useremail:clientEmail,
                                    PrefGroup:'salesform', PrefName:'tblTransactionlist', published:true,
                                    customFields:lineItems,
                                    createdAt: new Date() }, function(err, idTag) {
                if (err) {
                    $('#myModal2').modal('toggle');
                } else {
                    $('#myModal2').modal('toggle');
                }
            });
        }
        $('#myModal2').modal('toggle');
        //Meteor._reload.reload();
    },
    'blur .divcolumn' : function(event){
        let columData = $(event.target).text();

        let columnDatanIndex = $(event.target).closest("div.columnSettings").attr('id');

        var datable = $('#tblTransactionlist').DataTable();
        var title = datable.column( columnDatanIndex ).header();
        $(title).html(columData);

    },
    'change .rngRange' : function(event){
        let range = $(event.target).val();
        // $(event.target).closest("div.divColWidth").find(".spWidth").html(range+'px');

        // let columData = $(event.target).closest("div.divColWidth").find(".spWidth").attr("value");
        let columnDataValue = $(event.target).closest("div").prev().find(".divcolumn").text();
        var datable = $('#tblTransactionlist th');
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
        var columns = $('#tblTransactionlist th');

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
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletocsv').click();
        $('.fullScreenSpin').css('display','none');

    },
    'click .printConfirm' : function(event){

        $('.fullScreenSpin').css('display','inline-block');
        jQuery('#tblTransactionlist_wrapper .dt-buttons .btntabletopdf').click();
        $('.fullScreenSpin').css('display','none');
    },
    'click .btnRefresh': function () {
        Meteor._reload.reload();
    },
    'click #formCheck-2': function () {
        if($(event.target).is(':checked')){
            $('#autoUpdate').css('display','none');
        }else{
            $('#autoUpdate').css('display','block');
        }
    },
    'click #formCheck-one': function (event) {
        if($(event.target).is(':checked')){
            $('.checkbox1div').css('display','block');

        }else{
            $('.checkbox1div').css('display','none');
        }
    },
    'click #formCheck-two': function (event) {
        if($(event.target).is(':checked')){
            $('.checkbox2div').css('display','block');
        }else{
            $('.checkbox2div').css('display','none');
        }
    },
    'click #formCheck-three': function (event) {
        if($(event.target).is(':checked')){
            $('.checkbox3div').css('display','block');
        }else{
            $('.checkbox3div').css('display','none');
        }
    },
    'click #formCheck-four': function (event) {
        if($(event.target).is(':checked')){
            $('.checkbox4div').css('display','block');
        }else{
            $('.checkbox4div').css('display','none');
        }
    },
    'blur .customField1Text': function (event) {
        var inputValue1 = $('.customField1Text').text();
        $('.lblCustomField1').text(inputValue1);
    },
    'blur .customField2Text': function (event) {
        var inputValue2 = $('.customField2Text').text();
        $('.lblCustomField2').text(inputValue2);
    },
    'blur .customField3Text': function (event) {
        var inputValue3 = $('.customField3Text').text();
        $('.lblCustomField3').text(inputValue3);
    },
    'blur .customField4Text': function (event) {
        var inputValue4 = $('.customField4Text').text();
        $('.lblCustomField4').text(inputValue4);
    },
    'click .btnSaveSettings': function(event){
        $('.lblCustomField1').html('');
        $('.lblCustomField2').html('');
        $('.lblCustomField3').html('');
        $('.lblCustomField4').html('');
        let getchkcustomField1 = true;
        let getchkcustomField2 =  true;
        let getchkcustomField3 =  true;
        let getchkcustomField4 =  true;
        let getcustomField1 = $('.customField1Text').html();
        let getcustomField2 = $('.customField2Text').html();
        let getcustomField3 = $('.customField3Text').html();
        let getcustomField4 = $('.customField4Text').html();
        if($('#formCheck-one').is(':checked')){
            getchkcustomField1 = false;
        }
        if($('#formCheck-two').is(':checked')){
            getchkcustomField2 = false;
        }
        if($('#formCheck-three').is(':checked')){
            getchkcustomField3 = false;
        }
        if($('#formCheck-four').is(':checked')){
            getchkcustomField4 = false;
        }
        let checkPrefDetails = getCheckPrefDetails('supplierscard');
        if (checkPrefDetails) {
            CloudPreference.update({ _id: checkPrefDetails._id},{ $set: {username:clientUsername,useremail:clientEmail,
                                                                         PrefGroup:'contactform',PrefName:'supplierscard',published:true,
                                                                         customFields:[{
                                                                             index: '1',
                                                                             label: getcustomField1,
                                                                             hidden: getchkcustomField1
                                                                         },{
                                                                             index: '2',
                                                                             label: getcustomField2,
                                                                             hidden: getchkcustomField2
                                                                         },{
                                                                             index: '3',
                                                                             label: getcustomField3,
                                                                             hidden: getchkcustomField3
                                                                         },{
                                                                             index: '4',
                                                                             label: getcustomField4,
                                                                             hidden: getchkcustomField4
                                                                         }
                                                                                      ],
                                                                         updatedAt: new Date() }}, function(err, idTag) {
                if (err) {
                    $('#customfieldModal').modal('toggle');
                } else {
                    $('#customfieldModal').modal('toggle');
                }
            });
        } else {
            CloudPreference.insert({ userid: clientID,username:clientUsername,useremail:clientEmail,
                                    PrefGroup:'contactform',PrefName:'supplierscard',published:true,
                                    customFields:[{
                                        index: '1',
                                        label: getcustomField1,
                                        hidden: getchkcustomField1
                                    },{
                                        index: '2',
                                        label: getcustomField2,
                                        hidden: getchkcustomField2
                                    },{
                                        index: '3',
                                        label: getcustomField3,
                                        hidden: getchkcustomField3
                                    },{
                                        index: '4',
                                        label: getcustomField4,
                                        hidden: getchkcustomField4
                                    }
                                                 ],
                                    createdAt: new Date() }, function(err, idTag) {
                if (err) {
                    $('#customfieldModal').modal('toggle');
                } else {
                    $('#customfieldModal').modal('toggle');
                }
            });
        }
    },
    'click .btnResetSettings': function(event){
        let checkPrefDetails = getCheckPrefDetails('supplierscard');
        if (checkPrefDetails) {
            CloudPreference.remove({_id:checkPrefDetails._id}, function(err, idTag) {
                if (err) {

                } else {
                    Meteor._reload.reload();
                }
            });
        }
    },
    'click .new_attachment_btn':function(event){
        $('#attachment-upload').trigger('click');
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
    'click .img_new_attachment_btn':function(event){
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
    'click .remove-attachment': function (event,ui) {
        let tempObj = Template.instance();
        let attachmentID = parseInt(event.target.id.split('remove-attachment-')[1]);
        if(tempObj.$("#confirm-action-"+attachmentID).length){
            tempObj.$("#confirm-action-"+attachmentID).remove();
        }else{
            let actionElement = '<div class="confirm-action" id="confirm-action-' + attachmentID +'"><a class="confirm-delete-attachment btn btn-default" id="delete-attachment-'+ attachmentID +'">'
            + 'Delete</a><button class="save-to-library btn btn-default">Remove & save to File Library</button></div>';
            tempObj.$('#attachment-name-'+attachmentID).append(actionElement);
        }
        tempObj.$("#new-attachment2-tooltip").show();

    },
    'click .file-name': function(event){
        let attachmentID = parseInt(event.currentTarget.parentNode.id.split('attachment-name-')[1]);
        let templateObj = Template.instance();
        let uploadedFiles = templateObj.uploadedFiles.get();

        $('#myModalAttachment').modal('hide');
        let previewFile = {};
        let input = uploadedFiles[attachmentID].fields.Description;
        previewFile.link = 'data:'+input+';base64,'+uploadedFiles[attachmentID].fields.Attachment;
        previewFile.name = uploadedFiles[attachmentID].fields.AttachmentName;
        let type =  uploadedFiles[attachmentID].fields.Description;
        if(type ==='application/pdf'){
            previewFile.class = 'pdf-class';
        }else if(type === 'application/msword' || type ==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'){
            previewFile.class = 'docx-class';
        }
        else if(type === 'application/vnd.ms-excel' || type ==='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            previewFile.class = 'excel-class';
        }
        else if(type === 'application/vnd.ms-powerpoint' || type ==='application/vnd.openxmlformats-officedocument.presentationml.presentation'){
            previewFile.class = 'ppt-class';
        }
        else if(type === 'application/vnd.oasis.opendocument.formula' || type ==='text/csv' || type ==='text/plain' || type ==='text/rtf'){
            previewFile.class = 'txt-class';
        }
        else if(type === 'application/zip' || type ==='application/rar' || type ==='application/x-zip-compressed' || type ==='application/x-zip,application/x-7z-compressed'){
            previewFile.class = 'zip-class';
        }
        else {
            previewFile.class = 'default-class';
        }

        if(type.split('/')[0]==='image'){
            previewFile.image = true
        }else {
            previewFile.image = false
        }
        templateObj.uploadedFile.set(previewFile);

        $('#files_view').modal('show');

        return;
    },
    'click .confirm-delete-attachment': function (event,ui) {
        let tempObj = Template.instance();
        tempObj.$("#new-attachment2-tooltip").show();
        let attachmentID = parseInt(event.target.id.split('delete-attachment-')[1]);
        let  uploadedArray = tempObj.uploadedFiles.get();
        let attachmentCount = tempObj.attachmentCount.get();
        $('#attachment-upload').val('');
        uploadedArray.splice(attachmentID,1);
        tempObj.uploadedFiles.set(uploadedArray);
        attachmentCount --;
        if(attachmentCount === 0) {
            let elementToAdd = '<div class="col inboxcol1"><img src="/icons/nofiles_icon.jpg" class=""></div> <div class="col inboxcol2"> <div>Upload  files or add files from the file library</div> <p style="color: #ababab;">Only users with access to your company can view these files</p></div>';
            $('#file-display').html(elementToAdd);
        }
        tempObj.attachmentCount.set(attachmentCount);
        if(uploadedArray.length > 0){
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedArray);
        }else{
            $(".attchment-tooltip").show();
        }
    },
    'click .attachmentTab':function(){
        let templateInstance = Template.instance();
        let uploadedFileArray = templateInstance.uploadedFiles.get();
        if(uploadedFileArray.length > 0){
            let utilityService = new UtilityService();
            utilityService.showUploadedAttachmentTabs(uploadedFileArray);
        }else{
            $(".attchment-tooltip").show();
        }
    },
    'click .btnView': function (e) {
        var btnView = document.getElementById("btnView");
        var btnHide = document.getElementById("btnHide");

        var displayList = document.getElementById("displayList");
        var displayInfo = document.getElementById("displayInfo");
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
    'click .transTab' : function(event){
        let templateObject = Template.instance();
        let supplierName = $('#edtSupplierCompany').val();
        templateObject.getAllProductRecentTransactions(supplierName);
    },
    'click .btnDeleteSupplier': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let templateObject = Template.instance();
        let contactService2 = new ContactService();
        let currentId = FlowRouter.current().queryParams;
        let objDetails = '';

        if (!isNaN(currentId.id)) {
            let currentSupplier = parseInt(currentId.id);
            objDetails = {
                type: "TSupplierEx",
                fields: {
                    ID: currentSupplier,
                    Active: false
                }
            };
            contactService2.saveSupplierEx(objDetails).then(function (objDetails) {
                FlowRouter.go('/supplierlist?success=true');
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
            FlowRouter.go('/supplierlist?success=true');
        }
        $('#deleteSupplierModal').modal('toggle');
    },
    'click .btnTask': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/crmoverview?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnEmail': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/crmoverview?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnAppointment': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/appointments?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnBill': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/billcard?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnCredit': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/creditcard?supplierid=' + supplierID);
        } else {

        }
    },
    'click .btnPurchaseOrder': function (event) {
        $('.fullScreenSpin').css('display', 'inline-block');
        let currentId = FlowRouter.current().queryParams;
        if (!isNaN(currentId.id)) {
            let supplierID = parseInt(currentId.id);
            FlowRouter.go('/purchaseordercard?supplierid=' + supplierID);
        } else {

        }
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

Template.supplierscard.helpers({
    record : () => {
        return Template.instance().records.get();
    },
    countryList: () => {
        return Template.instance().countryData.get();
    },
    supplierrecords: () => {
        return Template.instance().supplierrecords.get().sort(function(a, b){
            if (a.company === 'NA') {
                return 1;
            }
            else if (b.company === 'NA') {
                return -1;
            }
            return (a.company.toUpperCase() > b.company.toUpperCase()) ? 1 : -1;
        });
    },
    datatablerecords : () => {
        return Template.instance().datatablerecords.get().sort(function(a, b){
            if (a.orderdate === 'NA') {
                return 1;
            }
            else if (b.orderdate === 'NA') {
                return -1;
            }
            return (a.orderdate.toUpperCase() > b.orderdate.toUpperCase()) ? 1 : -1;
        });
    },
    tableheaderrecords: () => {
        return Template.instance().tableheaderrecords.get();
    },
    salesCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'tblSalesOverview'});
    },
    currentdate : () => {
        const currentDate = new Date();
        return moment(currentDate).format("DD/MM/YYYY");
    },
    preferredPaymentList: () => {
        return Template.instance().preferredPaymentList.get();
    },
    termsList: () => {
        return Template.instance().termsList.get();
    },
    deliveryMethodList: () => {
        return Template.instance().deliveryMethodList.get();
    },
    taxCodeList: () => {
        return Template.instance().taxCodeList.get();
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
    contactCloudPreferenceRec: () => {
        return CloudPreference.findOne({userid:Session.get('mycloudLogonID'),PrefName:'supplierscard'});
    },
    isSameAddress: () => {
        return Template.instance().isSameAddress.get();
    },
    isMobileDevices: () =>{
        let isMobile = false; //initiate as false
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
           || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) {
            isMobile = true;
        }
        return isMobile;
    }
});

function getCheckPrefDetails(prefName) {
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
            checkPrefDetails = CloudPreference.findOne({userid: clientID, PrefName: prefName});
        }
    }
    return checkPrefDetails;
}
