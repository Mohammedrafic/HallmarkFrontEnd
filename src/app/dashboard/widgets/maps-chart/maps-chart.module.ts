import { NgModule } from '@angular/core';

import { MapsChartComponent } from './maps-chart.component';
import { MapModule } from '@shared/components/map/map.module';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';

@NgModule({
  imports: [MapModule, WidgetWrapperModule],
  exports: [MapsChartComponent],
  declarations: [MapsChartComponent],
})
export class MapsChartModule {}
