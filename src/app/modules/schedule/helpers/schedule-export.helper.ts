import { Directive, Input, OnInit } from '@angular/core';

import { GetScheduleEventConfig, GetScheduleEventConfigforExport } from '../constants';
import {
  DayCardConfig,
  Schedules,
  ScheduleEventConfig,
  DaySchedules,
} from '../interface';
import { DatesRangeType } from '@shared/enums';

@Directive()
export abstract class ScheduleExportCard implements OnInit {
  @Input() isSelected = false;
  @Input() dateSchedule: Schedules;
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

  constructor() {}

  ngOnInit(): void {
    this.createCardConfigs();
  }

  private createCardConfigs(): void {
    if(this.activePeriod === this.dayPeriod) {
      this.dayCardConfig.source = this.prepareDayCardSource();

      return;
    }

    if (this.dateSchedule?.daySchedules.length === 1) {
      this.bigCardConfig = GetScheduleEventConfigforExport(this.dateSchedule, 0);

      return;
    }

    if (this.dateSchedule?.daySchedules.length > 1) {
      this.firstSmallCardConfig = GetScheduleEventConfigforExport(this.dateSchedule, 0);
      this.secondSmallCardConfig = GetScheduleEventConfigforExport(this.dateSchedule, 1);
    }

    if (this.dateSchedule?.daySchedules.length > 2) {
      this.thirdEventColor = GetScheduleEventConfigforExport(this.dateSchedule, 2).color;
    }
  }

  private prepareDayCardSource(): ScheduleEventConfig[] {
    return this.dateSchedule?.daySchedules.sort((first: DaySchedules, second: DaySchedules) => {
      return new Date(first.startDate).getTime() - new Date(second.startDate).getTime();
    }).map((day: DaySchedules, index: number) => {
      return GetScheduleEventConfigforExport(this.dateSchedule, index);
    });
  }

}
