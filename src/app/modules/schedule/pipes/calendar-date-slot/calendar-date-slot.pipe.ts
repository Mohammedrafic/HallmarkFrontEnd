import { Pipe, PipeTransform } from '@angular/core';

import { ScheduleDateItem } from '../../interface/schedule.interface';

@Pipe({
  name: 'calendarDateSlot',
})
export class CalendarDateSlotPipe implements PipeTransform {
  transform(dateSlot: string, scheduleItems: ScheduleDateItem[]): ScheduleDateItem | undefined {
    return scheduleItems.find((el: ScheduleDateItem) =>
      CalendarDateSlotPipe.prepareScheduleDate(el.date) === new Date(dateSlot).toISOString()
    );
  }

  private static prepareScheduleDate(date: string): string {
    return new Date(date.split('T')[0]).toISOString();
  }
}
