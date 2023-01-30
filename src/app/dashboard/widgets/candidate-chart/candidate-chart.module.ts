import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { WidgetWrapperModule } from "../widget-wrapper/widget-wrapper.module";
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';
import { CandidateChartComponent } from "./candidate-chart.component";

@NgModule({
  declarations: [CandidateChartComponent],
  imports: [CommonModule, WidgetWrapperModule, TooltipModule, FeatherModule.pick({ Info })],
  exports: [CandidateChartComponent]
})
export class CandidateChartModule {}