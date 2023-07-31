import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarDateSlotPipe } from './calendar-date-slot.pipe';

@NgModule({
  declarations: [
    CalendarDateSlotPipe
  ],
  imports: [
    CommonModule,
  ],
  exports: [CalendarDateSlotPipe],
})
export class CalendarDateSlotModule { }
