import { formatDate } from '@angular/common';
import { DatePeriod } from '@core/interface';

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

  public static toUtcFormat(date: string | Date, zeroTime = false): string {
    if (typeof date === 'string') {
      const gmt = new Date(this.convertDateToUtc(date));
      const hours = zeroTime ? 0 : gmt.getHours();
      const minuets = zeroTime ? 0 : gmt.getMinutes();

      return new Date(
        Date.UTC(gmt.getFullYear(), gmt.getMonth(), gmt.getDate(), hours, minuets)
      ).toISOString();
    }

    const hours = zeroTime ? 0 : date.getHours();
    const minuets = zeroTime ? 0 : date.getMinutes();

    return new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minuets)
    ).toISOString();
  }

  /**
   * Use this function with cautions. it needs to be removed.
   */
  public static setInitHours(data: string): string {
    const date = new Date(this.convertDateToUtc(data));
    date.setHours(0, 0, 0);

    return this.toUtcFormat(date);
  }

  public static setInitDateHours(date: Date | string): Date {
    if (typeof date === 'object') {
      return new Date(date.setHours(0, 0, 0));
    }

    return new Date(new Date(date).setHours(0, 0, 0));
  }

  public static getFirstDayofWeek(date: Date): Date {
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

  public static getWeekDate(date: string | Date, isStart: boolean,
    rangeOption: DatesRangeType, firstWeekDay: number | null = null, maxDateExist = true): Date {
    const curr = new Date(date);
    const startDayNum = firstWeekDay ?? curr.getDay();
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

    if (maxDateExist && lastDay > new Date().getTime() && rangeOption !== DatesRangeType.Day) {
      last = new Date().getTime();
    }

    return new Date(isStart ? firstDay : last);
  }

  public static getDynamicWeekDate(
    date: string | Date, isStart: boolean, weekStartDay: Date, rangeOption: DatesRangeType,
    firstWeekDay: number | null = null, maxDateExist = true): Date {
    const curr = new Date(date);
    const startDayNum = firstWeekDay ?? weekStartDay.getDay();
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

    if (lastDay > new Date().getTime() && maxDateExist) {
      last = new Date().getTime();
    }

    return new Date(isStart ? firstDay : last);
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
    const formattedEndDate = DateTimeHelper.convertDateToUtc(endDate as string);

    const result = [];

    for(
      let curDate = DateTimeHelper.convertDateToUtc(startDate as string);
      curDate <= formattedEndDate;
      curDate.setDate(curDate.getDate() + 1)
    ) {
      result.push(formatDate(curDate,'yyyy-MM-dd', 'en-US'));
    }

    return result;
  }

  public static getCurrentDateWithoutOffset(): Date {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }

  public static getDateDiffInDays(start: Date, end: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
    const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());

    return Math.floor((utc2 - utc1) / msPerDay);
  }

  /**
   * This method is for getting period (month) range based on the first day of week set for organization.
   * It creates range to be used in calendar (first day could be in previous month and last in next).
   */
  public static calculateMonthBoundDays(selectedDate: Date, firstWeekDay: number): DatePeriod {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1, 0, 0, 0);
    const lastDayOfMonth = new Date(year, month + 1, 0, 0, 0, 0);
    const calendarFirstDay = firstDayOfMonth.getDay();
    const calendarLastDay = lastDayOfMonth.getDay();

    // Temporary variable.
    const dateRange = {
      from: new Date(),
      to: new Date(),
    };

    const range: DatePeriod = {
      from: '',
      to: '',
    };

    if (calendarFirstDay >= firstWeekDay) {

      const dayDiff = calendarFirstDay - firstWeekDay;
      dateRange.from = new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - dayDiff));

    } else if (calendarFirstDay < firstWeekDay) {

      const dayDiff = calendarFirstDay + 7 - firstWeekDay;
      dateRange.from = new Date(firstDayOfMonth.setDate(firstDayOfMonth.getDate() - dayDiff));
    }

    if (calendarLastDay >= firstWeekDay && firstWeekDay !== 0) {

      const dayDiff = 6 - calendarLastDay + firstWeekDay;
      dateRange.to = new Date(lastDayOfMonth.setDate(lastDayOfMonth.getDate() + dayDiff));

    } else if (calendarLastDay < firstWeekDay || firstWeekDay === 0) {

      const dayDiff = 6 - calendarLastDay;
      dateRange.to = new Date(lastDayOfMonth.setDate(lastDayOfMonth.getDate() + dayDiff));
    }

    range.from = DateTimeHelper.toUtcFormat(dateRange.from);
    range.to = DateTimeHelper.toUtcFormat(dateRange.to);

    return range;
  }

  public static getDSTCorrectionInMs(date: Date): number {
    const currentOffset = new Date(new Date().getFullYear(), 0, 1).getTimezoneOffset();
    const dateOffset = new Date(date).getTimezoneOffset();
    return (currentOffset - dateOffset) * 60 * 1000;
  }

  public static getISOTimeZone(date: string): string {
    //get timezone from ISO string. example: "2023-01-30T09:43:32.2300926-05:00" => "-0500"
    return date.slice(-6).split(':').join('');
  }
}
