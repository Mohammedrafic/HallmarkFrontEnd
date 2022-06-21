import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { WidgetWrapperModule } from "../widget-wrapper/widget-wrapper.module";
import { PositionChartComponent } from "./position-chart.component";

@NgModule({
  declarations: [PositionChartComponent],
  imports:[CommonModule, WidgetWrapperModule],
  exports: [PositionChartComponent]
})
export class PositionChartModule {}