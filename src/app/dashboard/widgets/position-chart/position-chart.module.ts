import { NgModule } from "@angular/core";
import { WidgetWrapperModule } from "../widget-wrapper/widget-wrapper.module";
import { PositionChartComponent } from "./position-chart.component";

@NgModule({
  declarations: [PositionChartComponent],
  imports:[WidgetWrapperModule],
  exports: [PositionChartComponent]
})
export class PositionChartModule {}