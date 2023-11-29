import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LocalDateTimePipeModule } from '@shared/pipes/local-date-time/bool-values-pipe.module';

import { TimesheetHistoricalEventsComponent } from './timesheet-historical-events.component';

@NgModule({
  declarations: [
    TimesheetHistoricalEventsComponent,
  ],
  imports: [
    CommonModule,
    LocalDateTimePipeModule,
  ],
  exports: [
    TimesheetHistoricalEventsComponent,
  ],
})
export class TimesheetHistoricalEventsModule { }
