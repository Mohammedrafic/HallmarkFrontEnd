import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { ScheduleType } from '../enums';
import { ScheduleItem } from '../interface';
import { CreateScheduleAttributes } from '../helpers';

@Injectable()
export class ScheduleCardService {
  createAllEventsTooltip(schedule: ScheduleItem[]): string {
    return `<pre class="schedule-custom-tooltip-container">${this.createTooltipItems(schedule).join('<br>')}</pre>`;
  }

  private createTooltipItems(items: ScheduleItem[]): string[] {
      return items.map((item) => {
        const isUnavailability = item.scheduleType === ScheduleType.Unavailability;
        const isAvailability = item.scheduleType === ScheduleType.Availability;
        const isBooking = item.scheduleType === ScheduleType.Book;
        const orderIDText = item.orderMetadata?.orderPublicId;
        const startTime = DateTimeHelper.formatDateUTC(item.startDate, 'HH:mm');
        const endTime = DateTimeHelper.formatDateUTC(item.endDate, 'HH:mm');

        if (isBooking && orderIDText) {
          return `${ startTime } - ${ endTime } | ${orderIDText}`
            + ` | ${ item.orderMetadata?.location } - ${ item.orderMetadata?.department }`
            + ` | ${CreateScheduleAttributes(item.attributes, true)}`;
        }

        if (isBooking) {
          return `${ startTime } - ${ endTime } | ${ item.orderMetadata?.location } - ${ item.orderMetadata?.department }`
            + ` | ${CreateScheduleAttributes(item.attributes, true)}`;
        }

        if (isAvailability) {
          return `${ startTime } - ${ endTime } | Available`;
        }

        if (isUnavailability) {
          return `${ startTime } - ${ endTime } | Unavailable | ${item.unavailabilityReason}`;
        }

        return '';
      });
  }
}
