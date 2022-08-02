import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  ChartModule,
  SplineSeriesService,
  CategoryService,
  LegendService,
  TooltipService,
  CrosshairService,
} from '@syncfusion/ej2-angular-charts';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';

import { LineChartComponent } from './line-chart.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { WidgetLegendModule } from '../widget-legend/widget-legend.module';
import { WidgetWrapperColumnModule } from '../widget-wrapper-column/widget-wrapper-column.module';

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    WidgetWrapperModule,
    ButtonModule,
    WidgetLegendModule,
    WidgetWrapperColumnModule,
  ],
  exports: [LineChartComponent],
  declarations: [LineChartComponent],
  providers: [SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService],
})
export class LineChartModule {}
