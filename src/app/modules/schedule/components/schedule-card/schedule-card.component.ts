import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractScheduleCardComponent } from '../abstract-schedule-card.component';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCardComponent extends AbstractScheduleCardComponent {}
