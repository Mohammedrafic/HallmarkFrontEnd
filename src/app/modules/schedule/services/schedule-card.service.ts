import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { ScheduleType } from '../enums';
import { ScheduleItem } from '../interface';
import { ScheduleCardTooltips } from '../components/schedule-card/schedule-card.interface';

@Injectable()
export class ScheduleCardService {
  createAdditionalTooltip(schedule: ScheduleItem[]): ScheduleCardTooltips {
    const firstSchedule = schedule[0];
    const itemsForTooltips = schedule.slice(1);
    const orderIDText = firstSchedule.orderMetadata?.orderPublicId;
    let overlapTooltip = '';
    let orderText: string;

    if (orderIDText) {
      orderText = `OrderID-${orderIDText}`;
    } else {
      orderText = `ShiftID-${firstSchedule.id}`;
    }

    const baseTooltip = `${orderText} ${ firstSchedule.orderMetadata?.location }`
    + ` ${ firstSchedule.orderMetadata?.department }`;

    if (itemsForTooltips.length) {
      const tooltips = this.createTooltipItems(itemsForTooltips, firstSchedule);
      overlapTooltip = `<pre class="schedule-custom-tooltip-container">${tooltips.join('<br>')}</pre>`;
    }

    return ({
      orderTooltip: baseTooltip,
      additionalTooltip: overlapTooltip,
    });
  }

  private createTooltipItems(items: ScheduleItem[], firstSchedule: ScheduleItem): string[] {
      return items.map((item) => {
        const isUnavailability = item.scheduleType === ScheduleType.Unavailability;
        const isAvailability = item.scheduleType === ScheduleType.Availability;
        const orderIDText = item.orderMetadata?.orderPublicId;
        let message = '';
        let orderText: string;

        if (orderIDText) {
          orderText = `OrderID-${orderIDText}`;
        } else {
          orderText = `ShiftID-${firstSchedule.id}`;
        }

        const startTime = DateTimeHelper.formatDateUTC(item.startDate, 'HH:mm');
        const endTime = DateTimeHelper.formatDateUTC(item.endDate, 'HH:mm');

        if (item.orderMetadata?.department === firstSchedule.orderMetadata?.department && !isUnavailability) {
          message = `${ startTime } - ${ endTime }`;
        } else if (isUnavailability) {
          message = `${ startTime } - ${ endTime } ${item.unavailabilityReason}`;
        } else if (isAvailability) {
          message = `Availability ${ startTime } - ${ endTime }`;
        } else {
          message = `${orderText} ${ item.orderMetadata?.location }`
          + ` ${ item.orderMetadata?.department }, ${ startTime } - ${ endTime }`;
        }

        return message;
      });
  }
}
