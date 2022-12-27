import { Pipe, PipeTransform } from '@angular/core';

import { ScheduleItem } from '../../interface/schedule.model';

@Pipe({
  name: 'calendarDateSlot',
})
export class CalendarDateSlotPipe implements PipeTransform {
  transform(dateSlot: string, scheduleItems: ScheduleItem[]): ScheduleItem | undefined {
    return scheduleItems.find((el: ScheduleItem) =>
      CalendarDateSlotPipe.prepareScheduleDate(el.date) === new Date(dateSlot).toISOString()
    );
  }

  private static prepareScheduleDate(date: string): string {
    return new Date(date.split('T')[0]).toISOString();
  }
}
