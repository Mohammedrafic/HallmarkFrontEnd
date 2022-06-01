import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { ChartModule, CategoryService, SplineSeriesService, AccumulationChartAllModule, PieSeriesService, AccumulationLegendService, AccumulationTooltipService, AccumulationDataLabelService, AccumulationAnnotationService } from '@syncfusion/ej2-angular-charts';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { AccumulationChartComponent } from './widgets/accumulation-chart/accumulation-chart.component';
import { ChartLineWidgetComponent } from './widgets/chart-line-widget/chart-line-widget.component';

@NgModule({
  declarations: [DashboardComponent, ChartLineWidgetComponent, AccumulationChartComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    ChartModule,
    AccumulationChartAllModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    NgxsModule.forFeature([DashboardState]),
  ],
  providers: [DashboardService, CategoryService, SplineSeriesService, PieSeriesService, AccumulationLegendService, AccumulationTooltipService, AccumulationDataLabelService,
    AccumulationAnnotationService],
})
export class DashboardModule {}
