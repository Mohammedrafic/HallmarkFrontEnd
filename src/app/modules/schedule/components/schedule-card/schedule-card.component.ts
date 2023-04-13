import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ScheduleCard } from '../../helpers/schedule-card.helper';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCardComponent extends ScheduleCard {}
