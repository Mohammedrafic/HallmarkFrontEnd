import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MapsChartComponent } from './maps-chart.component';
import { MapModule } from '@shared/components/map/map.module';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';

@NgModule({
  imports: [MapModule, WidgetWrapperModule, CommonModule, TooltipModule, FeatherModule.pick({ Info })],
  exports: [MapsChartComponent],
  declarations: [MapsChartComponent],
})
export class MapsChartModule {}
