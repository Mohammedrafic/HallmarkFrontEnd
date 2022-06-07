import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import type { LegendSettingsModel, LayerSettingsModel } from '@syncfusion/ej2-angular-maps';
import { USAMapDataLegendSettings } from './USA-map-data-legend-settings';

@Component({
  selector: 'app-maps-chart',
  templateUrl: './maps-chart.component.html',
  styleUrls: ['./maps-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsChartComponent {
  @Input() public chartData: LayerSettingsModel[];

  public readonly legendSettings: LegendSettingsModel = USAMapDataLegendSettings;
}
