import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { TimesheetHistoricalEvent } from '../../interface';

@Component({
  selector: 'app-timesheet-historical-events',
  templateUrl: './timesheet-historical-events.component.html',
  styleUrls: ['./timesheet-historical-events.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetHistoricalEventsComponent{
  @Input() historicalEvents: TimesheetHistoricalEvent[] = [];
}
