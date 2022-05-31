import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';
import { ChartModule, CategoryService, SplineSeriesService } from '@syncfusion/ej2-angular-charts';
import { NgxsModule } from '@ngxs/store';

import { DashboardState } from './store/dashboard.state';
import { DashboardService } from './services/dashboard.service';
import { DashboardComponent } from './dashboard.components';
import { CandidateWidgetComponent } from './widgets/candidate-widget/candidate-widget.component';
import { InvoiceWidgetComponent } from './widgets/invoice-widget/invoice-widget.component';
import { SimpleChartWidgetComponent } from './widgets/simple-chart-widget/simple-chart-widget.component';

@NgModule({
  declarations: [DashboardComponent, CandidateWidgetComponent, InvoiceWidgetComponent, SimpleChartWidgetComponent],
  imports: [
    CommonModule,
    DashboardLayoutModule,
    ChartModule,
    RouterModule.forChild([{ path: '', component: DashboardComponent }]),
    NgxsModule.forFeature([DashboardState]),
  ],
  providers: [DashboardService, CategoryService, SplineSeriesService],
})
export class DashboardModule {}
