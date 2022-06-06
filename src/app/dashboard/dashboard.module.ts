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
  TooltipService
} from '@syncfusion/ej2-angular-charts';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { AccumulationChartComponent } from './widgets/accumulation-chart/accumulation-chart.component';
import { LineChartComponent } from './widgets/line-chart/line-chart.component';
import { MapsChartModule } from './widgets/maps-chart/maps-chart.module';
import { WidgetHeaderModule } from './widgets/widget-header/widget-header.module';

@NgModule({
  declarations: [DashboardComponent, LineChartComponent, AccumulationChartComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    ChartModule,
    AccumulationChartAllModule,
    MapsChartModule,
    WidgetHeaderModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    NgxsModule.forFeature([DashboardState]),
  ],
  providers: [DashboardService, CategoryService, SplineSeriesService, PieSeriesService, LegendService, TooltipService],
})
export class DashboardModule {}
