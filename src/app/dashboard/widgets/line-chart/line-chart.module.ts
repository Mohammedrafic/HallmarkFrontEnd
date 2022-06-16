import {
  ChartModule,
  SplineSeriesService,
  CategoryService,
  LegendService,
  TooltipService,
  CrosshairService,
} from '@syncfusion/ej2-angular-charts';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { LineChartComponent } from './line-chart.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';

@NgModule({
  imports: [CommonModule, ChartModule, WidgetWrapperModule],
  exports: [LineChartComponent],
  declarations: [LineChartComponent],
  providers: [SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService],
})
export class LineChartModule {}
