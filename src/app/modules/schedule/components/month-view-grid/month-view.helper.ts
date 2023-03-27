import { DatesByWeekday } from '../../interface';

export const GetGroupedDatesByWeekday = (dates: string[], currentMonth: Date): DatesByWeekday[][] => {
  const weekdays = new Map<string, DatesByWeekday[]>();

  dates.forEach((dateStr: string) => {
    const date = new Date(dateStr);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
    const active = date.getMonth() === currentMonth.getMonth();
    const dateByWeekday = { dateSlot: dateStr, active };

    weekdays.set(weekday, [...(weekdays.get(weekday) ?? []), dateByWeekday]);
  });

  return Array.from(weekdays.values());
};
