import { Directive, Input, OnInit } from '@angular/core';

import { GetScheduleEventConfig } from '../constants';
import {
  DayCardConfig,
  ScheduleDateItem,
  ScheduleEventConfig,
  ScheduleItem,
} from '../interface';
import { ScheduleCardService } from '../services';
import { DatesRangeType } from '@shared/enums';

@Directive()
export abstract class ScheduleCard implements OnInit {
  @Input() isSelected = false;
  @Input() dateSchedule: ScheduleDateItem;
  @Input() activePeriod: string;

  bigCardConfig: ScheduleEventConfig;
  dayCardConfig: DayCardConfig = {
    source: [],
    tooltips: [],
  };
  firstSmallCardConfig: ScheduleEventConfig;
  secondSmallCardConfig: ScheduleEventConfig;
  thirdEventColor: string;
  allEventsTooltip = '';
  dayPeriod: string = DatesRangeType.Day;

  constructor(private scheduleCardService: ScheduleCardService) {}

  ngOnInit(): void {
    this.createCardConfigs();
    this.createTooltips();
  }

  private createCardConfigs(): void {
    if(this.activePeriod === this.dayPeriod) {
      this.dayCardConfig.source = this.prepareDayCardSource();

      return;
    }

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
    if(this.activePeriod === this.dayPeriod && this.dateSchedule.daySchedules) {
      this.dayCardConfig.tooltips = this.dateSchedule.daySchedules.map((day: ScheduleItem) => {
        return this.scheduleCardService.createAllEventsTooltip([day]);
      });

      return;
    }

    this.allEventsTooltip = this.scheduleCardService.createAllEventsTooltip(this.dateSchedule.daySchedules);
  }

  private prepareDayCardSource(): ScheduleEventConfig[] {
    return this.dateSchedule.daySchedules.sort((first: ScheduleItem, second: ScheduleItem) => {
      return new Date(first.startDate).getTime() - new Date(second.startDate).getTime();
    }).map((day: ScheduleItem, index: number) => {
      return GetScheduleEventConfig(this.dateSchedule, index);
    });
  }
}
