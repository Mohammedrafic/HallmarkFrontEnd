import { DashboardLayoutModule } from '@syncfusion/ej2-angular-layouts';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { AccumulationChartModule } from '../widgets/accumulation-chart/accumulation-chart.module';
import { DashboardWidgetsComponent } from './dashboard-widgets.component';
import { MapsChartModule } from '../widgets/maps-chart/maps-chart.module';
import { WidgetWrapperModule } from '../widgets/widget-wrapper/widget-wrapper.module';
import { LineChartModule } from '../widgets/line-chart/line-chart.module';
import { PositionChartModule } from '../widgets/position-chart/position-chart.module';
import { TrendChartModule } from '../widgets/trend-chart/trend-chart.module';
import { OrgWidgetModule } from '../widgets/org-widget/org-widget.module';
import { AgencypositionWidgetModule } from '../widgets/agencyposition-widget/agencyposition-widget.module';
import { UserState } from '../../store/user.state';
import { CandidateChartModule } from '../widgets/candidate-chart/candidate-chart.module';
import { RnUtilizationWidgetModule } from '../widgets/rn-utilization-widget/rn-utilization-widget.module';
import { AlreadyExpiredCredsModule } from '../widgets/already-expired-creds/already-expired-creds.module';
import { UpcomingExpCredsModule } from '../widgets/upcoming-exp-creds/upcoming-exp-creds.module';
import { AvailableEmployeeModule } from '../widgets/available-employee/available-employee.module'
import { PositionsCountDayRangeModule } from '../widgets/positions-count-day-range/positions-count-day-range.module';
import { OrdersPendingCustomStatusModule } from '../widgets/orders-pending-custom-status/orders-pending-custom-status.module';

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
    TrendChartModule,
    CandidateChartModule,
    OrgWidgetModule,
    AgencypositionWidgetModule,
    RnUtilizationWidgetModule,
    AlreadyExpiredCredsModule,
    UpcomingExpCredsModule,
    AvailableEmployeeModule,
    PositionsCountDayRangeModule,
    OrdersPendingCustomStatusModule,
    NgxsModule.forFeature([ UserState]),
  ],
})
export class DashboardWidgetsModule { }
