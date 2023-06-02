import { DateTimeHelper } from '@core/helpers';

import { DatesByWeekday } from '../../interface';


export const GetGroupedDatesByWeekday = (dates: string[], currentMonth: Date): DatesByWeekday[][] => {
  const weekdays = new Map<string, DatesByWeekday[]>();

  dates.forEach((dateStr: string) => {
    const date = DateTimeHelper.convertDateToUtc(dateStr);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const active = date.getMonth() === currentMonth.getMonth();
    const dateByWeekday = { dateSlot: dateStr, active };

    weekdays.set(weekday, [...(weekdays.get(weekday) ?? []), dateByWeekday]);
  });

  return Array.from(weekdays.values());
};
