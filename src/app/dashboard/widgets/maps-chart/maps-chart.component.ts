import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { CandidatesByStateWidgetAggregatedDataModel } from '../../models/candidates-by-state-widget-aggregated-data.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-maps-chart',
  templateUrl: './maps-chart.component.html',
  styleUrls: ['./maps-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsChartComponent {
  @Input() public chartData: CandidatesByStateWidgetAggregatedDataModel | undefined;
  @Input() public isLoading: boolean;
  @Input() public isDarkTheme: boolean | false;
  @Input() public description: string;
  @Input() public userType:number;
  constructor(private readonly dashboardService: DashboardService) {}

  public redirectToSourceContent(): void {
    this.dashboardService.redirectToUrl('client/order-management');
  }
}
