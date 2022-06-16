import { AccumulationChartModule as SFAccumulationChartModule, PieSeriesService } from '@syncfusion/ej2-angular-charts';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccumulationChartComponent } from './accumulation-chart.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';

@NgModule({
  imports: [CommonModule, SFAccumulationChartModule, WidgetWrapperModule],
  exports: [AccumulationChartComponent],
  declarations: [AccumulationChartComponent],
  providers: [PieSeriesService]
})
export class AccumulationChartModule {}
