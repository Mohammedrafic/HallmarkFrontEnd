import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarDateSlotPipe } from './calendar-date-slot.pipe';
import { CalendarDateSlotExportPipe } from './export-calendar-date-slot.pipe';

@NgModule({
  declarations: [
    CalendarDateSlotPipe,
    CalendarDateSlotExportPipe
  ],
  imports: [
    CommonModule,
  ],
  exports: [CalendarDateSlotPipe, CalendarDateSlotExportPipe],
})
export class CalendarDateSlotModule { }
