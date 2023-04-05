import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { AbstractScheduleCardComponent } from '../../abstract-schedule-card.component';

@Component({
  selector: 'app-month-card',
  templateUrl: './month-card.component.html',
  styleUrls: ['./month-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthCardComponent extends AbstractScheduleCardComponent {
  @Input() isDateActive: boolean;
  @Input() currentDate: string;
}
