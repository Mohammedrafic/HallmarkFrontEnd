import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PositionsCountDayRangeComponent } from './positions-count-day-range.component';
import { WidgetWrapperModule } from '../widget-wrapper/widget-wrapper.module';
import { TooltipModule } from '@syncfusion/ej2-angular-popups';
import { FeatherModule } from 'angular-feather';
import { Info } from 'angular-feather/icons';


@NgModule({
  imports: [WidgetWrapperModule, CommonModule, TooltipModule, FeatherModule.pick({ Info })],
  exports: [PositionsCountDayRangeComponent],
  declarations: [PositionsCountDayRangeComponent],
})
export class PositionsCountDayRangeModule { }
