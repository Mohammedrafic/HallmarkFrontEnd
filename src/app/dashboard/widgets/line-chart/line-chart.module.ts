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
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';

@NgModule({
  imports: [
    CommonModule,
    ChartModule,
    WidgetWrapperModule,
    ButtonModule,
    WidgetLegendModule,
    TooltipModule,
    FeatherModule.pick({ Info })
  ],
  exports: [LineChartComponent],
  declarations: [LineChartComponent],
  providers: [SplineSeriesService, CategoryService, LegendService, TooltipService, CrosshairService],
})
export class LineChartModule {}
