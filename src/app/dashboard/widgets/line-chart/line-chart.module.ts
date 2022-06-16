import { ChartModule, SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService } from '@syncfusion/ej2-angular-charts';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LineChartComponent } from './line-chart.component';

@NgModule({
  imports: [CommonModule, ChartModule],
  exports: [LineChartComponent],
  declarations: [LineChartComponent],
  providers: [SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService],
})
export class LineChartModule {}
