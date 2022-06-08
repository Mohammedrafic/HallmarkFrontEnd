import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './map.component';
import { MapsModule, MapsTooltipService, LegendService } from '@syncfusion/ej2-angular-maps';

@NgModule({
  declarations: [MapComponent],
  exports: [MapComponent],
  imports: [CommonModule, MapsModule],
  providers: [MapsTooltipService, LegendService],
})
export class MapModule {}
