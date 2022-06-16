import { NgModule } from '@angular/core';

import { AccumulationChartComponent } from './accumulation-chart.component';
import { CommonModule } from '@angular/common';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { AccumulationChartModule as SFAccumulationChartModule, PieSeriesService } from '@syncfusion/ej2-angular-charts';

@NgModule({
  imports: [CommonModule, WidgetWrapperModule, SFAccumulationChartModule],
  exports: [AccumulationChartComponent],
  declarations: [AccumulationChartComponent],
  providers: [PieSeriesService]
})
export class AccumulationChartModule {}
