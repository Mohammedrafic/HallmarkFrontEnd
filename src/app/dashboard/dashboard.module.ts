import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { MapsChartModule } from './widgets/maps-chart/maps-chart.module';
import { WidgetWrapperModule } from './widgets/widget-wrapper/widget-wrapper.module';
import { DashboardControlModule } from './dashboard-control/dashboard-control.module';
import { LineChartModule } from './widgets/line-chart/line-chart.module';
import { AccumulationChartModule } from './widgets/accumulation-chart/accumulation-chart.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    MapsChartModule,
    DashboardControlModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    NgxsModule.forFeature([DashboardState]),
    ReactiveFormsModule,
    WidgetWrapperModule,
    LineChartModule,
    AccumulationChartModule,
  ],
  providers: [DashboardService],
})
export class DashboardModule {}
