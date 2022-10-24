import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { WidgetWrapperModule } from "../widget-wrapper/widget-wrapper.module";
import { PositionChartComponent } from "./position-chart.component";
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';

@NgModule({
  declarations: [PositionChartComponent],
  imports: [CommonModule, WidgetWrapperModule, TooltipModule, FeatherModule.pick({ Info })],
  exports: [PositionChartComponent]
})
export class PositionChartModule {}
