import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapsChartComponent } from './maps-chart.component';
import { MapModule } from '@shared/components/map/map.module';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';

@NgModule({
  imports: [MapModule, WidgetWrapperModule, CommonModule],
  exports: [MapsChartComponent],
  declarations: [MapsChartComponent],
})
export class MapsChartModule {}
