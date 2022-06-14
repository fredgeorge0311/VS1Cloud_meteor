import { ReportService } from "../report-service";
import "jQuery.print/jQuery.print.js";
import { UtilityService } from "../../utility-service";
import layoutEditor from "./layoutEditor";
import ApiService from "../../js/Api/Module/ApiService";
import { ProductService } from "../../product/product-service";
import ProfitLossLayout from "../../js/Api/Model/ProfitLossLayout";
import ProfitLossLayoutFields from "../../js/Api/Model/ProfitLossLayoutFields";
import ProfitLossLayoutApi from "../../js/Api/ProfitLossLayoutApi";
import { TaxRateService } from "../../settings/settings-service";
import { isInt } from "@fullcalendar/core";
// import jqueryScrollable from "../../js/jquery-sortable"

let utilityService = new UtilityService();
let reportService = new ReportService();
const templateObject = Template.instance();
const productService = new ProductService();
const defaultPeriod = 2;

Template.newprofitandloss.onCreated(function () {
  const templateObject = Template.instance();
  templateObject.records = new ReactiveVar([]);
  templateObject.dateAsAt = new ReactiveVar();
  templateObject.deptrecords = new ReactiveVar();
  templateObject.reportOptions = new ReactiveVar();
  templateObject.recordslayout = new ReactiveVar([]);
  templateObject.profitlosslayoutrecords = new ReactiveVar([]);
  templateObject.profitlosslayoutfields = new ReactiveVar([]);
  templateObject.currencyList = new ReactiveVar([]);
  templateObject.activeCurrencyList = new ReactiveVar([]);
  templateObject.tcurrencyratehistory = new ReactiveVar([]);
});

function formatFields(fields, searchkey) {
  const groupBy = (array, key) => {
    // Return the end result
    return array.reduce((result, currentValue) => {
      // If an array already present for key, push it to the array. Else create an array and push the object
      (result[currentValue.fields[key]] =
        result[currentValue.fields[key]] || []).push(currentValue.fields);
      // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
      return result;
    }, {}); // empty object is the initial value for result object
  };

  // Group by color as key to the person array
  return groupBy(fields, searchkey);
}

function buildPositions() {
  const sortfields = $(".sortItem");
  // console.log('Sorting elements')
  let counter = 1;
  for (let i = 0; i <= sortfields.length; i++) {
    $(sortfields[i]).attr("position", counter);
    counter++;
  }
}

Template.newprofitandloss.onRendered(function () {
  $(".fullScreenSpin").css("display", "inline-block");
  let taxRateService = new TaxRateService();
  const templateObject = Template.instance();
  const deptrecords = [];

  templateObject.setReportOptions = async function (
    compPeriod = 0,
    formatDateFrom = new Date(),
    formatDateTo = new Date()
  ) {
    // New Code Start here
    let fromYear = moment(formatDateFrom).format("YYYY");
    let toYear = moment(formatDateTo).format("YYYY");
    let dateRange = [];
    if (toYear === fromYear) {
      dateRange.push(
        moment(formatDateFrom).format("DD MMM") +
          "-" +
          moment(formatDateTo).format("DD MMM") +
          " " +
          toYear
      );
    } else {
      dateRange.push(
        moment(formatDateFrom).format("DD MMM YYYY") +
          "-" +
          moment(formatDateTo).format("DD MMM YYYY")
      );
    }

    let defaultOptions = templateObject.reportOptions.get();
    if (defaultOptions) {
      defaultOptions.fromDate = formatDateFrom;
      defaultOptions.toDate = formatDateTo;
      defaultOptions.threcords = dateRange;
    } else {
      defaultOptions = {
        compPeriod: compPeriod,
        fromDate: formatDateFrom,
        toDate: formatDateTo,
        threcords: dateRange,
        departments: [],
        showDecimal: true,
        showtotal: true,
      };
    }
    await templateObject.reportOptions.set(defaultOptions);
    await templateObject.getProfitandLossReports();
  };

  let utilityService = new UtilityService();
  let salesOrderTable;
  var splashArray = new Array();
  var today = moment().format("DD/MM/YYYY");
  var currentDate = new Date();
  var begunDate = moment(currentDate).format("DD/MM/YYYY");
  let fromDateMonth = currentDate.getMonth() + 1;
  let fromDateDay = currentDate.getDate();
  if (currentDate.getMonth() + 1 < 10) {
    fromDateMonth = "0" + (currentDate.getMonth() + 1);
  }

  let imageData = localStorage.getItem("Image");
  if (imageData) {
    $("#uploadedImage").attr("src", imageData);
    $("#uploadedImage").attr("width", "50%");
  }

  if (currentDate.getDate() < 10) {
    fromDateDay = "0" + currentDate.getDate();
  }
  var fromDate =
    fromDateDay + "/" + fromDateMonth + "/" + currentDate.getFullYear();
  var url = FlowRouter.current().path;
  //hiding Group selected accounts button
  $(".btnGroupAccounts").hide();

  templateObject.dateAsAt.set(begunDate);
  //    date picker initializer
  $("#date-input,#dateTo,#dateFrom").datepicker({
    showOn: "button",
    buttonText: "Show Date",
    buttonImageOnly: true,
    buttonImage: "/img/imgCal2.png",
    dateFormat: "dd/mm/yy",
    showOtherMonths: true,
    selectOtherMonths: true,
    changeMonth: true,
    changeYear: true,
    yearRange: "-90:+10",
  });
  // end of date picker
  // $("#dateFrom").val(fromDate);
  // $("#dateTo").val(begunDate);
  // let formatDateFrom = new Date();
  // let formatDateTo = new Date();
  // let fromYear = moment(formatDateFrom).format('YYYY');
  // let toYear = moment(formatDateTo).format('YYYY');
  // let dateRange = [];
  // if( toYear === fromYear ){
  //   dateRange.push( moment(formatDateFrom).format('DD MMM') + '-' + moment(formatDateTo).format('DD MMM') + ' '+ toYear );
  // }else{
  //   dateRange.push( moment(formatDateFrom).format('DD MMM YYYY') + '-' + moment(formatDateTo).format('DD MMM YYYY') );
  // }
  // templateObject.threcords.set( dateRange );

  // get 'this month' to appear in date range selector dropdown
  //    const monSml = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sepr","Oct","Nov","Dec"];
  //    var currMonth = monSml[currentDate.getMonth()] + " " + currentDate.getFullYear();

  let currMonth = moment().format("MMM") + " " + moment().format("YYYY");
  $("#dispCurrMonth").append(currMonth);

  // get 'this month' to appear in date range selector dropdown end

  // get 'last quarter' to appear in date range selector dropdown
  let lastQStartDispaly = moment()
    .subtract(1, "Q")
    .startOf("Q")
    .format("D" + " " + "MMM" + " " + "YYYY");
  let lastQEndDispaly = moment()
    .subtract(1, "Q")
    .endOf("Q")
    .format("D" + " " + "MMM" + " " + "YYYY");
  $("#dispLastQuarter").append(lastQStartDispaly + " - " + lastQEndDispaly);

  // get 'last quarter' to appear in date range selector dropdown end

  // get 'this quarter' to appear in date range selector dropdown

  let thisQStartDispaly = moment()
    .startOf("Q")
    .format("D" + " " + "MMM" + " " + "YYYY");
  let thisQEndDispaly = moment()
    .endOf("Q")
    .format("D" + " " + "MMM" + " " + "YYYY");
  $("#dispCurrQuarter").append(thisQStartDispaly + " - " + thisQEndDispaly);

  // get 'this quarter' to appear in date range selector dropdown end

  // get 'last month' to appear in date range selector dropdown

  let prevMonth = moment()
    .subtract(1, "M")
    .format("MMM" + " " + "YYYY");
  $("#dispPrevMonth").append(prevMonth);

  // get 'last month' to appear in date range selector dropdown end

  // get 'month to date' to appear in date range selector dropdown

  let monthStart = moment()
    .startOf("M")
    .format("D" + " " + "MMM");
  let monthCurr = moment().format("D" + " " + "MMM" + " " + "YYYY");
  $("#monthStartDisp").append(monthStart + " - " + monthCurr);

  // get 'month to date' to appear in date range selector dropdown end

  // get 'quarter to date' to appear in date range selector dropdown

  let currQStartDispaly = moment()
    .startOf("Q")
    .format("D" + " " + "MMM");
  $("#quarterToDateDisp").append(currQStartDispaly + " - " + monthCurr);

  // get 'quarter to date' to appear in date range selector dropdown
  // get 'financial year' to appear
  if (moment().quarter() == 4) {
    var current_fiscal_year_start = moment()
      .month("July")
      .startOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
    var current_fiscal_year_end = moment()
      .add(1, "year")
      .month("June")
      .endOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
    var last_fiscal_year_start = moment()
      .subtract(1, "year")
      .month("July")
      .startOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
    var last_fiscal_year_end = moment()
      .month("June")
      .endOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
  } else {
    var current_fiscal_year_start = moment()
      .subtract(1, "year")
      .month("July")
      .startOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
    var current_fiscal_year_end = moment()
      .month("June")
      .endOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");

    var last_fiscal_year_start = moment()
      .subtract(2, "year")
      .month("July")
      .startOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
    var last_fiscal_year_end = moment()
      .subtract(1, "year")
      .month("June")
      .endOf("month")
      .format("D" + " " + "MMM" + " " + "YYYY");
  }
  //display current financial year
  $("#dispCurrFiscYear").append(
    current_fiscal_year_start + " - " + current_fiscal_year_end
  );
  //display last financial year
  $("#dispPrevFiscYear").append(
    last_fiscal_year_start + " - " + last_fiscal_year_end
  );
  //display current financial year to current date;
  let yeartodate = moment()
    .month("january")
    .startOf("month")
    .format("D" + " " + "MMM" + " " + "YYYY");
  $("#dispCurrFiscYearToDate").append(yeartodate + " - " + monthCurr);
  // get 'financial year' to appear end

  templateObject.getProfitandLossReports = async function () {
    const options = await templateObject.reportOptions.get();
    let dateFrom =
      moment(options.fromDate).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD");
    let dateTo =
      moment(options.toDate).format("YYYY-MM-DD") ||
      moment().format("YYYY-MM-DD");
    // Compare period
    if (options.compPeriod) {
      try {
        let periodMonths = `${options.compPeriod} Month`;
        let data = await reportService.getProfitandLossCompare(
          dateFrom,
          dateTo,
          false,
          periodMonths
        );
        let records = [];
        options.threcords = [];
        if (data.tprofitandlossperiodcomparereport) {
          let accountData = data.tprofitandlossperiodcomparereport;
          // console.log('accountData', dateFrom, dateTo, accountData)
          let accountType = "";
          var dataList = "";
          for (let i = 0; i < accountData.length; i++) {
            if (accountData[i]["AccountTypeDesc"].replace(/\s/g, "") == "") {
              accountType = "";
            } else {
              accountType = accountData[i]["AccountTypeDesc"];
            }
            let compPeriod = options.compPeriod + 1;
            let periodAmounts = [];
            for (let counter = 1; counter <= compPeriod; counter++) {
              if (i == 0) {
                options.threcords.push(accountData[i]["DateDesc_" + counter]);
              }
              let AmountEx =
                utilityService.modifynegativeCurrencyFormat(
                  accountData[i]["Amount_" + counter]
                ) || 0.0;
              let RoundAmount =
                Math.round(accountData[i]["Amount_" + counter]) || 0;
              periodAmounts.push({
                decimalAmt: AmountEx,
                roundAmt: RoundAmount,
              });
            }
            let totalAmountEx =
              utilityService.modifynegativeCurrencyFormat(
                accountData[i]["TotalAmount"]
              ) || 0.0;
            let totalRoundAmount =
              Math.round(accountData[i]["TotalAmount"]) || 0;
            if (
              accountData[i]["AccountHeaderOrder"].replace(/\s/g, "") == "" &&
              accountType != ""
            ) {
              dataList = {
                id: accountData[i]["AccountID"] || "",
                accounttype: accountType || "",
                accounttypeshort: accountData[i]["AccountType"] || "",
                accountname: accountData[i]["AccountName"] || "",
                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                accountno: accountData[i]["AccountNo"] || "",
                totalamountex: "",
                totalroundamountex: "",
                periodAmounts: "",
                name: $.trim(accountData[i]["AccountName"])
                  .split(" ")
                  .join("_"),
              };
            } else {
              dataList = {
                id: accountData[i]["AccountID"] || "",
                accounttype: accountType || "",
                accounttypeshort: accountData[i]["AccountType"] || "",
                accountname: accountData[i]["AccountName"] || "",
                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                accountno: accountData[i]["AccountNo"] || "",
                totalamountex: totalAmountEx || 0.0,
                periodAmounts: periodAmounts,
                totalroundamountex: totalRoundAmount,
                name: $.trim(accountData[i]["AccountName"])
                  .split(" ")
                  .join("_"),
                // totaltax: totalTax || 0.00
              };
            }

            if (
              accountData[i]["AccountType"].replace(/\s/g, "") == "" &&
              accountType == ""
            ) {
            } else {
              records.push(dataList);
            }
          }

          // Set Table Data
          templateObject.reportOptions.set(options);
          templateObject.records.set(records);
          if (templateObject.records.get()) {
            setTimeout(function () {
              $("td a").each(function () {
                if (
                  $(this)
                    .text()
                    .indexOf("-" + Currency) >= 0
                ) {
                  $(this).addClass("text-danger");
                  $(this).removeClass("fgrblue");
                }
              });
              $("td").each(function () {
                if (
                  $(this)
                    .text()
                    .indexOf("-" + Currency) >= 0
                ) {
                  $(this).addClass("text-danger");
                  $(this).removeClass("fgrblue");
                }
              });
              $(".fullScreenSpin").css("display", "none");
            }, 100);
          }
        }
      } catch (err) {
        $(".fullScreenSpin").css("display", "none");
      }
    } else {
      try {
        options.threcords = [];
        let fromYear = moment(dateFrom).format("YYYY");
        let toYear = moment(dateTo).format("YYYY");
        let dateRange = [];
        if (toYear === fromYear) {
          dateRange.push(
            moment(dateFrom).format("DD MMM") +
              "-" +
              moment(dateTo).format("DD MMM") +
              " " +
              toYear
          );
        } else {
          dateRange.push(
            moment(dateFrom).format("DD MMM YYYY") +
              "-" +
              moment(dateTo).format("DD MMM YYYY")
          );
        }
        options.threcords = dateRange;
        let departments = options.departments.length
          ? options.departments.join(",")
          : "";
        let data = await reportService.getProfitandLoss(
          dateFrom,
          dateTo,
          false,
          departments
        );
        let records = [];
        if (data.profitandlossreport) {
          let accountData = data.profitandlossreport;
          let accountType = "";
          var dataList = "";
          for (let i = 0; i < accountData.length; i++) {
            if (accountData[i]["Account Type"].replace(/\s/g, "") == "") {
              accountType = "";
            } else {
              accountType = accountData[i]["Account Type"];
            }
            let periodAmounts = [];
            let totalAmountEx =
              utilityService.modifynegativeCurrencyFormat(
                accountData[i]["TotalAmountEx"]
              ) || 0.0;
            let totalRoundAmount =
              Math.round(accountData[i]["TotalAmountEx"]) || 0;
            periodAmounts.push({
              decimalAmt: totalAmountEx,
              roundAmt: totalRoundAmount,
            });
            if (options.departments.length) {
              options.departments.forEach((dept) => {
                let deptAmountEx =
                  utilityService.modifynegativeCurrencyFormat(
                    accountData[i][dept + "_AmountColumnInc"]
                  ) || 0.0;
                let deptRoundAmount =
                  Math.round(accountData[i][dept + "_AmountColumnInc"]) || 0;
                if (i == 0) {
                  options.threcords.push(dept);
                }
                periodAmounts.push({
                  decimalAmt: deptAmountEx,
                  roundAmt: deptRoundAmount,
                });
              });
            }
            if (
              accountData[i]["AccountHeaderOrder"].replace(/\s/g, "") == "" &&
              accountType != ""
            ) {
              dataList = {
                id: accountData[i]["AccountID"] || "",
                accounttype: accountType || "",
                accounttypeshort: accountData[i]["AccountType"] || "",
                accountname: accountData[i]["AccountName"] || "",
                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                accountno: accountData[i]["AccountNo"] || "",
                totalamountex: "",
                periodAmounts: "",
                totalroundamountex: "",
                name: $.trim(accountData[i]["AccountName"])
                  .split(" ")
                  .join("_"),
              };
            } else {
              dataList = {
                id: accountData[i]["AccountID"] || "",
                accounttype: accountType || "",
                accounttypeshort: accountData[i]["AccountType"] || "",
                accountname: accountData[i]["AccountName"] || "",
                accountheaderorder: accountData[i]["AccountHeaderOrder"] || "",
                accountno: accountData[i]["AccountNo"] || "",
                totalamountex: totalAmountEx || 0.0,
                totalroundamountex: totalRoundAmount,
                periodAmounts: periodAmounts,
                name: $.trim(accountData[i]["AccountName"])
                  .split(" ")
                  .join("_"),
                // totaltax: totalTax || 0.00
              };
            }

            if (
              accountData[i]["AccountType"].replace(/\s/g, "") == "" &&
              accountType == ""
            ) {
            } else {
              records.push(dataList);
            }
          }

          // Set Table Data
          // console.log('records', records)
          templateObject.reportOptions.set(options);
          templateObject.records.set(records);
          if (templateObject.records.get()) {
            setTimeout(function () {
              $("td a").each(function () {
                if (
                  $(this)
                    .text()
                    .indexOf("-" + Currency) >= 0
                ) {
                  $(this).addClass("text-danger");
                  $(this).removeClass("fgrblue");
                }
              });
              $("td").each(function () {
                if (
                  $(this)
                    .text()
                    .indexOf("-" + Currency) >= 0
                ) {
                  $(this).addClass("text-danger");
                  $(this).removeClass("fgrblue");
                }
              });
              $(".fullScreenSpin").css("display", "none");
            }, 500);
          }
        }
      } catch (error) {
        $(".fullScreenSpin").css("display", "none");
      }
    }
  };

  if (url.indexOf("?dateFrom") > 0) {
    localStorage.setItem("VS1ProfitandLoss_ReportCompare", "");
    url = new URL(window.location.href);
    var getDateFrom = url.searchParams.get("dateFrom");
    var getLoadDate = url.searchParams.get("dateTo");
    templateObject.setReportOptions(defaultPeriod, getDateFrom, getLoadDate);
  } else {
    var currentDate2 = new Date();
    var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");

    // // last 2 months
    // for (i = 0; i <= 2; i++) {
    //   currentDate2.setMonth(currentDate2.getMonth() - 1);
    // }

    let getDateFrom =  moment(currentDate2).subtract(3,'months').format('YYYY-MM-DD');
    templateObject.setReportOptions(defaultPeriod, getDateFrom, getLoadDate);
  }

  templateObject.getDepartments = function () {
    getVS1Data("TDeptClass")
      .then(function (dataObject) {
        if (dataObject.length == 0) {
          productService.getDepartment().then(function (data) {
            //let deptArr = [];
            for (let i in data.tdeptclass) {
              let deptrecordObj = {
                id: data.tdeptclass[i].Id || " ",
                department: data.tdeptclass[i].DeptClassName || " ",
              };
              deptrecords.push(deptrecordObj);
              templateObject.deptrecords.set(deptrecords);
            }
          });
        } else {
          let data = JSON.parse(dataObject[0].data);
          let useData = data.tdeptclass;
          for (let i in useData) {
            let deptrecordObj = {
              id: useData[i].Id || " ",
              department: useData[i].DeptClassName || " ",
            };
            //deptArr.push(data.tdeptclass[i].DeptClassName);
            deptrecords.push(deptrecordObj);
            templateObject.deptrecords.set(deptrecords);
          }
        }
      })
      .catch(function (err) {
        productService.getDepartment().then(function (data) {
          //let deptArr = [];
          for (let i in data.tdeptclass) {
            let deptrecordObj = {
              id: data.tdeptclass[i].Id || " ",
              department: data.tdeptclass[i].DeptClassName || " ",
            };
            //deptArr.push(data.tdeptclass[i].DeptClassName);
            deptrecords.push(deptrecordObj);
            templateObject.deptrecords.set(deptrecords);
          }
        });
      });
  };
  // templateObject.getAllProductData();
  templateObject.getDepartments();

  templateObject.getProfitLossLayout = async function () {
    const profitLossLayoutApi = new ProfitLossLayoutApi();

    const profitLossLayoutEndpoint = profitLossLayoutApi.collection.findByName(
      profitLossLayoutApi.collectionNames.TProfitLossLayout
    );

    // Fetch list type details
    profitLossLayoutEndpoint.url.searchParams.append("ListType", "'Detail'");

    const profitLossLayoutEndResponse = await profitLossLayoutEndpoint.fetch();
    if (profitLossLayoutEndResponse.ok == true) {
      let profitLossLayouts = [];
      let jsonResponse = await profitLossLayoutEndResponse.json();
      // handle API json reponse
      const profitLossLists = ProfitLossLayout.fromList(
        jsonResponse.tprofitlosslayout
      );
      // Save default list
      templateObject.profitlosslayoutfields.set(profitLossLists);

      profitLossLayouts = profitLossLists.filter((item) => {
        if (
          item.fields.Level0Order != 0 &&
          item.fields.Level1Order == 0 &&
          item.fields.Level2Order == 0 &&
          item.fields.Level3Order == 0
        ) {
          return item;
        }
      });
      // console.log(profitLossLayouts, parentprofitLossLayouts);
      let newprofitLossLayouts = [];
      // Fetch Subchilds According to the Above grouping
      profitLossLayouts.forEach(function (item) {
        let subAccounts = [];
        let Level0Order = item.fields.Level0Order;
        let ID = item.fields.ID;

        profitLossLists.filter((subitem) => {
          let subLevel0Order = subitem.fields.Level0Order;
          let subID = subitem.fields.ID;
          let subposition = subitem.fields.Pos.match(/.{1,2}/g);
          if (subLevel0Order == Level0Order && ID != subID) {
            subitem.fields.subAccounts = [];
            // subitem.fields.PositsubAccountsion = parseInt(subposition[1]) || 0;
            subAccounts.push(subitem.fields);
          }
        });

        let position = item.fields.Pos.match(/.{1,2}/g);
        // item.fields.Position = parseInt(position[0]) || 0;
        // let sortedAccounts = level1Childs.sort((a,b) => (a.Position > b.Position) ? 1 : ((b.Position > a.Position) ? -1 : 0))
        newprofitLossLayouts.push({
          ...item.fields,
          subAccounts: subAccounts,
        });
      });
      console.log('newprofitLossLayouts', newprofitLossLayouts);
      templateObject.profitlosslayoutrecords.set(newprofitLossLayouts);

      // handle Dragging and sorting
      setTimeout(function () {
        // console.log('chdsdsdsdal sdsdsd');
        var oldContainer;
        $("ol.nested_with_switch").sortable({
          group: "nested_with_switch",
          containment: "parent",
          nested: true,
          exclude: ".noDrag",
          onDrag: function ($item, position, _super, event) {
            $item
              .parents(".vertical")
              .find(".selected")
              .removeClass("selected");
            $item.parents(".vertical").find(".selected").removeClass("dragged");
            $item.addClass("selected");
          },
          // onDrop:function ($item, position, _super, event) {
          //   $item.parents('.vertical').find('.selected').removeClass('selected, dragged');
          //   $item.addClass('selected');
          // },
          serialize: function ($parent, $children, parentIsContainer) {
            var result = $.extend({}, $parent.data());
            if (parentIsContainer) return [$children];
            else if ($children[0]) {
              result.children = $children;
            }
          },
          isValidTarget: function ($item, container) {
            if (container.el.hasClass("noDrag")) {
              return false;
            } else {
              return true;
            }
          },
          afterMove: function (placeholder, container) {
            if (oldContainer != container) {
              if (oldContainer) oldContainer.el.removeClass("active");
              container.el.addClass("active");
              oldContainer = container;
            }
          },

          // onDrop: function ($item, container, _super) {

          //   var data = group.sortable("serialize").get();

          //   var jsonString = JSON.stringify(data, null, ' ');
          //   console.log(jsonString);
          //   $('#serialize_output').val(jsonString);

          //   container.el.removeClass("active");
          //   _super($item, container);
          // }
        });

        $(".collepsDiv").click(function () {
          $(this).parents(".mainHeadingDiv").toggleClass("collapsTogls");
        });
        // $('.subChild, .mainHeading').mouseout(function(){
        //   $('.subChild, .mainHeading').removeClass('selected');
        // });
      }, 1000);
    }
  };
  templateObject.getProfitLossLayout();

  // templateObject.getAllProductData();
  //templateObject.getDepartments();

  //Dragable items in edit layout screen
  //This works now: break at your own peril
  // setTimeout(function () {
  //   new layoutEditor(document.querySelector("#nplEditLayoutScreen"));
  // }, 1000);
  /*
  setTimeout(function(){

  $(".dragTable").sortable({
      revert: true,
       // cancel: ".tblAvoid"
  });
  $(".tblGroupAcc").sortable({
      revert: true,
     handle: ".tblAvoid"
  });
  $(".tblIndIvAcc").draggable({
      connectToSortable: ".tblGroupAcc",
      helper: "none",
      revert: "true"
  });
$('.tblAvoid').each(function(){
  $('.dragTable').append(<tbody class = "tblGroupAcc"></tbody>);
});
  $('.tblAvoid').nextAll('.tblIndIvAcc').css('background', 'red');
},3500);
*/

  //    $( "ul, li" ).disableSelection();
  //Dragable items in edit layout screen end
  /*Visually hide additional periods so that custom selection handles it*/

  setTimeout(function () {
    $(".pnlTable").show();
  }, 6000);
  /*Visual hide end*/
  // var eLayScreenArr = [];
  // var pnlTblArr = [];
  // var tbv1 = $('.fgrtotalName').length;
  // var tbv2 = $('.avoid').length;
  // for (let i = 0; i < tbv1; i++) {
  //     eLayScreenArr.push(i);
  // }
  // for (let k = 0; k < tbv2; k++) {
  //
  //     pnlTblArr.push(k);
  // }

  //            const sortArray = (eLayScreenArr, pnlTblArr) => {
  //                pnlTblArr.sort((a, b) => {
  //                    const aKey = Object.keys(a)[0];
  //                    const bKey = Object.keys(b)[0];
  //                    return eLayScreenArr.indexOf(aKey) - eLayScreenArr.indexOf(bKey);
  //                });
  //            };
  //            sortArray(eLayScreenArr, pnlTblArr);

  /**
   * Step 1 : We need to get currencies (TCurrency) so we show or hide sub collumns
   * So we have a showable list of currencies to toggle
   */
  let _currencyList = [];
  templateObject.loadCurrency = () =>
    taxRateService.getCurrencies().then((result) => {
      // console.log(result);
      const data = result.tcurrency;
      //console.log(data);
      for (let i = 0; i < data.length; i++) {
        // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
        var dataList = {
          id: data[i].Id || "",
          code: data[i].Code || "-",
          currency: data[i].Currency || "-",
          symbol: data[i].CurrencySymbol || "-",
          buyrate: data[i].BuyRate || "-",
          sellrate: data[i].SellRate || "-",
          country: data[i].Country || "-",
          description: data[i].CurrencyDesc || "-",
          ratelastmodified: data[i].RateLastModified || "-",
          active: data[i].Currency == "AUD" ? true : false, // By default if AUD then true
          // createdAt: new Date(data[i].MsTimeStamp) || "-",
          // formatedCreatedAt: formatDateToString(new Date(data[i].MsTimeStamp))
        };

        _currencyList.push(dataList);
        //}
      }

      // console.log(_currencyList);

      templateObject.currencyList.set(_currencyList);
    });

  templateObject.loadCurrency();

  let toggledCurrency = [];

  /**
   * Step 2 : We need to get the currency history so we can then calculate the amount earned for a date range
   * The last day of the range will be used from the history
   */

  templateInstance.loadCurrencyHistory = function () {
    taxRateService
      .getCurrencyHistory()
      .then((result) => {
        // console.log(result);
        const data = result.tcurrencyratehistory;
        // console.log(data);
        let lineItems = [];
        let lineItemObj = {};
        for (let i = 0; i < data.length; i++) {
          // let taxRate = (data.tcurrency[i].fields.Rate * 100).toFixed(2) + '%';
          var dataList = {
            id: data[i].Id || "",
            code: data[i].Code || "-",
            currency: data[i].Currency || "-",
            symbol: data[i].CurrencySymbol || "-",
            buyrate: data[i].BuyRate || "-",
            sellrate: data[i].SellRate || "-",
            country: data[i].Country || "-",
            description: data[i].CurrencyDesc || "-",
            ratelastmodified: data[i].RateLastModified || "-",
            createdAt: new Date(data[i].MsTimeStamp) || "-",
            formatedCreatedAt: formatDateToString(
              new Date(data[i].MsTimeStamp)
            ),
          };

          dataTableList.push(dataList);
          //}
        }
        // console.log(dataTableList);

        if (urlParams.get("currency")) {
          // Filter by currency
          dataTableList = dataTableList.filter((value, index) => {
            //console.log(value);
            return value.code == urlParams.get("currency");
          });
        }

        if (urlParams.get("dateFrom") && urlParams.get("dateTo")) {
          // console.log(begunDate);
          const _dateFrom = formatDateFromUrl(begunDate);
          const _dateTo = formatDateFromUrl(fromDate);
          // console.log(_dateFrom);
          // console.log(_dateTo);

          dataTableList = dataTableList.filter((value, index) => {
            if (_dateFrom > value.createdAt && _dateTo < value.createdAt) {
              return true;
            }
            return false;
          });
        }

        // Sort by created at
        dataTableList = dataTableList.sort(sortById);
        dataTableList.reverse();

        templateInstance.tcurrencyratehistory.set(dataTableList);

        if (templateInstance.tcurrencyratehistory.get()) {
          Meteor.call(
            "readPrefMethod",
            Session.get("mycloudLogonID"),
            "currencyLists",
            function (error, result) {
              if (error) {
              } else {
                if (result) {
                  for (let i = 0; i < result.customFields.length; i++) {
                    let customcolumn = result.customFields;
                    let columData = customcolumn[i].label;
                    let columHeaderUpdate = customcolumn[i].thclass.replace(
                      / /g,
                      "."
                    );
                    let hiddenColumn = customcolumn[i].hidden;
                    let columnClass = columHeaderUpdate.split(".")[1];
                    let columnWidth = customcolumn[i].width;
                    let columnindex = customcolumn[i].index + 1;

                    if (hiddenColumn == true) {
                      $("." + columnClass + "").addClass("hiddenColumn");
                      $("." + columnClass + "").removeClass("showColumn");
                    } else if (hiddenColumn == false) {
                      $("." + columnClass + "").removeClass("hiddenColumn");
                      $("." + columnClass + "").addClass("showColumn");
                    }
                  }
                }
              }
            }
          );

          setTimeout(function () {
            MakeNegative();
          }, 100);
        }

        $(".fullScreenSpin").css("display", "none");
        setTimeout(function () {
          $("#currencyLists")
            .DataTable({
              columnDefs: [
                { type: "date", targets: 0 },
                { orderable: false, targets: -1 },
              ],
              sDom: "<'row'><'row'<'col-sm-12 col-md-6'f><'col-sm-12 col-md-6'l>r>t<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>B",
              buttons: [
                {
                  extend: "excelHtml5",
                  text: "",
                  download: "open",
                  className: "btntabletocsv hiddenColumn",
                  filename: "currencylist_" + moment().format(),
                  orientation: "portrait",
                  exportOptions: {
                    columns: ":visible",
                  },
                },
                {
                  extend: "print",
                  download: "open",
                  className: "btntabletopdf hiddenColumn",
                  text: "",
                  title: "Currency List",
                  filename: "currencylist_" + moment().format(),
                  exportOptions: {
                    columns: ":visible",
                  },
                },
              ],
              select: true,
              destroy: true,
              colReorder: true,
              colReorder: {
                fixedColumnsRight: 1,
              },
              // bStateSave: true,
              // rowId: 0,
              paging: true,
              //                    "scrollY": "400px",
              //                    "scrollCollapse": true,
              info: true,
              responsive: true,
              order: [[0, "desc"]],
              action: function () {
                $("#currencyLists").DataTable().ajax.reload();
              },
              fnDrawCallback: function (oSettings) {
                setTimeout(function () {
                  MakeNegative();
                }, 100);
              },
            })
            .on("page", function () {
              setTimeout(function () {
                MakeNegative();
              }, 100);
              let draftRecord = templateInstance.tcurrencyratehistory.get();
              templateInstance.tcurrencyratehistory.set(draftRecord);
            })
            .on("column-reorder", function () {})
            .on("length.dt", function (e, settings, len) {
              setTimeout(function () {
                MakeNegative();
              }, 100);
            });

          // $('#currencyLists').DataTable().column( 0 ).visible( true );
          $(".fullScreenSpin").css("display", "none");
        }, 0);

        var columns = $("#currencyLists th");
        let sTible = "";
        let sWidth = "";
        let sIndex = "";
        let sVisible = "";
        let columVisible = false;
        let sClass = "";
        $.each(columns, function (i, v) {
          if (v.hidden == false) {
            columVisible = true;
          }
          if (v.className.includes("hiddenColumn")) {
            columVisible = false;
          }
          sWidth = v.style.width.replace("px", "");

          let datatablerecordObj = {
            sTitle: v.innerText || "",
            sWidth: sWidth || "",
            sIndex: v.cellIndex || "",
            sVisible: columVisible || false,
            sClass: v.className || "",
          };
          tableHeaderList.push(datatablerecordObj);
        });
        templateInstance.tableheaderrecords.set(tableHeaderList);
        $("div.dataTables_filter input").addClass(
          "form-control form-control-sm"
        );
      })
      .catch(function (err) {
        // Bert.alert('<strong>' + err + '</strong>!', 'danger');
        $(".fullScreenSpin").css("display", "none");
        // Meteor._reload.reload();
      });
  };

  templateInstance.loadCurrencyHistory();

  /**
   * Step 3 : We need
   */
});

/**
 *
 * @param {string} currencyCode
 * @returns {Boolean}
 */
function isCurrencyActive(currencyCode) {
  let currencySelected = $(".currency-selector-js:checked");

  $.each(currencySelected, (i, element) => {
    //console.log($(element).attr("currency"), "=", currencyCode, $(element).attr("currency") == currencyCode);
    if ($(element).attr("currency") == currencyCode) {
      return true;
    }
  });
  return false;
}

function otherCurrency(currencyCode, rate, amount) {
  return {
    currency: currencyCode,
    amount: rate * amount,
  };
}

function buildCurrencyList(currencies, amount) {
  let _amounts = [];

  currencies.forEach((currency, i) => {
    _amounts.push(otherCurrency(currency.currency));
  });
}

/**
 *
 * This will return one single currency row for the table
 *
 * @param {string} currencyCode
 * @param {float} rate
 * @param {float} mainAmount
 * @returns {{currencyCode: string, amount: float}}
 */
function getSingleCurrencyRow(currencyCode, rate, mainAmount) {
  return {
    currencyCode: currencyCode,
    amount: rate * mainAmount,
  };
}

Template.newprofitandloss.events({
  "change input[type='checkbox']": (event) => {
    // This should be global
    $(event.currentTarget).attr(
      "checked",
      $(event.currentTarget).prop("checked")
    );
  },
  "click .currency-modal-save": (e) => {
    $(".fullScreenSpin").css("display", "inline-block");
    let templateObject = Template.instance();

    // Get all currency list
    let _currencyList = templateObject.currencyList.get();

    // Get all selected currencies
    const currencySelected = $(".currency-selector-js:checked");
    let _currencySelectedList = [];
    $.each(currencySelected, (index, e) => {
      const sellRate = $(e).attr("sell-rate");
      const buyRate = $(e).attr("buy-rate");
      const currencyCode = $(e).attr("currency");
      const currencyId = $(e).attr("currency-id");
      let _currency = _currencyList.find((c) => c.id == currencyId);
      _currency.active = true;
      _currencySelectedList.push(_currency);
    });
    console.log("Selected currency list", _currencySelectedList);

    _currencyList.forEach((value, index) => {
      if (_currencySelectedList.some((c) => c.id == _currencyList[index].id)) {
        _currencyList[index].active = _currencySelectedList.find(
          (c) => c.id == _currencyList[index].id
        ).active;
      } else {
        _currencyList[index].active = false;
      }
    });

    _currencyList = _currencyList.sort((a, b) => {
      if (a.currency == "AUD") {
        return -1;
      }
      return 1;
    });

    // templateObject.activeCurrencyList.set(_activeCurrencyList);
    templateObject.currencyList.set(_currencyList);
    $(".fullScreenSpin").css("display", "none");
  },
  // "change .currency-selector-js": (e) => {
  //   //console.log($(e.currentTarget));
  //   //toggleAttribute(e);
  //   let templateObject = Template.instance();
  //   const sellRate = $(e.currentTarget).attr("sell-rate");
  //   const buyRate = $(e.currentTarget).attr("buy-rate");
  //   const currencyCode = $(e.currentTarget).attr("currency");

  //   let currencySelected = $(".currency-selector-js:checked");
  //   let _currencyList = templateObject.currencyList.get();

  //   _currencyList.forEach((currencydata, index) => {
  //     if (isCurrencyActive(currencyCode) == true) {
  //       _currencyList[index].active = true;
  //     } else {
  //       _currencyList[index].active = false;
  //     }
  //   });

  //   templateObject.currencyList.set(_currencyList);

  //   console.log(_currencyList);
  //   console.log(currencySelected);
  //   console.log("buy rate", buyRate);
  //   console.log("sell rate", sellRate);
  // },
  "click #dropdownDateRang": function (e) {
    let dateRangeID = e.target.id;
    $("#btnSltDateRange").addClass("selectedDateRangeBtnMod");
    $("#selectedDateRange").show();
    if (dateRangeID == "thisMonth") {
      document.getElementById("selectedDateRange").value = "This Month";
    } else if (dateRangeID == "thisQuarter") {
      document.getElementById("selectedDateRange").value = "This Quarter";
    } else if (dateRangeID == "thisFinYear") {
      document.getElementById("selectedDateRange").value =
        "This Financial Year";
    } else if (dateRangeID == "lastMonth") {
      document.getElementById("selectedDateRange").value = "Last Month";
    } else if (dateRangeID == "lastQuarter") {
      document.getElementById("selectedDateRange").value = "Last Quarter";
    } else if (dateRangeID == "lastFinYear") {
      document.getElementById("selectedDateRange").value =
        "Last Financial Year";
    } else if (dateRangeID == "monthToDate") {
      document.getElementById("selectedDateRange").value = "Month to Date";
    } else if (dateRangeID == "quarterToDate") {
      document.getElementById("selectedDateRange").value = "Quarter to Date";
    } else if (dateRangeID == "finYearToDate") {
      document.getElementById("selectedDateRange").value = "Year to Date";
    }
  },
  "click .accountingBasisDropdown": function (e) {
    e.stopPropagation();
  },
  "click td a": function (event) {
    let id = $(event.target).closest("tr").attr("id").split("item-value-");
    var accountName = id[1].split("_").join(" ");
    let toDate = moment($("#dateTo").val())
      .clone()
      .endOf("month")
      .format("YYYY-MM-DD");
    let fromDate = moment($("#dateFrom").val())
      .clone()
      .startOf("year")
      .format("YYYY-MM-DD");
    //Session.setPersistent('showHeader',true);
    window.open(
      "/balancetransactionlist?accountName=" +
        accountName +
        "&toDate=" +
        toDate +
        "&fromDate=" +
        fromDate +
        "&isTabItem=" +
        false,
      "_self"
    );
  },
  "change .edtReportDates": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    var dateTo = new Date($("#dateTo").datepicker("getDate"));
    templateObject.setReportOptions(2, dateFrom, dateTo);
  },

  "click .btnRefresh": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1ProfitandLoss_ReportCompare", "");
    Meteor._reload.reload();
  },
  "click .btnPrintReport": function (event) {
    document.title = "Profit and Loss Report";
    $(".printReport").print({
      title: document.title + " | Profit and Loss | " + loggedCompany,
      noPrintSelector: ".addSummaryEditor, .excludeButton",
      exportOptions: {
        stripHtml: false,
      },
    });
  },
  "click .btnExportReportProfit": function () {
    $(".fullScreenSpin").css("display", "inline-block");
    let utilityService = new UtilityService();
    let templateObject = Template.instance();
    var dateFrom = new Date($("#dateFrom").datepicker("getDate"));
    var dateTo = new Date($("#dateTo").datepicker("getDate"));

    let formatDateFrom =
      dateFrom.getFullYear() +
      "-" +
      (dateFrom.getMonth() + 1) +
      "-" +
      dateFrom.getDate();
    let formatDateTo =
      dateTo.getFullYear() +
      "-" +
      (dateTo.getMonth() + 1) +
      "-" +
      dateTo.getDate();

    const filename = loggedCompany + "-Profit and Loss" + ".csv";
    utilityService.exportReportToCsvTable("tableExport", filename, "csv");
    let rows = [];
    // reportService.getProfitandLoss(formatDateFrom,formatDateTo,false).then(function (data) {
    //     if(data.profitandlossreport){
    //         rows[0] = ['Account Type','Account Name', 'Account Number', 'Total Amount(EX)'];
    //         data.profitandlossreport.forEach(function (e, i) {
    //             rows.push([
    //               data.profitandlossreport[i]['AccountTypeDesc'],
    //               data.profitandlossreport[i].AccountName,
    //               data.profitandlossreport[i].AccountNo,
    //               // utilityService.modifynegativeCurrencyFormat(data.profitandlossreport[i]['Sub Account Total']),
    //               utilityService.modifynegativeCurrencyFormat(data.profitandlossreport[i].TotalAmount)]);
    //         });
    //         setTimeout(function () {
    //             utilityService.exportReportToCsv(rows, filename, 'xls');
    //             $('.fullScreenSpin').css('display','none');
    //         }, 1000);
    //     }
    //
    // });
  },

  "click .selPeriod": async function (e) {
    let periods = $(e.target).data("period");
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let defaultOptions = await templateObject.reportOptions.get();
    if (defaultOptions) {
      defaultOptions.compPeriod = periods;
      defaultOptions.departments = [];
    }
    await templateObject.reportOptions.set(defaultOptions);
    await templateObject.getProfitandLossReports();
  },

  //custom selection period number
  "click .btnSaveComparisonPeriods": async function (event) {
    let periods = $("#comparisonPeriodNum").val();
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let defaultOptions = await templateObject.reportOptions.get();
    if (defaultOptions) {
      defaultOptions.compPeriod = periods;
      defaultOptions.departments = [];
    }
    await templateObject.reportOptions.set(defaultOptions);
    await templateObject.getProfitandLossReports();
  },

  // Current Month
  "click #thisMonth": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment().startOf("month").format("YYYY-MM-DD");
    let endDate = moment().endOf("month").format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #thisQuarter": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment().startOf("Q").format("YYYY-MM-DD");
    let endDate = moment().endOf("Q").format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #thisFinYear": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = null;
    let endDate = null;
    if (moment().quarter() == 4) {
      fromDate = moment().month("July").startOf("month").format("YYYY-MM-DD");
      endDate = moment()
        .add(1, "year")
        .month("June")
        .endOf("month")
        .format("YYYY-MM-DD");
    } else {
      fromDate = moment()
        .subtract(1, "year")
        .month("July")
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = moment().month("June").endOf("month").format("YYYY-MM-DD");
    }
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #lastMonth": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment()
      .subtract(1, "months")
      .startOf("month")
      .format("YYYY-MM-DD");
    let endDate = moment()
      .subtract(1, "months")
      .endOf("month")
      .format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #lastQuarter": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment().subtract(1, "Q").startOf("Q").format("YYYY-MM-DD");
    let endDate = moment().subtract(1, "Q").endOf("Q").format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #lastFinYear": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = null;
    let endDate = null;
    if (moment().quarter() == 4) {
      fromDate = moment()
        .subtract(1, "year")
        .month("July")
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = moment().month("June").endOf("month").format("YYYY-MM-DD");
    } else {
      fromDate = moment()
        .subtract(2, "year")
        .month("July")
        .startOf("month")
        .format("YYYY-MM-DD");
      endDate = moment()
        .subtract(1, "year")
        .month("June")
        .endOf("month")
        .format("YYYY-MM-DD");
    }
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #monthToDate": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment().startOf("M").format("YYYY-MM-DD");
    let endDate = moment().format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #quarterToDate": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment().startOf("Q").format("YYYY-MM-DD");
    let endDate = moment().format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click #finYearToDate": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    let fromDate = moment()
      .month("january")
      .startOf("month")
      .format("YYYY-MM-DD");
    let endDate = moment().format("YYYY-MM-DD");
    templateObject.setReportOptions(defaultPeriod, fromDate, endDate);
  },

  "click .btnDepartmentSelect": async function () {
    let departments = [];
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    $(".chkDepartment").each(function () {
      if ($(this).is(":checked")) {
        let dpt = $(this).val();
        departments.push(dpt);
      }
    });
    let defaultOptions = await templateObject.reportOptions.get();
    if (defaultOptions) {
      defaultOptions.compPeriod = 0;
      defaultOptions.departments = departments;
    }
    await templateObject.reportOptions.set(defaultOptions);
    await templateObject.getProfitandLossReports();
    $("#myModalDepartment").modal("hide");
  },

  "click #last12Months": function () {
    $(".fullScreenSpin").css("display", "block");
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1ProfitandLoss_ReportCompare", "");
    $("#dateFrom").attr("readonly", false);
    $("#dateTo").attr("readonly", false);
    var currentDate = new Date();
    var begunDate = moment(currentDate).format("DD/MM/YYYY");

    let fromDateMonth = Math.floor(currentDate.getMonth() + 1);
    let fromDateDay = currentDate.getDate();
    if (currentDate.getMonth() + 1 < 10) {
      fromDateMonth = "0" + (currentDate.getMonth() + 1);
    }
    if (currentDate.getDate() < 10) {
      fromDateDay = "0" + currentDate.getDate();
    }

    var fromDate =
      fromDateDay +
      "/" +
      fromDateMonth +
      "/" +
      Math.floor(currentDate.getFullYear() - 1);
    templateObject.dateAsAt.set(begunDate);
    $("#dateFrom").val(fromDate);
    $("#dateTo").val(begunDate);

    var currentDate2 = new Date();
    var getLoadDate = moment(currentDate2).format("YYYY-MM-DD");
    let getDateFrom =
      Math.floor(currentDate2.getFullYear() - 1) +
      "-" +
      Math.floor(currentDate2.getMonth() + 1) +
      "-" +
      currentDate2.getDate();
    templateObject.getProfitandLossReports(getDateFrom, getLoadDate, false);
  },
  "click #ignoreDate": function () {
    let templateObject = Template.instance();
    $(".fullScreenSpin").css("display", "inline-block");
    localStorage.setItem("VS1ProfitandLoss_ReportCompare", "");
    $("#dateFrom").attr("readonly", true);
    $("#dateTo").attr("readonly", true);
    templateObject.dateAsAt.set("Current Date");
    templateObject.getProfitandLossReports("", "", true);
  },
  "keyup #myInputSearch": function (event) {
    $(".table tbody tr").show();
    let searchItem = $(event.target).val();
    if (searchItem != "") {
      var value = searchItem.toLowerCase();
      $(".table tbody tr").each(function () {
        var found = "false";
        $(this).each(function () {
          if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            found = "true";
          }
        });
        if (found == "true") {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    } else {
      $(".table tbody tr").show();
    }
  },
  "blur #myInputSearch": function (event) {
    $(".table tbody tr").show();
    let searchItem = $(event.target).val();
    if (searchItem != "") {
      var value = searchItem.toLowerCase();
      $(".table tbody tr").each(function () {
        var found = "false";
        $(this).each(function () {
          if ($(this).text().toLowerCase().indexOf(value.toLowerCase()) >= 0) {
            found = "true";
          }
        });
        if (found == "true") {
          $(this).show();
        } else {
          $(this).hide();
        }
      });
    } else {
      $(".table tbody tr").show();
    }
  },

  "click .btnCloseCustomComparison": function (event) {},

  "click .lytAccountToggle": function (event) {
    $(".lytAccountToggle").each(function () {
      if ($(".lytAccountToggle").is(":checked")) {
        $(".btnAddGroup").hide();
        $(".btnGroupAccounts").show();
      } else {
        $(".btnAddGroup").show();
        $(".btnGroupAccounts").hide();
      }
    });
  },
  "click .btnMoveAccount": function (event) {
    $(".lytAccountToggle").each(function () {
      if ($(".lytAccountToggle").is(":checked")) {
        $("#nplMoveAccountScreen").modal("show");
      } else if ($(".lytAccountToggle").not(":checked")) {
        $("#nplNoSelection").modal("show");
      }
    });
  },
  "click .avoid": function (event) {
    $(".avoid").each(function () {
      $(this).click(function () {
        var el = $(this).attr("id");
        if (el === "gP") {
          $(this).addClass("currSelectedItem");
          $(".edlayCalculator").show();
          $(".editGroup").hide();
          $(".editDefault").hide();
          $(".groupRow").hide();
          $(".totalSelctor").hide();
          $(".pgbSideText").hide();
          $(".dateColumnTab").hide();
          $(".textBlockColumn").hide();
          $(".notesColumn").hide();
          $(".scheduleColumn").hide();
          $(".editRowGroup").hide();
          $(".rowEdLayCalculator").hide();
          $(".columnEdLayCalculator").hide();
          $(".budgetColumnTab").hide();
          $(".varianceColumnTab").hide();
          $(".percentageColumnTab").hide();
          $(".newDateColumnTab").hide();
          //                            $('.btnRowAccounts,.btnRowCustom').hide();
        } else if (el === "nP") {
          $(this).addClass("currSelectedItem");
          $(".edlayCalculator").show();
          $(".editGroup").hide();
          $(".editDefault").hide();
          $(".groupRow").hide();
          $(".totalSelctor").hide();
          $(".pgbSideText").hide();
          $(".dateColumnTab").hide();
          $(".textBlockColumn").hide();
          $(".notesColumn").hide();
          $(".scheduleColumn").hide();
          $(".editRowGroup").hide();
          $(".rowEdLayCalculator").hide();
          $(".columnEdLayCalculator").hide();
          $(".budgetColumnTab").hide();
          $(".varianceColumnTab").hide();
          $(".percentageColumnTab").hide();
          $(".newDateColumnTab").hide();
          $(".btnRowAccounts,.btnRowCustom").hide();
        } else {
          $(this).addClass("currSelectedItem");
          $(".editGroup").show();
          $(".edlayCalculator").hide();
          $(".editDefault").hide();
          $(".groupRow").hide();
          $(".totalSelctor").hide();
          $(".pgbSideText").hide();
          $(".dateColumnTab").hide();
          $(".textBlockColumn").hide();
          $(".notesColumn").hide();
          $(".scheduleColumn").hide();
          $(".editRowGroup").hide();
          $(".rowEdLayCalculator").hide();
          $(".columnEdLayCalculator").hide();
          $(".budgetColumnTab").hide();
          $(".varianceColumnTab").hide();
          $(".percentageColumnTab").hide();
          $(".newDateColumnTab").hide();
          $(".btnRowAccounts,.btnRowCustom").hide();
        }
      });
    });
  },

  /*Page break section display start*/
  "click .sortableAccount .draggable": function (event) {
    $(this).each(function () {
      $(this).click(function () {
        var el = $(this).attr("id");
        if (el === "pgBreak1") {
          $(this).addClass("currSelectedItem");
          $(".edlayCalculator").hide();
          $(".editGroup").hide();
          $(".editDefault").hide();
          $(".groupRow").hide();
          $(".pgbSideText").show();
          $(".totalSelctor").hide();
          $(".dateColumnTab").hide();
          $(".textBlockColumn").hide();
          $(".notesColumn").hide();
          $(".scheduleColumn").hide();
          $(".editRowGroup").hide();
          $(".rowEdLayCalculator").hide();
          $(".columnEdLayCalculator").hide();
          $(".budgetColumnTab").hide();
          $(".varianceColumnTab").hide();
          $(".percentageColumnTab").hide();
          $(".newDateColumnTab").hide();
          $(".btnRowAccounts,.btnRowCustom").hide();
        } else {
          $(".editGroup").show();
          $(".edlayCalculator").hide();
          $(".editDefault").hide();
          $(".groupRow").hide();
          $(".totalSelctor").hide();
          $(".pgbSideText").hide();
          $(".dateColumnTab").hide();
          $(".textBlockColumn").hide();
          $(".notesColumn").hide();
          $(".scheduleColumn").hide();
          $(".editRowGroup").hide();
          $(".rowEdLayCalculator").hide();
          $(".columnEdLayCalculator").hide();
          $(".budgetColumnTab").hide();
          $(".varianceColumnTab").hide();
          $(".percentageColumnTab").hide();
          $(".newDateColumnTab").hide();
          $(".btnRowAccounts,.btnRowCustom").hide();
        }
      });
    });
  },
  /*Page break section display end*/
  /*Total row display section start */
  "click .tot": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").show();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  /*Total row display section end */
  /*edit layout button start*/
  "click .nplLayoutEditorBtn": function (event) {
    $(".editGroup").hide();
    $(".edlayCalculator").hide();
    $(".groupRow").hide();
    $(".editDefault").show();
    $(".totalSelctor").hide();
    $(".pgbSideText").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  /*edit layout button end*/
  //calculator account selector
  "click .accValSelect": function (event) {
    var optSelectCheck = $(".accValSelect").val();
    if (optSelectCheck === null) {
      $(".nonOption").hide();
    } else {
      $(".nonOption").hide();

      //            var calcOptSelected = $('.accValSelect').val();
      //            var calcFieldContent = $('.calcField').val();

      //            var insblock = $('<input type="button" disabled class="calcVarBlock" data-formula-value="something1>');
      $(".calcField")
        .append(
          '<input type="button" disabled class="calcVarBlock" value="' +
            optSelectCheck +
            '">'
        )
        .val(optSelectCheck);
      optSelectCheck = null;
    }
  },
  //calculator account selector end

  //adding blocks
  //    'click .calcOption':function(event){
  //
  //            var calcOptSelected = $('.accValSelect').val();
  //            var calcFieldContent = $('.calcField').val();
  //
  //            var addCalcVarBlock = $('<input type="button" disabled class="calcVarBlock" data-formula-value="something1">').attr('value',calcOptSelected);
  //             $('.calcField').append(calcFieldContent+addCalcVarBlock);
  //    },
  //end adding blocks
  //calculator buttons
  /*    'click .opBtn':function (event){
        $('.opBtn').each(function () {
                var valEntry1 = $('.opBtn').val();
                var valEntry2 = $('.calcField').val();
                $('.calcField').val(valEntry2 + valEntry1);
                });
            }*/
  //calculator buttons currently
  "click .addition": function (event) {
    var valEntry1 = $(".addition").val();
    var valEntry2 = $(".calcField").val();
    //        $('.calcField').append(valEntry2 + valEntry1);
    $(".calcField").append(valEntry1);
  },
  "click .minus": function (event) {
    var valEntry1 = $(".minus").val();
    var valEntry2 = $(".calcField").val();
    //        $('.calcField').append(valEntry2 + valEntry1);
    $(".calcField").append(valEntry1);
  },
  "click .multi": function (event) {
    var valEntry1 = $(".multi").val();
    var valEntry2 = $(".calcField").val();
    //        $('.calcField').append(valEntry2 + valEntry1);
    $(".calcField").append(valEntry1);
  },
  "click .divide": function (event) {
    var valEntry1 = $(".divide").val();
    var valEntry2 = $(".calcField").val();
    //        $('.calcField').append(valEntry2 + valEntry1);
    $(".calcField").append(valEntry1);
  },
  "click .ifBlock": function (event) {
    var valEntry1 = $(".ifBlock").val();
    var valEntry2 = $(".calcField").val();
    //        $('.calcField').append(valEntry2 + valEntry1);
    $(".calcField").append(valEntry1);
  },
  //end calculator buttons

  //show group row section
  "click .sortableAccount .draggable": function (event) {
    $(".editGroup").hide();
    $(".edlayCalculator").hide();
    $(".groupRow").show();
    $(".editDefault").hide();
    $(".totalSelctor").hide();
    $(".pgbSideText").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  //end group row section
  "click #pgBreak1,.pageBreakBar ": function (event) {
    $(this).addClass("currSelectedItem");
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").show();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .accdate": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").show();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },

  //top row icon events
  "click .btnTextBlockColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").show();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnNotes": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").show();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnscheduleColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").show();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").show();
  },
  "click .btnRowGroupColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").show();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnRowFormulaColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").show();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnColFormulaColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").show();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnBudgetColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").show();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnVarianceColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").show();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnPercentageColumn": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").show();
    $(".newDateColumnTab").hide();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  "click .btnNewDateColumnTab": function (event) {
    $(".edlayCalculator").hide();
    $(".editGroup").hide();
    $(".editDefault").hide();
    $(".groupRow").hide();
    $(".pgbSideText").hide();
    $(".totalSelctor").hide();
    $(".dateColumnTab").hide();
    $(".textBlockColumn").hide();
    $(".notesColumn").hide();
    $(".scheduleColumn").hide();
    $(".editRowGroup").hide();
    $(".rowEdLayCalculator").hide();
    $(".columnEdLayCalculator").hide();
    $(".budgetColumnTab").hide();
    $(".varianceColumnTab").hide();
    $(".percentageColumnTab").hide();
    $(".newDateColumnTab").show();
    $(".btnRowAccounts,.btnRowCustom").hide();
  },
  //   'click .btnPageBreak':function(event){
  //       $('.sortableAccountParent').append('<div class="sortableAccount pageBreakBar"><div class="draggable" id="pgBreak1"><label class="col-12 dragAcc" style=" text-align: center; background-color:#00a3d3; border-color: #00a3d3;color:#fff;">Page break (row)</label></div></div>');
  // $(".sortableAccountParent").sortable({
  //     revert: true,
  //     cancel: ".undraggableDate,.accdate,.edtInfo"
  // });
  // $(".sortableAccount").sortable({
  //     revert: true,
  //     handle: ".avoid"
  // });
  // $(".draggable").draggable({
  //     connectToSortable: ".sortableAccount",
  //     helper: "none",
  //     revert: "true"
  // });
  //   },
  "click .btnDelSelected": function (event) {
    $(".currSelectedItem:nth-child(n)").remove();
  },
  "click .chkTotal": async function (event) {
    let templateObject = Template.instance();
    let options = await templateObject.reportOptions.get();
    if ($(".chkTotal").is(":checked")) {
      options.showtotal = true;
    } else {
      options.showtotal = false;
    }
    templateObject.reportOptions.set(options);
    setTimeout(function () {
      $("td a").each(function () {
        if (
          $(this)
            .text()
            .indexOf("-" + Currency) >= 0
        ) {
          $(this).addClass("text-danger");
          $(this).removeClass("fgrblue");
        }
      });
      $("td").each(function () {
        if (
          $(this)
            .text()
            .indexOf("-" + Currency) >= 0
        ) {
          $(this).addClass("text-danger");
          $(this).removeClass("fgrblue");
        }
      });
    }, 500);
  },
  "click .chkDecimals": async function (event) {
    let templateObject = Template.instance();
    let options = await templateObject.reportOptions.get();
    if ($(".chkDecimals").is(":checked")) {
      options.showDecimal = true;
    } else {
      options.showDecimal = false;
    }
    templateObject.reportOptions.set(options);
    setTimeout(function () {
      $("td a").each(function () {
        if (
          $(this)
            .text()
            .indexOf("-" + Currency) >= 0
        ) {
          $(this).addClass("text-danger");
          $(this).removeClass("fgrblue");
        }
      });
      $("td").each(function () {
        if (
          $(this)
            .text()
            .indexOf("-" + Currency) >= 0
        ) {
          $(this).addClass("text-danger");
          $(this).removeClass("fgrblue");
        }
      });
    }, 500);
  },

  "click .chkYTDate": function (event) {
    $(".tglYTD").toggle();
  },
  "click .chkAccBasis": function (event) {
    $(".tglAccBasis").toggle();
  },
  "click .chkAccCodes": function (event) {
    $(".tglAccCodes").toggle();
  },
  "click .rbAccrual": function (event) {
    $(".tglAccBasis").text("Accrual Basis");
    if ($(".chkAccBasis").is(":checked")) {
      // $('.chkAccBasis').trigger('click');
      $(".tglAccBasis").text("Accrual Basis");
    } else if ($(".chkAccBasis").is(":not(:checked)")) {
      $(".tglAccBasis").text("Accrual Basis");
      $(".chkAccBasis").trigger("click");
      $(".chkAccBasis").prop("checked", true);

      // $('.chkAccBasis').trigger('click');
    }
  },
  "click .rbCash": function (event) {
    $(".tglAccBasis").text("Cash Basis");
    if ($(".chkAccBasis").is(":checked")) {
      $(".tglAccBasis").text("Cash Basis");
    } else if ($(".chkAccBasis").is(":not(:checked)")) {
      $(".tglAccBasis").text("Cash Basis");
      $(".chkAccBasis").trigger("click");
      $(".chkAccBasis").prop("checked", true);

      // $('.chkAccBasis').trigger('click');
    }
  },
  "click .chkDecimal": function (event) {
    // var takeIn;
    // $('.fgr.text-right').each(function () {
    //   takeIn = $(this).text().substring(1);
    //   takeIn = parseInt(takeIn);
    //   $('.fgr.text-right').text(takeIn);
    // })
    // var numVal = $('.fgr').html().parseInt();
  },
  "click #savePnLFieldsLayout": function () {
    let templateObject = Template.instance();
    let groupName = $("#newGroupName").val();
    if (groupName == "") {
      swal({
        title: "Please enter group name",
        type: "error",
        showCancelButton: false,
        confirmButtonText: "Try Again",
      });
      return false;
    }
    let accountName = $("#nplPlaceInMoveSelection").val();
    let profitlosslayoutfields = templateObject.profitlosslayoutrecords.get();
    if (profitlosslayoutfields) {
      if( accountName == 'none' ){
        profitlosslayoutfields.push({
          Account: "",
          AccountID: 0,
          AccountLevel0GroupName: groupName,
          AccountLevel1GroupName: "",
          AccountLevel2GroupName: "",
          AccountName: groupName,
          Direction: "",
          GlobalRef: "DEF1",
          Group: "",
          ID: 0,
          ISEmpty: false,
          IsAccount: false,
          IsRoot: false,
          KeyStringFieldName: "",
          KeyValue: "",
          LayoutID: 1,
          LayoutToUse: "",
          Level: "",
          Level0Group: '',
          Level1Group: '',
          Level2Group: '',
          Level1Order: 1,
          Level2Order: 0,
          Level3Order: 0,
          MsTimeStamp: "2022-04-06 16:00:23",
          MsUpdateSiteCode: "DEF",
          Parent: 0,
          Pos: "0",
          Position: 0,
          Recno: 3,
          Up: false,
          subAccounts: []
        });
        $("#newGroupName").val("");
        templateObject.profitlosslayoutrecords.set(profitlosslayoutfields);
      }else{
        let updateLayouts = profitlosslayoutfields.filter(function (item, index) {
          if (item.AccountName == accountName) {
            item.subAccounts.push({
              Account: "",
              AccountID: 0,
              AccountLevel0GroupName: item.AccountName,
              AccountLevel1GroupName: groupName,
              AccountLevel2GroupName: "",
              AccountName: groupName,
              Direction: "",
              GlobalRef: "DEF1",
              Group: "",
              ID: 0,
              ISEmpty: false,
              IsAccount: false,
              IsRoot: false,
              KeyStringFieldName: "",
              KeyValue: "",
              LayoutID: 1,
              LayoutToUse: "",
              Level: "",
              Level0Group: '',
              Level1Group: '',
              Level2Group: '',
              Level1Order: 0,
              Level2Order: 0,
              Level3Order: 0,
              MsTimeStamp: "2022-04-06 16:00:23",
              MsUpdateSiteCode: "DEF",
              Parent: item.ID,
              Pos: "0",
              Position: 0,
              Recno: 3,
              Up: false,
            });
          }
          return item;
        });
        $("#newGroupName").val("");
        templateObject.profitlosslayoutrecords.set(updateLayouts);
      }
      
      $("#nplAddGroupScreen").modal("hide");
    }
  },
  "click .saveProfitLossLayouts": async function () {
    return false;
    // Under progress
    const profitLossLayoutApis = new ProfitLossLayoutApi();

    // make post request to save layout data
    const apiEndpoint = profitLossLayoutApis.collection.findByName(
      profitLossLayoutApis.collectionNames.TProfitLossLayout
    );

    let templateObject = Template.instance();

    /** Set layout positions */
    buildPositions();

    let fieldsList = [];
    // Fetch default lists of layout
    let profitlosslayoutfields =
      await templateObject.profitlosslayoutfields.get();
    Array.prototype.forEach.call(profitlosslayoutfields, async (item) => {
      let Position = $(`[key='layoutFields-${item.fields.ID}']`).attr(
        "position"
      );
      if (Position != undefined) {
        // update lists with custom fields only
        item.fields.Position = parseInt(
          $(`[key='layoutFields-${item.fields.ID}']`).attr("position")
        );
        item.fields.AccountLevel0GroupName = $(
          `[key='layoutFields-${item.fields.ID}']`
        )
          .parents(".setParentPosition")
          .data("acg0level");
        item.fields.AccountLevel1GroupName = $(
          `[key='layoutFields-${item.fields.ID}']`
        )
          .parents(".setParentPosition")
          .data("acg1level");
        item.fields.AccountLevel2GroupName = $(
          `[key='layoutFields-${item.fields.ID}']`
        )
          .parents(".setParentPosition")
          .data("acg2level");
      }
      // fieldsList.push(item);
      /**
       * Update layout fields one by one API call
       */
      const ApiResponse = await apiEndpoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify(item),
      });
      if (ApiResponse.ok == true) {
        const jsonResponse = await ApiResponse.json();
        console.log(jsonResponse);
      }
    });

    /**
     *
     * Update all layout fields with single API call
     */

    // let layoutLists = {
    //   tprofitlosslayout: fieldsList
    // }

    // const ApiResponse = await apiEndpoint.fetch(null, {
    //   method: "POST",
    //   headers: ApiService.getPostHeaders(),
    //   body: JSON.stringify(layoutLists),
    // });
    // if (ApiResponse.ok == true) {
    //   const jsonResponse = await ApiResponse.json();
    //   console.log(jsonResponse)
    // }
  },
});

Template.newprofitandloss.helpers({
  convertAmount: (amount = 0.0, currencyData) => {
    console.log(amount);
    amount = isNaN(amount) ? 0.00 : Number.isInteger(amount) ? amount : amount.substring(1);
    console.log(amount);
    console.log(currencyData);
    if (currencyData.currency == "AUD") {
      return amount;
    }
    let currencyList = Template.instance().tcurrencyratehistory.get(); // Get tCurrencyHistory

    const d = $("#dateTo").val();
    console.log(d);

    let rate = currencyData.buyrate; // Must used from tcurrecyhistory
    let convertedAmount = `${currencyData.symbol} ${amount * rate}`;
    console.log(convertedAmount);

    return convertedAmount;
  },
  count: (array) => {
    return array.length;
  },
  countActive: (array) => {
    let activeArray = array.filter((c) => c.active == true);
    return activeArray.length;
  },
  currencyList: () => {
    return Template.instance().currencyList.get();
  },
  isAccount(layout) {
    if (layout.AccountID > 1) {
      return true;
    }
    return false;
  },
  loggedCompany: () => {
    return localStorage.getItem("mySession") || "";
  },
  reportOptions: () => {
    return Template.instance().reportOptions.get();
  },
  formatDate(currentDate) {
    return moment(currentDate).format("DD/MM/YYYY");
  },
  profitlosslayoutrecords() {
    return Template.instance().profitlosslayoutrecords.get();
  },
  records: () => {
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
  recordslayout: () => {
    return Template.instance().recordslayout.get();
  },
  dateAsAt: () => {
    return Template.instance().dateAsAt.get() || "-";
  },
  companyname: () => {
    return loggedCompany;
  },
  deptrecords: () => {
    return Template.instance()
      .deptrecords.get()
      .sort(function (a, b) {
        if (a.department == "NA") {
          return 1;
        } else if (b.department == "NA") {
          return -1;
        }
        return a.department.toUpperCase() > b.department.toUpperCase() ? 1 : -1;
      });
  },
});

Template.registerHelper("count", function (array) {
  return array.length;
});

Template.registerHelper("equals", function (a, b) {
  return a === b;
});

Template.registerHelper("notEquals", function (a, b) {
  return a != b;
});

Template.registerHelper("containsequals", function (a, b) {
  let chechTotal = false;
  if (a.toLowerCase().indexOf(b.toLowerCase()) >= 0) {
    chechTotal = true;
  }
  return chechTotal;
});

Template.registerHelper("shortDate", function (a) {
  let dateIn = a;
  let dateOut = moment(dateIn, "DD/MM/YYYY").format("MMM YYYY");
  return dateOut;
});

Template.registerHelper("noDecimal", function (a) {
  let numIn = a;
  // numIn= $(numIn).val().substring(1);
  // numIn= $(numIn).val().replace('$','');

  // numIn= $numIn.text().replace('-','');
  let numOut = parseInt(numIn);
  return numOut;
});
