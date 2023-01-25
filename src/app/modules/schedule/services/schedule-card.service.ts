import { Injectable } from '@angular/core';

import { DateTimeHelper } from '@core/helpers';
import { ScheduleDateItem } from '../interface';

@Injectable()
export class ScheduleCardService {

  getOverlappingTooltipMessage(dateSchedule: ScheduleDateItem): string {
    return `<pre class="schedule-custom-tooltip-container">${
      dateSchedule.daySchedules.slice(1)
        .map(el => {
          const startTime = DateTimeHelper.formatDateUTC(el.startDate, 'HH:mm');
          const endTime = DateTimeHelper.formatDateUTC(el.endDate, 'HH:mm');

          return el.unavailabilityReason
            ? `${ startTime } - ${ endTime } ${el.unavailabilityReason}`
            : `${ startTime } - ${ endTime }`;
        })
        .join(`<br>`)
    }</pre>`;
  }
}
