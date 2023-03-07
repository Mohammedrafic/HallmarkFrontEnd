import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { ScheduleItem } from '../../interface';
import { ScheduleCardTooltips } from './schedule-card.interface';

@Injectable()
export class ScheduleCardService {
  createAdditionalTooltip(schedule: ScheduleItem[]): ScheduleCardTooltips {
    const firstSchedule = schedule[0];
    const itemsForTooltips = schedule.slice(1);
    let overlapTooltip = '';

    const baseTooltip = `OrderID-${ firstSchedule.orderMetadata?.orderPublicId } ${ firstSchedule.orderMetadata?.location }`
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
        let message = '';
        const startTime = DateTimeHelper.formatDateUTC(item.startDate, 'HH:mm');
        const endTime = DateTimeHelper.formatDateUTC(item.endDate, 'HH:mm');
  
        if (item.orderMetadata?.department === firstSchedule.orderMetadata?.department) {
          message = item.unavailabilityReason
          ? `${ startTime } - ${ endTime } ${item.unavailabilityReason}`
          : `${ startTime } - ${ endTime }`;
        } else {
          message = `OrderID-${ item.orderMetadata?.orderPublicId } ${ item.orderMetadata?.location }`
          + ` ${ item.orderMetadata?.department }, ${ startTime } - ${ endTime }`;
        }

        return message;
      });
  }
}
