import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { ScheduleCardConfig, ScheduleItem } from '../../interface/schedule.model';
import { GetScheduleCardConfig } from '../../constants/schedule-grid.conts';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCardComponent implements OnInit {
  @Input() schedule: ScheduleItem;

  cardConfig: ScheduleCardConfig | undefined;
  tooltipMessage: string;

  ngOnInit(): void {
    this.cardConfig = GetScheduleCardConfig(this.schedule);
    this.tooltipMessage = `OrderID${this.schedule.orderId} ${this.schedule.location} ${this.schedule.department}`;
  }
}
