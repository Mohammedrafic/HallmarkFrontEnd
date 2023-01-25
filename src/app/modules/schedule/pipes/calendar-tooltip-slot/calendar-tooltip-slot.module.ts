import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarTooltipSlotPipe } from './calendar-tooltip-slot.pipe';

@NgModule({
  declarations: [
    CalendarTooltipSlotPipe,
  ],
  imports: [
    CommonModule,
  ],
  exports: [CalendarTooltipSlotPipe],
})
export class CalendarTooltipSlotModule { }
