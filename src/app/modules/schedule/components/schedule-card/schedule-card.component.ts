import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCardConfig, ScheduleDateItem, ScheduleItem } from '../../interface/schedule.model';
import { GetScheduleCardConfig } from '../../constants/schedule-grid.conts';

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

  tooltipMessage: string;

  additionalTooltipMessage: string;

  ngOnInit(): void {
    this.cardConfig = GetScheduleCardConfig(this.dateSchedule);

    this.createTooltips();
  }

  private createTooltips(): void {
    this.firstDaySchedule = this.dateSchedule.daySchedules[0];

    this.tooltipMessage =
      `OrderID${this.firstDaySchedule.orderId} ${this.firstDaySchedule.location} ${this.firstDaySchedule.department}`;
    this.additionalTooltipMessage =
      `<pre class="schedule-custom-tooltip-container">${
      this.dateSchedule.daySchedules.slice(1).map(el => `OrderID${ el.orderId } ${ el.location } ${ el.department }`)
        .join(`<br>`)
    }</pre>`;
  }
}
