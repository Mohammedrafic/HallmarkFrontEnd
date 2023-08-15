import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarDateSlotExportPipe } from './export-calendar-date-slot.pipe';

@NgModule({
  declarations: [
    CalendarDateSlotExportPipe
  ],
  imports: [
    CommonModule,
  ],
  exports: [CalendarDateSlotExportPipe],
})
export class ExportCalendarDateSlotModule { }
