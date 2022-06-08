import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { LegendDataModel } from './models/legend-data.model';
import { CandidatesByStateWidgetAggregatedDataModel } from '../../models/candidates-by-state-widget-aggregated-data.model';

@Component({
  selector: 'app-maps-chart',
  templateUrl: './maps-chart.component.html',
  styleUrls: ['../widget-legend.component.scss', './maps-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsChartComponent {
  @Input() public chartData: CandidatesByStateWidgetAggregatedDataModel;

  public trackByHandler(_: number, legendDataItem: LegendDataModel): string {
    return legendDataItem.label;
  }
}
