import { Pipe, PipeTransform } from '@angular/core';

import { Schedules } from '../../interface';

@Pipe({
  name: 'calendarDateSlotExport',
})
export class CalendarDateSlotExportPipe implements PipeTransform {
  transform(dateSlot: string, scheduleItems: Schedules[]): Schedules | undefined {
    return scheduleItems.find((el: Schedules) =>
      CalendarDateSlotExportPipe.prepareScheduleDate(el.date) === new Date(dateSlot).toISOString()
    );
  }

  private static prepareScheduleDate(date: string): string {
    return new Date(date.split('T')[0]).toISOString();
  }
}
