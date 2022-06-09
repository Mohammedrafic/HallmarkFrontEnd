import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import {
  ChartModule,
  CategoryService,
  SplineSeriesService,
  AccumulationChartAllModule,
  PieSeriesService,
  LegendService,
} from '@syncfusion/ej2-angular-charts';
import { NgxsModule } from '@ngxs/store';
import { LayoutModule } from '@angular/cdk/layout';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { AccumulationChartComponent } from './widgets/accumulation-chart/accumulation-chart.component';
import { LineChartComponent } from './widgets/line-chart/line-chart.component';
import { MapsChartModule } from './widgets/maps-chart/maps-chart.module';
import { ReactiveFormsModule } from '@angular/forms';
import { WidgetWrapperModule } from './widgets/widget-wrapper/widget-wrapper.module';
import { DashboardControlModule } from './dashboard-controller/dashboard-controller.module';
import { WidgetService } from './services/widget.service';

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
  providers: [
    DashboardService,
    WidgetService,
    CategoryService,
    SplineSeriesService,
    PieSeriesService,
    LegendService,
  ],
})
export class DashboardModule {}
