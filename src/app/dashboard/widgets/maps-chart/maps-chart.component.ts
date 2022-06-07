import { Component, ChangeDetectionStrategy } from '@angular/core';
import type { LegendSettingsModel, LayerSettingsModel } from '@syncfusion/ej2-angular-maps';
import { USAMapDataLayerSettings } from './USA-map-data-layer-settings';
import { USAMapDataLegendSettings } from './USA-map-data-legend-settings';

@Component({
  selector: 'app-maps-chart',
  templateUrl: './maps-chart.component.html',
  styleUrls: ['./maps-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsChartComponent {
  public readonly legendSettings: LegendSettingsModel = USAMapDataLegendSettings;
  public readonly layers: LayerSettingsModel[] = USAMapDataLayerSettings;
}
