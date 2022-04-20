import DashboardApi from "../Api/DashboardApi";
import Tvs1ChartDashboardPreference from "../Api/Model/Tvs1ChartDashboardPreference";
import Tvs1ChartDashboardPreferenceField from "../Api/Model/Tvs1ChartDashboardPreferenceField";
import ApiService from "../Api/Module/ApiService";
import ChartHandler from "./ChartHandler";

export default class resizableCharts {
  static enable(timeOut = 200) {
    setTimeout(() => {
      $(".portlet").resizable({
        disabled: false,
        minHeight: 200,
        minWidth: 250,
        // aspectRatio: 1.5 / 1
        handles: "e,s",
        stop: async (event, ui) => {
          // here we need to save this chart

          /**
           * Build the positions of the widgets
           */
          ChartHandler.buildPositions();
          await ChartHandler.saveChart(
            $(ui.element[0]).parents(".sortable-chart-widget-js")
          );
        },
        resize: function (event, ui) {
          let chartHeight = ui.size.height - 150;
          let chartWidth = ui.size.width - 20;

          $(ui.element[0])
            .parents(".sortable-chart-widget-js")
            .removeClass("col-md-6"); // when you'll star resizing, it will remove its size

          // if ($(ui.element[0]).parents(".sortable-chart-widget-js").attr("key") != "purchases__expenses_breakdown") {

          // will not apply on Expenses breakdown
          $(ui.element[0]).find("canvas").css("width", chartWidth);
          $(ui.element[0]).find("canvas").css("height", chartHeight);
          // } else {
          //   $(ui.element[0]).css('height', '');
          //   $(ui.element[0]).find("canvas").css('width', '100%');
          // }

          //  console.log(event.currentTarget);
          //   console.log(ui.element[0]);
        },
      });
    }, timeOut);
  }

  static disable() {
    $(".portlet").resizable({
      disabled: true,
      minHeight: 200,
      minWidth: 250,
      // aspectRatio: 1.5 / 1
      handles: "e",
    });
  }
}