import { NgModule } from '@angular/core';

import { LineChartComponent } from './line-chart.component';
import { CommonModule } from '@angular/common';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { ChartModule, SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService } from '@syncfusion/ej2-angular-charts';

@NgModule({
  imports: [CommonModule, WidgetWrapperModule, ChartModule],
  exports: [LineChartComponent],
  declarations: [LineChartComponent],
  providers: [SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService],
})
export class LineChartModule {}
