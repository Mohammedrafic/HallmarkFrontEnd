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
import { MapsAllModule, MapsTooltipService } from '@syncfusion/ej2-angular-maps';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { AccumulationChartComponent } from './widgets/accumulation-chart/accumulation-chart.component';
import { WidgetHeaderComponent } from './widgets/widget-header/widget-header.component';
import { LineChartComponent } from './widgets/line-chart/line-chart.component';
import { MapsChartComponent } from './widgets/maps-chart/maps-chart.component';
@NgModule({
  declarations: [DashboardComponent, LineChartComponent, AccumulationChartComponent, MapsChartComponent, WidgetHeaderComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    ChartModule,
    AccumulationChartAllModule,
    MapsAllModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    NgxsModule.forFeature([DashboardState]),
  ],
  providers: [DashboardService, CategoryService, SplineSeriesService, PieSeriesService, LegendService, MapsTooltipService],
})
export class DashboardModule {}
