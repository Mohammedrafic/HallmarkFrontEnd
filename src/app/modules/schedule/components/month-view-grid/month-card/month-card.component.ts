import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';

import {  ScheduleDateItem, ScheduleItem, ScheduleMonthCardConfig } from '../../../interface';
import { ScheduleCardTooltips } from '../../schedule-card/schedule-card.interface';
import { ScheduleCardService } from '../../../services';
import { CardTitle } from '../../../helpers';
import { CardTooltip, GetMonthCardConfig } from './month-card.constant';
import { ScheduleType } from '../../../enums';
import { IrpOrderType } from '@shared/enums/order-type';

@Component({
  selector: 'app-month-card',
  templateUrl: './month-card.component.html',
  styleUrls: ['./month-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthCardComponent implements OnInit {
  @Input() dateSchedule: ScheduleDateItem;
  @Input() isDateActive: boolean;
  @Input() currentDate: string;

  public readonly scheduleBookType: ScheduleType = ScheduleType.Book;

  public firstSchedule: ScheduleItem;
  public orderType: IrpOrderType = IrpOrderType.LongTermAssignment;
  public cardTitle: string;
  public cardConfig: ScheduleMonthCardConfig | undefined;
  public tooltips: ScheduleCardTooltips = CardTooltip;

  constructor(private scheduleCardService: ScheduleCardService) { }

  ngOnInit(): void {
    this.firstSchedule = this.dateSchedule.daySchedules[0];
    this.cardConfig = GetMonthCardConfig(this.dateSchedule);
    this.cardTitle = this.prepareCardTitle(this.dateSchedule.daySchedules[0]);
    this.createTooltips();
  }

  private createTooltips(): void {
    this.tooltips = this.scheduleCardService.createAdditionalTooltip(this.dateSchedule.daySchedules);
  }

  private prepareCardTitle(scheduleItem: ScheduleItem): string {
    return this.cardConfig?.title
      || scheduleItem.unavailabilityReason
      || CardTitle(scheduleItem);
  }
}
