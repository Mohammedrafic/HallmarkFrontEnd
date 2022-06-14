import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CandidatesByStateWidgetAggregatedDataModel } from '../../models/candidates-by-state-widget-aggregated-data.model';

@Component({
  selector: 'app-maps-chart',
  templateUrl: './maps-chart.component.html',
  styleUrls: ['./maps-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsChartComponent {
  @Input() public chartData: CandidatesByStateWidgetAggregatedDataModel;
}
