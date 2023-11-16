import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '@shared/shared.module';

import { TimesheetHistoricalEventsComponent } from './timesheet-historical-events.component';

@NgModule({
  declarations: [
    TimesheetHistoricalEventsComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    TimesheetHistoricalEventsComponent,
  ],
})
export class TimesheetHistoricalEventsModule { }
