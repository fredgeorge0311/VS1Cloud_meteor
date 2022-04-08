import { ReactiveVar } from 'meteor/reactive-var';
import "gauge-chart";

import DashboardApi from "../../js/Api/DashboardApi";
import Tvs1chart from "../../js/Api/Model/Tvs1Chart";
import resizableCharts from "../../js/Charts/resizableCharts";
import ChartsEditor from "../../js/Charts/ChartsEditor";
import draggableCharts from "../../js/Charts/draggableCharts";
import Tvs1ChartDashboardPreference from "../../js/Api/Model/Tvs1ChartDashboardPreference";
import Tvs1ChartDashboardPreferenceField from "../../js/Api/Model/Tvs1ChartDashboardPreferenceField";
import ApiService from "../../js/Api/Module/ApiService";
let _ = require('lodash');

/**
 * Current User ID
 */
 const employeeId = Session.get("mySessionEmployeeLoggedID");
 const _chartGroup = "";
 const _tabGroup = 0;
 const chartsEditor = new ChartsEditor(
   () => {
     $("#resetcharts").removeClass("hideelement").addClass("showelement"); // This will show the reset charts button
 
     $("#btnDone").addClass("showelement");
     $("#btnDone").removeClass("hideelement");
     $("#btnCancel").addClass("showelement");
     $("#btnCancel").removeClass("hideelement");
     $("#editcharts").addClass("hideelement");
     $("#editcharts").removeClass("showelement");
     $(".btnchartdropdown").addClass("hideelement");
     $(".btnchartdropdown").removeClass("showelement");
 
     // $("#resalecomparision").removeClass("hideelement");
     // $("#quotedinvoicedamount").removeClass("hideelement");
     // $("#expensechart").removeClass("hideelement");
     // $("#monthlyprofitlossstatus").removeClass("hideelement");
     // $("#resalecomparision").removeClass("hideelement");
     // $("#showearningchat").removeClass("hideelement");
 
     $(".sortable-chart-widget-js").removeClass("hideelement"); // display every charts
     $(".on-editor-change-mode").removeClass("hideelement");
     $(".on-editor-change-mode").addClass("showelement");
   },
   () => {
     $("#resetcharts").addClass("hideelement").removeClass("showelement"); // this will hide it back
     $("#btnDone").addClass("hideelement");
     $("#btnDone").removeClass("showelement");
     $("#btnCancel").addClass("hideelement");
     $("#btnCancel").removeClass("showelement");
     $("#editcharts").addClass("showelement");
     $("#editcharts").removeClass("hideelement");
     $(".btnchartdropdown").removeClass("hideelement");
     $(".btnchartdropdown").addClass("showelement");
 
     $(".on-editor-change-mode").removeClass("showelement");
     $(".on-editor-change-mode").addClass("hideelement");
   }
 );

 /**
 * Build the positions of the widgets
 */
const buildPositions = async () => {
    const charts = $(".chart-visibility");
  
    for (let i = 0; i <= charts.length; i++) {
      $(charts[i]).attr("position", i);
    }
};

/**
 * This function will save the charts on the dashboard
 */
const saveCharts = async () => {
    /**
     * Lets load all API colections
     */
    const dashboardApis = new DashboardApi(); // Load all dashboard APIS
    buildPositions();
  
    const charts = $(".chart-visibility");
    // console.log(charts);
  
    /**
     * @property {Tvs1ChartDashboardPreference[]}
     */
    let chartList = [];
  
    // now we have to make the post request to save the data in database
    const apiEndpoint = dashboardApis.collection.findByName(
      dashboardApis.collectionNames.Tvs1dashboardpreferences
    );
  
    Array.prototype.forEach.call(charts, (chart) => {
      //console.log(chart);
      chartList.push(
        new Tvs1ChartDashboardPreference({
          type: "Tvs1dashboardpreferences",
          fields: new Tvs1ChartDashboardPreferenceField({
            Active:
              $(chart).find(".on-editor-change-mode").attr("is-hidden") == true ||
              $(chart).find(".on-editor-change-mode").attr("is-hidden") == "true"
                ? false
                : true,
            ChartID: $(chart).attr("chart-id"),
            ID: $(chart).attr("pref-id"), // This is empty when it is the first time, but the next times it is filled
            EmployeeID: employeeId,
            Chartname: $(chart).attr("chart-name"),
            Position: parseInt($(chart).attr("position")),
            ChartGroup: _chartGroup,
            TabGroup: _tabGroup,
            ChartWidth: $(chart).find(".ui-resizable").width(),
            ChartHeight: $(chart).find(".ui-resizable").height(),
          }),
        })
      );
    });
    for (const _chart of chartList) {
      // chartList.forEach(async (chart) => {
      //console.log("Saving chart");
  
      const ApiResponse = await apiEndpoint.fetch(null, {
        method: "POST",
        headers: ApiService.getPostHeaders(),
        body: JSON.stringify(_chart),
      });
  
      if (ApiResponse.ok == true) {
        const jsonResponse = await ApiResponse.json();
        // console.log(
        //   "Chart: " +
        //     _chart.ChartName +
        //     " will be hidden ? " +
        //     !_chart.fields.Active
        // );
      }
      //});
    }
};

Template.allChartLists.onRendered(function(){
    const templateObject = Template.instance();

    _tabGroup = $('#connectedSortable').data('tabgroup');
    _chartGroup =  $('#connectedSortable').data('chartgroup');

    templateObject.hideChartElements = () => {
        // on edit mode false
        // $(".on-editor-change-mode").removeClass("showelement");
        // $(".on-editor-change-mode").addClass("hideelement");

        var dimmedElements = document.getElementsByClassName("dimmedChart");
        while (dimmedElements.length > 0) {
            dimmedElements[0].classList.remove("dimmedChart");
        }
    };
    templateObject.saveIntoLocalDB = async (e) => {
        const chartList = []
        const chartcontainer = $(e.currentTarget).parents('.sortable-chart-widget-js');
        let chartID = $(chartcontainer).attr("chart-id")
        let dbchartslist = await JSON.parse(localStorage.getItem(_chartGroup));
        if( dbchartslist ){      
          chartList = await dbchartslist.filter(item => item.fields.ChartID !== chartID);
        }
        chartList.push(
          new Tvs1ChartDashboardPreference({
            type: "Tvs1dashboardpreferences",
            fields: new Tvs1ChartDashboardPreferenceField({
              Active:
                $(chartcontainer).find(".on-editor-change-mode").attr("is-hidden") == true ||
                $(chartcontainer).find(".on-editor-change-mode").attr("is-hidden") == "true"
                  ? false
                  : true,
              ChartID: $(chartcontainer).attr("chart-id"),
              ID: $(chartcontainer).attr("pref-id"), // This is empty when it is the first time, but the next times it is filled
              EmployeeID: employeeId,
              Chartname: $(chartcontainer).attr("chart-name"),
              Position: parseInt($(chartcontainer).attr("position")),
              ChartGroup: _chartGroup,
              ChartWidth: $(chartcontainer).find(".ui-resizable").width(),
            }),
          })
        )
        console.log( chartList )    
        localStorage.setItem(_chartGroup, JSON.stringify(chartList));
    };
    
    templateObject.showChartElements = function () {
        // on edit mode true
    
        // $(".on-editor-change-mode").addClass("showelement");
        // $(".on-editor-change-mode").removeClass("hideelement");
    
        $(".card").addClass("dimmedChart");
        $(".py-2").removeClass("dimmedChart");
    };
    templateObject.checkChartToDisplay = async () => {
        const dashboardApis = new DashboardApi(); // Load all dashboard APIS
        let displayedCharts = 0;
    
        const allChartsEndpoint = dashboardApis.collection.findByName(
          dashboardApis.collectionNames.vs1charts
        );
        allChartsEndpoint.url.searchParams.append("ListType", "'Detail'");
        const allChartResponse = await allChartsEndpoint.fetch();
    
        if (allChartResponse.ok == true) {
          const allChartsJsonResponse = await allChartResponse.json();
          //console.log(allChartsJsonResponse);
    
          let chartList = Tvs1chart.fromList(
            allChartsJsonResponse.tvs1charts
          );
          // console.log(allChartResponse);
          // console.log('chartlist', chartList);
          // the goal here is to get the right names so it can be used for preferences
          chartList.forEach((chart) => {
            //chart.fields.active = false; // Will set evething to false
            chart.fields._chartSlug =
              chart.fields.ChartGroup.toLowerCase() +
              "__" +
              chart.fields.ChartName.toLowerCase().split(" ").join("_");
    
    
            $(`[key='${chart.fields._chartSlug}']`).attr(
              "chart-id",
              chart.fields.ID
            );
            if( chart.fields.ChartGroup == _chartGroup ){
              $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).text("Hide");
              $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).attr(
                "is-hidden",
                "false"
              );
              $(`[key='${chart.fields._chartSlug}']`).removeClass("hideelement");
              $(`[key='${chart.fields._chartSlug}']`).addClass('chart-visibility');
            } else {
              $(`[key='${chart.fields._chartSlug}']`).addClass('hideelement');
              $(`[key='${chart.fields._chartSlug}']`).removeClass('chart-visibility');
              $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).text("Show");
              $(`[key='${chart.fields._chartSlug}'] .on-editor-change-mode`).attr(
                "is-hidden",
                "true"
              );
            }
    
            // $(`[key='${chart.fields._chartSlug}']`).attr(
            //   "pref-id",
            //   chart.fields.ID
            // );
            $(`[key='${chart.fields._chartSlug}']`).attr(
              "chart-slug",
              chart.fields._chartSlug
            );
    
            $(`[key='${chart.fields._chartSlug}']`).attr(
              "chart-group",
              chart.fields.ChartGroup
            );
    
            $(`[key='${chart.fields._chartSlug}']`).attr(
              "chart-name",
              chart.fields.ChartName
            );
            $(`[key='${chart.fields._chartSlug}']`).attr(
              "chart-active",
              chart.fields.Active
            );
            $(`[key='${chart.fields._chartSlug}']`).attr(
              "chart-user-pref-is-hidden",
              !chart.fields.Active
            );
          });
        }
    
        // Now get user preferences
        const dashboardPreferencesEndpoint = dashboardApis.collection.findByName(
          dashboardApis.collectionNames.Tvs1dashboardpreferences
        );
    
        dashboardPreferencesEndpoint.url.searchParams.append(
          "ListType",
          "'Detail'"
        );
        dashboardPreferencesEndpoint.url.searchParams.append(
          "select",
          `[employeeID]=${employeeId}`
        );
        dashboardPreferencesEndpoint.url.searchParams.append(
          "select",
          `[TabGroup]=${_tabGroup}`
        );
    
        // this is the default list (hardcoded)
        let itemList = [
          "dashboard__monthyl_profit_and_loss",
          "dashboard__profit_and_loss",
          "dashboard__expenses",
          "dashboard__quoted_amounts_/_invoiced_amounts",
          "dashboard__monthly_earnings",
          "dashboard__employee_sales_comparison",
        ];
    
        const dashboardPreferencesEndpointResponse =
          await dashboardPreferencesEndpoint.fetch(); // here i should get from database all charts to be displayed
    
        if (dashboardPreferencesEndpointResponse.ok == true) {
          const dashboardPreferencesEndpointJsonResponse =
            await dashboardPreferencesEndpointResponse.json();
    
          let tvs1ChartDashboardPreference = Tvs1ChartDashboardPreference.fromList(
            dashboardPreferencesEndpointJsonResponse.tvs1dashboardpreferences
          ).filter((chart) => {
            if (chart.fields.TabGroup == _tabGroup) {
              return chart;
            }
          });
    
          console.log('tvs1ChartDashboardPreference', tvs1ChartDashboardPreference);
    
          if (tvs1ChartDashboardPreference.length > 0) {
            // if charts to be displayed are specified
            tvs1ChartDashboardPreference.forEach((tvs1chart, index) => {
              // setTimeout(() => {
                // this is good to see how the charts are apearing or not
                //if (tvs1chart.fields.ChartGroup == "Dashboard") {
                const itemName =
                  tvs1chart.fields.ChartGroup.toLowerCase() +
                  "__" +
                  tvs1chart.fields.Chartname.toLowerCase().split(" ").join("_"); // this is the new item name
    
                //localStorage.setItem(itemName, tvs1chart);
                //console.log(itemName + " " + tvs1chart.fields.Active);
    
                //if (itemList.includes(itemName) == true) {
                  // If the item name exist
                  if (tvs1chart.fields.ChartWidth) {
                    $(`[key='${itemName}'] .ui-resizable`).css(
                      "width",
                      tvs1chart.fields.ChartWidth
                    );
                  }
    
                   // This is the ChartHeight saved in the preferences
                   if (tvs1chart.fields.ChartHeight) {
                    $(`[key='${itemName}'] .ui-resizable`).css(
                      "height",
                      tvs1chart.fields.ChartHeight
                    );
                  }
                  $(`[key='${itemName}']`).attr(
                    "pref-id",
                    tvs1chart.fields.ID
                  );
                  $(`[key='${itemName}']`).attr("position", tvs1chart.fields.Position);
                  $(`[key='${itemName}']`).attr("chart-id", tvs1chart.fields.ChartID);
                  $(`[key='${itemName}']`).attr(
                    "chart-group",
                    tvs1chart.fields.chartGroup
                  );
                  $(`[key='${itemName}']`).addClass("chart-visibility");
                  //$(`[key='${itemName}']`).attr('chart-id', tvs1chart.fields.Id);
                  $(`[key='${itemName}'] .on-editor-change-mode`).attr(
                    "chart-slug",
                    itemName
                  );
    
                  if (tvs1chart.fields.Active == true) {
                    $(`[key='${itemName}'] .on-editor-change-mode`).text("Hide");
                    $(`[key='${itemName}'] .on-editor-change-mode`).attr(
                      "is-hidden",
                      "false"
                    );
    
                    $(`[key='${itemName}']`).removeClass("hideelement");
                    //$(`[key='${itemName}']`).attr("is-hidden", false);
                  } else {
                    $(`[key='${itemName}']`).addClass("hideelement");
                    $(`[key='${itemName}'] .on-editor-change-mode`).text("Show");
                    // $(`[key='${itemName}']`).attr("is-hidden", true);
                    $(`[key='${itemName}'] .on-editor-change-mode`).attr(
                      "is-hidden",
                      "true"
                    );
                  }
                //}
                //}
              // }, index * 100);
            });
            // Handle sorting
            let $chartWrappper = $('.connectedSortable');
            $chartWrappper.find('.sortable-chart-widget-js').sort(function(a, b) {
                return +a.getAttribute('position') - +b.getAttribute('position');
            }).appendTo($chartWrappper);

            displayedCharts = document.querySelectorAll(
              ".chart-visibility:not(.hideelement)"
            );
            if (displayedCharts.length == 0) {
              // this will show all by default
              //console.log("No charts are being displayed, so show everything");
              itemList.forEach((item) => {
                $(`[key='${item}'] .on-editor-change-mode`).text("Hide");
                $(`[key='${item}'] .on-editor-change-mode`).attr("is-hidden", false);
                $(`[key='${item}'] .on-editor-change-mode`).attr("chart-slug", item);
                $(`[key='${item}']`).removeClass("hideelement");
                $(`[key='${item}']`).addClass("chart-visibility");
                // $(`[key='${item}']`).attr("is-hidden", false);
              });
      
              buildPositions();
            }
          }
          // let sortableWidgets = $('.sortable-chart-widget-js');
          // // and now we need to sort
          // var sort_by_position = function (a, b) {
          //   // console.log(a.getAttribute('position'));
          //   // console.log(b.getAttribute('position'));
          //   if(parseInt(a.getAttribute('position'))
          //   .localeCompare(parseInt(b.getAttribute('position'))) == parseInt(a.getAttribute('position'))) {
          //     return a.innerHtml;
          //   }else {
          //     return b.innerHtml;
          //   }
        
          // };
          // sortableWidgets.sort(sort_by_position);
          // for (var i = 0; i < sortableWidgets.length; i++) {
          //   sortableWidgets[i].parentNode.appendChild(sortableWidgets[i]);
          // }
    
         
        }
    };
    templateObject.deactivateDraggable = () => {
        draggableCharts.disable();
        resizableCharts.disable(); // this will disable charts resiable features
    };
    templateObject.activateDraggable = () => {
        draggableCharts.enable();
        resizableCharts.enable(); // this will enable charts resiable features
    };    
    templateObject.checkChartToDisplay(); // we run this so we load the correct charts to diplay
    templateObject.activateDraggable(); // this will enable charts resiable features

});

Template.allChartLists.events({
    "click .on-editor-change-mode": (e) => {
      // this will toggle the visibility of the widget
      if ($(e.currentTarget).attr("is-hidden") == "true") {
        // console.log('was true');
        // $(e.currentTarget).parent(".chart-visibility").attr("is-hidden", 'false');
        // $(e.currentTarget).parent(".chart-visibility").addClass('hideelement');
        $(e.currentTarget).attr("is-hidden", "false");
  
        $(e.currentTarget).text("Hide");
      } else {
        // console.log('was false');
        // $(e.currentTarget).parent(".chart-visibility").attr("is-hidden", 'true');
        // $(e.currentTarget).parent(".chart-visibility").removeClass('hideelement');
        $(e.currentTarget).attr("is-hidden", "true");
        $(e.currentTarget).text("Show");
      }
      // const templateObject = Template.instance();
      // templateObject.saveIntoLocalDB(e)
    },
    "mouseover .card-header": (e) => {
      $(e.currentTarget).parent(".card").addClass("hovered");
    },
    "mouseleave .card-header": (e) => {
      $(e.currentTarget).parent(".card").removeClass("hovered");
    },
    "click .btnBatchUpdate": function () {
      $(".fullScreenSpin").css("display", "inline-block");
      batchUpdateCall();
    },
    "click .editchartsbtn": () => {
      $(".editcharts").trigger("click");
      chartsEditor.enable();
  
      const templateObject = Template.instance();
      templateObject.showChartElements();
    },
  
    "click #resetcharts": () => {
      chartsEditor.disable();
      const templateObject = Template.instance();
  
      $("#btnDone").addClass("hideelement");
      $("#btnDone").removeClass("showelement");
      $("#btnCancel").addClass("hideelement");
      $("#btnCancel").removeClass("showelement");
      $("#editcharts").addClass("showelement");
      $("#editcharts").removeClass("hideelement");
      $(".btnchartdropdown").removeClass("hideelement");
      $(".btnchartdropdown").addClass("showelement");
  
      // set everything to true
      localStorage.setItem("profitchat", true);
      localStorage.setItem("profitloss", true);
      localStorage.setItem("resaleschat", true);
      localStorage.setItem("quotedinvoicedchart", true);
      localStorage.setItem("earningschat", true);
      localStorage.setItem("expenseschart", true);
  
      templateObject.hideChartElements();
      templateObject.checkChartToDisplay();
      // templateObject.deactivateDraggable();
    },
    "click #btnCancel": async () => {
      $(".fullScreenSpin").css("display", "block");
      chartsEditor.disable();  
      const templateObject = Template.instance();
      await templateObject.hideChartElements();
      await templateObject.checkChartToDisplay();
      $(".fullScreenSpin").css("display", "none");  
      //templateObject.deactivateDraggable();
    },
  
    "click #btnDone": async () => {  
      const templateObject = Template.instance();
      $(".fullScreenSpin").css("display", "block");
      await saveCharts();
      await chartsEditor.disable();
      await templateObject.hideChartElements();
      await templateObject.checkChartToDisplay()
      $(".fullScreenSpin").css("display", "none");
    },
   
});


