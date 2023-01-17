import { formatDate } from '@angular/common';

import { RangeDaysOptions } from '@shared/components/date-week-picker/date-week.constant';
import { DatesRangeType } from '@shared/enums';
import { CalcDaysMs } from './functions.helper';

/**
 * TODO: need to refactor, cleanup, change naming, params etc.
 */
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
    const day = new Date(start.setUTCDate(start.getDate())).setUTCHours(0, 0, 0, 0) + offset;

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
      return new Date(
        Date.UTC(gmt.getFullYear(), gmt.getMonth(), gmt.getDate(), gmt.getHours(), gmt.getMinutes())
      ).toISOString();
    }

    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())
    ).toISOString();
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

  public static newDateInTimeZone(timeZone: string): Date {
    return new Date(new Date().toLocaleString('en-US', { timeZone: timeZone }));
  }

  public static getWeekDate(date: string | Date, isStart = false,
    rangeOption: DatesRangeType, firstWeekDay: number | null = null, maxDateExist = true): Date {
    const curr = new Date(date);
    const startDayNum = firstWeekDay !== null && firstWeekDay !== undefined ? firstWeekDay : curr.getDay();
    const currDayNum = curr.getDay();
    let firstDay = curr.getTime() - CalcDaysMs(curr.getDay());
    let dayDiff: number;

    if (firstWeekDay) {
      firstDay = new Date(curr.getDate() - firstWeekDay).getTime();
    }

    if (currDayNum >= startDayNum) {
      dayDiff = currDayNum - startDayNum;
    } else {
      dayDiff = 7 - startDayNum + currDayNum;
    }

    firstDay = curr.getTime() - CalcDaysMs(dayDiff);

    if (rangeOption === DatesRangeType.Day) {
      firstDay = curr.getTime();
    }

    const lastDay = firstDay + CalcDaysMs((RangeDaysOptions[rangeOption] - 1));

    let last = new Date(lastDay).getTime();
    let first = firstDay;

    if (maxDateExist && lastDay > new Date().getTime() && rangeOption !== DatesRangeType.Day) {
      last = new Date().getTime();
      first = last - CalcDaysMs(new Date(last).getDay());
    }

    return new Date(isStart ? first : last);
  }

  public static getDynamicWeekDate(
    date: string | Date, isStart = false, weekStartDay: Date, rangeOption: DatesRangeType,
    firstWeekDay: number | null = null, maxDateExist = true): Date {
    const curr = new Date(date);
    const startDayNum = firstWeekDay !== null && firstWeekDay !== undefined ? firstWeekDay : weekStartDay.getDay();
    const currDayNum = curr.getDay();
    let dayDiff: number;

    if (rangeOption === DatesRangeType.Day) {
      return new Date(curr.getTime());
    }

    if (currDayNum >= startDayNum) {
      dayDiff = currDayNum - startDayNum;
    } else {
      dayDiff = 7 - startDayNum + currDayNum;
    }

    const firstDay = curr.getTime() - CalcDaysMs(dayDiff);
    const lastDay = firstDay + CalcDaysMs(RangeDaysOptions[rangeOption] - 1);

    let last = new Date(lastDay).getTime();
    let first = firstDay;

    if (lastDay > new Date().getTime() && maxDateExist) {
      last = new Date().getTime();
      first = last - CalcDaysMs(new Date(last).getDay());
    }

    return new Date(isStart ? first : last);
  }

  public static getWeekStartEnd(date: string): [Date, Date] {
    const splitValue = date.split(' - ');
    const from = new Date(splitValue[0]);
    const to = new Date(splitValue[1]);

    return [from, to];
  }

  public static getRange(date: string | Date, startDate: Date,
    rangeOption = DatesRangeType.OneWeek, firstWeekDay: number | null = null, maxDateExist: boolean): string {
    const startWeekDay = formatDate(DateTimeHelper.getDynamicWeekDate(
      date, true, startDate, rangeOption, firstWeekDay, maxDateExist), 'MM/dd/YYYY', 'en-US');
    const endWeekDay = formatDate(DateTimeHelper.getDynamicWeekDate(
      date, false, startDate, rangeOption, firstWeekDay, maxDateExist), 'MM/dd/YYYY', 'en-US');

    return `${startWeekDay} - ${endWeekDay}`;
  }

  public static formatDateUTC(date: string, format: string): string {
    return formatDate(date, format, 'en-US', 'UTC');
  }

  public static findPreviousNearestDateIndex(datesArray: string[], date: string | undefined): number | null {
    const existDate: number = date ? new Date(date).getTime() : new Date().getTime();
    let closedToDate: number = datesArray[0] ? new Date(datesArray[0]).getTime() : new Date().getTime();
    let result = null;

    datesArray.forEach((el: string, idx: number) => {
      const dateCheck: number = DateTimeHelper.convertDateToUtc(el).getTime();
      const diffTime = existDate - dateCheck;

      if (diffTime < closedToDate && dateCheck <= existDate) {
        closedToDate = diffTime;
        result = idx;
      }
    });

    return result;
  }

  public static getDatesBetween(sDate: Date | string | null = null, eDate: Date | string | null = null): string[] {
    const startDate = sDate || new Date();
    const endDate = eDate || new Date().setDate(new Date().getDate() + 14); // default 14 days - 2 week view

    const result = [];

    for(let curDate = new Date(startDate); curDate <= new Date(endDate); curDate.setDate(curDate.getDate()+1)) {
      result.push(new Date(curDate).toISOString().split('T')[0]);
    }

    return result;
  }

  public static getCurrentDateWithoutOffset(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }
}
