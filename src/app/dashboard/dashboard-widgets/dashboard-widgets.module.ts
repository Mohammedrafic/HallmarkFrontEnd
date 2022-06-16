import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccumulationChartModule } from '../widgets/accumulation-chart/accumulation-chart.module';
import { DashboardWidgetsComponent } from './dashboard-widgets.component';
import { MapsChartModule } from '../widgets/maps-chart/maps-chart.module';
import { WidgetWrapperModule } from '../widgets/widget-wrapper/widget-wrapper.module';

@NgModule({
  declarations: [DashboardWidgetsComponent],
  exports: [DashboardWidgetsComponent],
  imports: [
    AccumulationChartModule,
    CommonModule,
    DashboardLayoutModule,
    MapsChartModule,
    WidgetWrapperModule,
  ]
})
export class DashboardWidgetsModule { }
