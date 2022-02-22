//TODO put names of all objects here.
ERPObjects = function () {
    var objects = {
        TAccount: "TAccount",
        TAccountType: "TAccountType",
        TAppointment: "TAppointmentEx",
        TAPIFunction: "TAPIFunction",
        ARList: "ARList",
        TBankCode: "TBankCode",
        TBill: "TBill",
        TCashSale: "TCashSale",
        TClientType: "TClientType",
        TChequeEx: "TChequeEx",
        TCheque: "TCheque",
        TCompanyType: "TCompanyType",
        TContact: "TContact",
        TCountries: "TCountries",
        TCredit: "TCredit",
        TCreditEx: "TCreditEx",
        TCurrency: "TCurrency",
        TCustomer: "TCustomer",
        TCustomerEx: "TCustomerEx",
        TCustomerEquipment: "TCustomerEquipment",
        TCustomerPayment: "TCustomerPayment",
        TDeptClass: "TDeptClass",
        TERPSysInfo: "TERPSysInfo",
        TEmployee: "TEmployee",
        TEmployeeEx: "TEmployeeEx",
        TemployeeAttachment: "TemployeeAttachment",
        TemployeePicture: "TemployeePicture",
        TEquipment: "TEquipment",
        TFormula: "TFormula",
        TInvoice: "TInvoice",
        TInvoiceEx: "TInvoiceEx",
        TBillEx: "TBillEx",
        TLeads: "TLeads",
        TLeadStatusType: "TLeadStatusType",
        TLeaveAccruals: "TLeaveAccruals",
        TManufacture: "TManufacture",
        TMarketingContact: "TMarketingContact",
        TModel: "TModel",
        TOtherContact: "TOtherContact",
        TPaymentMethod: "TPaymentMethod",
        TpaySplit: "TpaySplit",
        TPhoneSupportLog: "TPhoneSupportLog",
        TPhoneSupportType: "TPhoneSupportType",
        TPhoneSupportVersion: "TPhoneSupportVersion",
        TPosKeypad: "TPosKeypad",
        TPosTill: "TPosTill",
        TProductJPGPicture: "TProductJPGPicture",
        TProduct: "TProduct",
        // TProductClassQuantity: "TProductClassQuantity",
        TProductWeb: "TProductWeb",
        TProspect: "TProspect",
        TProspectEx: "TProspectEx",
        TPurchaseOrder: "TPurchaseOrder",
        TPurchaseOrderEx: "TPurchaseOrderEx",
        TRepairs: "TRepairs",
        TQuote: "TQuote",
        TQuoteEx: "TQuoteEx",
        TRefundSale: "TRefundSale",
        TRegionalOptions: "TRegionalOptions",
        TRepObjStatementList: "TRepObjStatementList",
        TSalesOrder: "TSalesOrder",
        TSalesOrderEx: "TSalesOrderEx",
        TSalesCategory: "TSalesCategory",
        TServices: "TServices",
        TShippingAddress: "TShippingAddress",
        TShippingMethod: "TShippingMethod",
        TSmartOrder: "TSmartOrder",
        TSource: "TSource",
        TStockAdjustEntry: "TStockAdjustEntry",
        TStockTransferEntry: "TStockTransferEntry",
        TSupplier: "TSupplier",
        TSupplierEx: "TSupplierEx",
        TTaxCode: "TTaxCode",
        TTasks: "TTasks",
        TTerms: "TTerms",
        TTimeSheet: "TTimeSheet",
        TTimeSheetEntry: "TTimeSheetEntry",
        TToDo: "TToDo",
        TUser: "TUser",
        TExpenseClaim: "TExpenseClaim",
        TFixedAssets: "TFixedAssets",
        TProductSalesDetailsReport:"TProductSalesDetailsReport",
        ERPTaxCode: "TTaxCode",
        BalanceSheetReport: "BalanceSheetReport",
        ProfitLossReport: "ProfitAndLossReport",
        TCompanyInfo: "TCompanyInfo",
        ERPAccount: "TAccount",
        ERPAccountType: "TAccountType",
        TFixedAssetType: "TFixedAssetType",
        TAttachment: "TAttachment",
        TBillLines:"TBillLines",
        TSupplierPayment:"TSupplierPayment",
        SaleGroup:"SaleGroup",
        TExpenseClaimReport:"TExpenseClaimReport",
        APList:"APList",
        TDashboardAccountSummaryReport:"TDashboardAccountSummaryReport",
        TTrialBalanceReport: "TTrialBalanceReport",
        TAccountRunningBalanceReport: "TAccountRunningBalanceReport",
        TProfitAndLossPeriodCompareReport: "TProfitAndLossPeriodCompareReport",
        TTaxSummaryReport: "TTaxSummaryReport",
        TSummarySheetReport: "TSummarySheetReport",
        TBillReport: "TBillReport",
        TGeneralLedgerReport: "TGeneralLedgerReport",
        TUnitOfMeasure:"TUnitOfMeasure",
        TProductClassQuantity: "TProductClassQuantity",
        TProductBarcode:"TProductBarcode",
        TProductPicture:"TProductPicture",
        TERPForm:"TERPForm",
        TEmployeeFormAccess:"TEmployeeFormAccess",
        TEmployeeFormAccessDetail:"TEmployeeFormAccessDetail",
        TSaleClientSignature:"TSaleClientSignature",
        TInvoiceBackOrder: "TInvoiceBackOrder",
        TChequeStatus: "TChequeStatus",
        TCreditStatus: "TCreditStatus",
        TBillStatus: "TBillStatus",
        TReturnAuthorityStatus: "TReturnAuthorityStatus",
        TCustomerReturnStatusStatus: "TCustomerReturnStatusStatus",
        // TClient:"TClient",
        TProductClass: "TProductClass",
        TCustPayments: "TCustPayments",
        TSuppPayments: "TSuppPayments",
        TARReport:"TARReport",
        TAPReport:"TAPReport",
        TSalesList:"TSalesList",
        TbillReport:"TbillReport",
        TStatementList:"TStatementList",
        TStatementForCustomer:"TStatementForCustomer",
        TJob:"TJob",
        TJobEx:"TJobEx",
        TERPCombinedContacts:"TERPCombinedContacts",
        TPaymentList:"TPaymentList",
        TJournalEntry:"TJournalEntry",
        TJournalEntryLines:"TJournalEntryLines",
        TAppUser:"TAppUser",
        BackOrderSalesList:"BackOrderSalesList",
        TBankAccountReport:"TBankAccountReport",
        TCustomerVS1:"TCustomerVS1",
        TJobVS1:"TJobVS1",
        TOtherContactVS1:"TOtherContactVS1",
        TProspectVS1:"TProspectVS1",
        TSupplierVS1:"TSupplierVS1",
        TProductVS1:"TProductVS1",
        TERPCombinedContactsVS1:"TERPCombinedContactsVS1",
        TpurchaseOrderBackOrder:"TpurchaseOrderBackOrder",
        TpurchaseOrderNonBackOrder:"TpurchaseOrderNonBackOrder",
        TinvoiceBackorder:"TinvoiceBackorder",
        TInvoiceNonBackOrder:"TInvoiceNonBackOrder",
        TsalesOrderBackOrder:"TsalesOrderBackOrder",
        TsalesOrderNonBackOrder:"TsalesOrderNonBackOrder",
        TAccountVS1:"TAccountVS1",
        TTaxcodeVS1:"TTaxcodeVS1",
        TTermsVS1:"TTermsVS1",
        TPaymentMethodVS1:"TPaymentMethodVS1",
        TcompLogo:"TcompLogo",
        TEmployeePicture:"TEmployeePicture",
        TContractorPaymentSummary:"TContractorPaymentSummary",
        TStSStrain:"TStSStrain",
        TProductBin:"TProductBin",
        TProfitAndLossPeriodReport:"TProfitAndLossPeriodReport",
        TProductStocknSalePeriodReport:"TProductStocknSalePeriodReport",
        TReconciliation:"TReconciliation",
        TToBeReconciledWithDrawal:"TToBeReconciledWithDrawal",
        TToBeReconciledDeposit:"TToBeReconciledDeposit",
        TTimesheetEntryDetails:"TTimesheetEntryDetails",
        T_VS1_Report_Productmovement:"T_VS1_Report_Productmovement",
        TGlobalSearchReport:"TGlobalSearchReport",
        TProductLocationQty:"TProductLocationQty",
        TAppointmentPreferences:"TAppointmentPreferences",
        TAppointmentsTimeLog:"TAppointmentsTimeLog",
        TTransactionListReport:"TTransactionListReport",
        TVS1BankDeposit:"TVS1BankDeposit",
        TAreaCode:"TAreaCode",
        TERPPreference:"TERPPreference",
        TERPPreferenceExtra:"TERPPreferenceExtra",
        VS1_RepeatAppointment: "VS1_RepeatAppointment",
        TRoster: "TRoster",
        TTimeLog: "TTimeLog",
        TRefundSale: "TRefundSale",
        TSerialNumberListCurrentReport: "TSerialNumberListCurrentReport",
        TRepServices:"TRepServices",
        TCustomFieldList: "TCustomFieldList",
        TReportSchedules: "TReportSchedules",
        TAllowance: "TAllowance",
        TTerminationSimple: "TTerminationSimple",
        TPayscommission: "TPayscommission",
        TDeduction: "TDeduction",
        TPaysleave: "TPaysleave",
        TSuperannuation: "TSuperannuation",
        TLeavetypes: "TLeavetypes",
        TEmployeepaysettings: "TEmployeepaysettings",
        TPayRun: "TPayRun",
        TPaybase: "TPaybase",
        TPayRate: "TPayRate",
        TPayHistory: "TPayHistory"
    }
    return objects;
}
