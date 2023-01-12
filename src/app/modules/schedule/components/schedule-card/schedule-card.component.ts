import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCardConfig, ScheduleDateItem, ScheduleItem } from '../../interface/schedule.interface';
import { GetScheduleCardConfig } from '../../constants/schedule-grid.constant';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCardComponent implements OnInit {
  @Input() dateSchedule: ScheduleDateItem;

  firstDaySchedule: ScheduleItem;

  cardConfig: ScheduleCardConfig | undefined;

  cardTitle: string;

  cardIconName: string;

  tooltipMessage: string;

  additionalTooltipMessage: string;

  ngOnInit(): void {
    this.firstDaySchedule = this.dateSchedule.daySchedules[0];
    this.cardConfig = GetScheduleCardConfig(this.dateSchedule);
    this.cardTitle = this.prepareCardTitle(this.dateSchedule.daySchedules[0]);
    this.cardIconName = this.prepareCardIconName();

    this.createTooltips();
  }

  private prepareCardTitle(scheduleItem: ScheduleItem): string {
    return this.cardConfig?.title || `${scheduleItem.location.slice(0, 3)}-${scheduleItem.department.slice(0, 3)}`;
  }

  private prepareCardIconName(): string {
    return this.cardConfig?.iconName || (this.dateSchedule.isInDifferentDepartments ? 'briefcase' : 'calendar');
  }

  private createTooltips(): void {
    this.tooltipMessage =
      `OrderID-${this.firstDaySchedule.orderId} ${this.firstDaySchedule.location} ${this.firstDaySchedule.department}`;

    this.additionalTooltipMessage =
      `<pre class="schedule-custom-tooltip-container">${
        this.dateSchedule.daySchedules.slice(1).map(el => `OrderID-${ el.orderId } ${ el.location } ${ el.department }`)
          .join(`<br>`)
      }</pre>`;
  }
}
