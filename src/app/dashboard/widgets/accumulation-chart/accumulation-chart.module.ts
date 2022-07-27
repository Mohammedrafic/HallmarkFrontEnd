import { AccumulationChartModule as SFAccumulationChartModule, AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccumulationChartComponent } from './accumulation-chart.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { WidgetLegendModule } from '../widget-legend/widget-legend.module';

@NgModule({
  imports: [CommonModule, SFAccumulationChartModule, WidgetWrapperModule, WidgetLegendModule],
  exports: [AccumulationChartComponent],
  declarations: [AccumulationChartComponent],
  providers: [AccumulationTooltipService]
})
export class AccumulationChartModule {}
