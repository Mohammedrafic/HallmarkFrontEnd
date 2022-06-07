import { NgModule } from '@angular/core';

import { MapsChartComponent } from './maps-chart.component';
import { MapModule } from '@shared/components/map/map.module';
import { WidgetHeaderModule } from '../widget-header/widget-header.module';

@NgModule({
  imports: [MapModule, WidgetHeaderModule],
  exports: [MapsChartComponent],
  declarations: [MapsChartComponent],
})
export class MapsChartModule {}
