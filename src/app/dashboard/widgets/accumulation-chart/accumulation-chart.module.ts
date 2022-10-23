import { AccumulationChartModule as SFAccumulationChartModule, AccumulationTooltipService } from '@syncfusion/ej2-angular-charts';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccumulationChartComponent } from './accumulation-chart.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { WidgetLegendModule } from '../widget-legend/widget-legend.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';

@NgModule({
  imports: [CommonModule, SFAccumulationChartModule, WidgetWrapperModule, WidgetLegendModule,TooltipModule, FeatherModule.pick({ Info })],
  exports: [AccumulationChartComponent],
  declarations: [AccumulationChartComponent],
  providers: [AccumulationTooltipService]
})
export class AccumulationChartModule {}
