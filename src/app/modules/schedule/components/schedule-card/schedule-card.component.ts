import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';
import { GetScheduleCardConfig } from '../../constants';
import { CardTitle } from '../../helpers';
import { ScheduleCardConfig, ScheduleDateItem, ScheduleItem } from '../../interface';
import { ScheduleCardTooltips } from './schedule-card.interface';
import { ScheduleCardService } from './schedule-card.service';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScheduleCardComponent implements OnInit {
  @Input() dateSchedule: ScheduleDateItem;

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
