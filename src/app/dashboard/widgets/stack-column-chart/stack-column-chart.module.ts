import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StackColumnChartComponent } from './stack-column-chart.component';
import { ChartModule } from '@syncfusion/ej2-angular-charts';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { ButtonModule } from '@syncfusion/ej2-angular-buttons';
import { WidgetLegendModule } from '../widget-legend/widget-legend.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';
import { ChartAllModule, AccumulationChartAllModule, RangeNavigatorAllModule } from '@syncfusion/ej2-angular-charts';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  declarations: [
    StackColumnChartComponent
  ],
  exports: [StackColumnChartComponent],
  imports: [
    CommonModule,
    ChartAllModule, RangeNavigatorAllModule,  ButtonModule, AccumulationChartAllModule,
    WidgetWrapperModule,
    ButtonModule,
    WidgetLegendModule,
    TooltipModule,
    FeatherModule.pick({ Info })
  ],
})
export class StackColumnChartModule { }
