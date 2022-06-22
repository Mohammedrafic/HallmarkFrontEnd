import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

import type { LegendSettingsModel, LayerSettingsModel, MapsComponent } from '@syncfusion/ej2-angular-maps';

import { AbstractSFComponentDirective } from '@shared/directives/abstract-sf-component.directive';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapComponent extends AbstractSFComponentDirective<MapsComponent> {
  @Input() public layers: LayerSettingsModel[] | undefined;
  @Input() public legendSettings: LegendSettingsModel;
}
