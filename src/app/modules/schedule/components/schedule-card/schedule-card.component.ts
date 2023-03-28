import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { IrpOrderType } from '@shared/enums/order-type';
import { ScheduleType } from '../../enums';
import { GetScheduleCardConfig } from '../../constants';
import { CardTitle } from '../../helpers';
import { ScheduleCardConfig, ScheduleDateItem, ScheduleItem } from '../../interface';
import { ScheduleCardTooltips } from './schedule-card.interface';
import { ScheduleCardService } from '../../services';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCardComponent implements OnInit {
  @Input() set scheduleDateItem(scheduleDateItem: ScheduleDateItem) {
    this.dateSchedule = scheduleDateItem;
    this.showWhiteFrame = scheduleDateItem.showWhiteFrame && !!scheduleDateItem.daySchedules.length
      && scheduleDateItem.daySchedules[0].scheduleType === ScheduleType.Book;
  }

  dateSchedule: ScheduleDateItem;

  showWhiteFrame = false;

  firstSchedule: ScheduleItem;

  ltaOrder: IrpOrderType = IrpOrderType.LongTermAssignment;

  cardConfig: ScheduleCardConfig | undefined;

  cardTitle: string;

  cardIconName: string;

  tooltips: ScheduleCardTooltips = {
    orderTooltip: '',
    additionalTooltip: '',
  };

  constructor(private scheduleCardService: ScheduleCardService) {}

  ngOnInit(): void {
    this.firstSchedule = this.dateSchedule.daySchedules[0];
    this.cardConfig = GetScheduleCardConfig(this.dateSchedule);
    this.cardTitle = this.prepareCardTitle(this.dateSchedule.daySchedules[0]);
    this.cardIconName = this.prepareCardIconName();
    this.createTooltips();
  }

  private prepareCardTitle(scheduleItem: ScheduleItem): string {
    return this.cardConfig?.title
      || scheduleItem.unavailabilityReason
      || CardTitle(scheduleItem);
  }

  private prepareCardIconName(): string {
    return this.cardConfig?.iconName || 'calendar';
  }

  private createTooltips(): void {
    this.tooltips = this.scheduleCardService.createAdditionalTooltip(this.dateSchedule.daySchedules);
  }
}
