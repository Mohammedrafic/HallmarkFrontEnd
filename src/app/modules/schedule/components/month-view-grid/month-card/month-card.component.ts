import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { ScheduleCard } from '../../../helpers/schedule-card.helper';

@Component({
  selector: 'app-month-card',
  templateUrl: './month-card.component.html',
  styleUrls: ['./month-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthCardComponent extends ScheduleCard {
  @Input() isDateActive: boolean;
  @Input() currentDate: string;
}
