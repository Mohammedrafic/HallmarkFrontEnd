import { Directive, Input, OnInit } from '@angular/core';

import { GetScheduleEventConfig } from '../constants';
import { ScheduleDateItem, ScheduleEventConfig } from '../interface';
import { ScheduleCardService } from '../services';

@Directive()
export abstract class ScheduleCard implements OnInit {
  @Input() isSelected = false;
  @Input() dateSchedule: ScheduleDateItem;

  bigCardConfig: ScheduleEventConfig;
  firstSmallCardConfig: ScheduleEventConfig;
  secondSmallCardConfig: ScheduleEventConfig;
  thirdEventColor: string;
  allEventsTooltip = '';

  constructor(private scheduleCardService: ScheduleCardService) {}

  ngOnInit(): void {
    this.createCardConfigs();
    this.createTooltips();
  }

  private createCardConfigs(): void {
    if (this.dateSchedule.daySchedules.length === 1) {
      this.bigCardConfig = GetScheduleEventConfig(this.dateSchedule, 0);

      return;
    }

    if (this.dateSchedule.daySchedules.length > 1) {
      this.firstSmallCardConfig = GetScheduleEventConfig(this.dateSchedule, 0);
      this.secondSmallCardConfig = GetScheduleEventConfig(this.dateSchedule, 1);
    }

    if (this.dateSchedule.daySchedules.length > 2) {
      this.thirdEventColor = GetScheduleEventConfig(this.dateSchedule, 2).color;
    }
  }

  private createTooltips(): void {
    this.allEventsTooltip = this.scheduleCardService.createAllEventsTooltip(this.dateSchedule.daySchedules);
  }
}
