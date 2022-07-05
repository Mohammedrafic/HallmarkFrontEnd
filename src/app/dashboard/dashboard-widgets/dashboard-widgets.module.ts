import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccumulationChartModule } from '../widgets/accumulation-chart/accumulation-chart.module';
import { DashboardWidgetsComponent } from './dashboard-widgets.component';
import { MapsChartModule } from '../widgets/maps-chart/maps-chart.module';
import { WidgetWrapperModule } from '../widgets/widget-wrapper/widget-wrapper.module';
import { LineChartModule } from '../widgets/line-chart/line-chart.module';
import { PositionChartModule } from '../widgets/position-chart/position-chart.module';
import { TasksModule } from '../widgets/tasks/tasks.module';
import { ChatModule } from '../widgets/chat/chat.module';
import { InvoicesChartModule } from '../widgets/invoices-chart/invoices-chart.module';

@NgModule({
  declarations: [DashboardWidgetsComponent],
  exports: [DashboardWidgetsComponent],
  imports: [
    AccumulationChartModule,
    CommonModule,
    DashboardLayoutModule,
    MapsChartModule,
    WidgetWrapperModule,
    LineChartModule,
    PositionChartModule,
    TasksModule,
    ChatModule,
    InvoicesChartModule
  ]
})
export class DashboardWidgetsModule { }
