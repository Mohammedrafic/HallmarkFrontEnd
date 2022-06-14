import { NgModule } from '@angular/core';

import { MapsChartComponent } from './maps-chart.component';
import { MapModule } from '@shared/components/map/map.module';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [MapModule, WidgetWrapperModule, CommonModule],
  exports: [MapsChartComponent],
  declarations: [MapsChartComponent],
})
export class MapsChartModule {}
