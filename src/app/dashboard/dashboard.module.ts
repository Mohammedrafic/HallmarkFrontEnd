import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { LayoutModule } from '@angular/cdk/layout';

import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { ChartModule, AccumulationChartAllModule } from '@syncfusion/ej2-angular-charts';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { AccumulationChartComponent } from './widgets/accumulation-chart/accumulation-chart.component';
import { LineChartComponent } from './widgets/line-chart/line-chart.component';
import { MapsChartModule } from './widgets/maps-chart/maps-chart.module';
import { WidgetWrapperModule } from './widgets/widget-wrapper/widget-wrapper.module';
import { DashboardControlModule } from './dashboard-control/dashboard-control.module';

@NgModule({
  declarations: [DashboardComponent, LineChartComponent, AccumulationChartComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    ChartModule,
    AccumulationChartAllModule,
    MapsChartModule,
    LayoutModule,
    DashboardControlModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    NgxsModule.forFeature([DashboardState]),
    ReactiveFormsModule,
    WidgetWrapperModule,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
