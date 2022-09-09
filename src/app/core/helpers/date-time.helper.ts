import { formatDate } from '@angular/common';

export class DateTimeHelper {
  public static getLastDayOfWeekFromFirstDay(startDate: string, days: number): Date {
    const start = new Date(startDate);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const utcDate = new Date(start.getTime() + offset);

    const initDate = new Date(utcDate.setUTCDate(utcDate.getDate() - utcDate.getDay() + days));
    const dayToSet = initDate > new Date() ? new Date() : initDate;

    const lastDay = dayToSet.setUTCHours(23, 59, 59, 999) + offset;

    return new Date(lastDay);
  }

  public static getFirstDayOfWeekUtc(date: string): Date {
    const start = new Date(date);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const day = new Date(start.setUTCDate(start.getDate()))
      .setUTCHours(0, 0, 0, 0) + offset;

    return new Date(day);
  }

  public static convertDateToUtc(date: string): Date {
    const init = new Date(date);
    const offset = init.getTimezoneOffset() * 60 * 1000;
    const day = new Date(init.setUTCDate(init.getUTCDate()) + offset);

    return day;
  }

  public static toUtcFormat(date: string | Date): string {
    if (typeof date === 'string') {
      const gmt = new Date(this.convertDateToUtc(date));
      return new Date(Date.UTC(gmt.getFullYear(),
      gmt.getMonth(), gmt.getDate(), gmt.getHours(), gmt.getMinutes())).toISOString();
    }

    return new Date(Date.UTC(date.getFullYear(),
    date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())).toISOString();
  }

  public static setInitHours(data: string): string {
    const date = new Date(this.convertDateToUtc(data));
    date.setHours(0, 0, 0);
    
    return this.toUtcFormat(date);
  }

  public static geFirstDayofWeek(date: Date): Date {
    return new Date(date.setDate(date.getDate() - date.getDay()));
  }

  public static getLastDayOfWeek(date: Date): Date {
    const today = new Date(new Date().setHours(12, 0, 0, 0));
    const endWeek = new Date(date.setDate(date.getDate() - date.getDay() + 6));
    if (endWeek.getTime() > today.getTime()) {
      return today;
    }
    return endWeek;
  }

  public static isDateBetween(date: Date | undefined, fromDate: Date, toDate: Date): boolean {
    return (date?.getTime() || 0) <= toDate.getTime() && (date?.getTime() || 0) >= fromDate.getTime();
  }

  public static isDateBefore(date: Date, toDate: Date): boolean {
    return date.getTime() <= toDate.getTime();
  }

  public static getWeekDate(date: string | Date, isStart = false): Date {
    const curr = new Date(date);
    const firstDay = curr.getTime() - curr.getDay() * 24 * 60 * 60 * 1000;
    const lastDay = firstDay + 6 * 24 * 60 * 60 * 1000;
    let last = new Date(lastDay).getTime();
    let first = firstDay;

    if (lastDay > new Date().getTime()) {
      last = new Date().getTime();
      first = last - new Date(last).getDay() * 24 * 60 * 60 * 1000;
    }

    return new Date(isStart ? first : last);
  }

  public static getWeekStartEnd(date: string): [Date, Date] {
    const splitValue = date.split(' - ');
    const from = new Date(splitValue[0]);
    const to = new Date(splitValue[1]);

    return [from, to];
  }

  public static getRange(date: string | Date): string {
    let startWeekDay, endWeekDay;
    startWeekDay = formatDate(DateTimeHelper.getWeekDate(date, true), 'MM/dd/YYYY', 'en-US');
    endWeekDay = formatDate(DateTimeHelper.getWeekDate(date), 'MM/dd/YYYY', 'en-US');

    return `${startWeekDay} - ${endWeekDay}`;
  }

  public static formatDateUTC(date: string, format: string): string {
    return formatDate(date, format, 'en-US', 'UTC');
  }
}
