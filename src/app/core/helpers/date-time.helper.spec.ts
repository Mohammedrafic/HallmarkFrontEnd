import { DateTimeHelper } from './date-time.helper';
import { DatesRangeType } from '@shared/enums';
import { CalcDaysMs } from './functions.helper';
import { RangeDaysOptions } from '@shared/components/date-week-picker/date-week.constant';

describe('DateTimeHelper', () => {
  const arrayDates = ['2023-06-16', '2023-06-17', '2023-06-18', '2023-06-19', '2023-06-20', '2023-06-21'];
  const inputDate = '2023-06-16T00:00:00';

  describe('DateTimeHelper.convertDateToUtc', () => {
    it('should convert the date to UTC -0500', () => {
      const timezoneOffset = -300;
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(timezoneOffset);
      const expectedDate = new Date('2023-06-15T19:00:00');
      const result = DateTimeHelper.convertDateToUtc('2023-06-16T00:00:00');

      expect(result).toEqual(expectedDate);
      expect(result.getTimezoneOffset()).toEqual(timezoneOffset);
    });

    it('should convert the date to UTC +0500', () => {
      const timezoneOffset = 300;
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(timezoneOffset);

      const expectedDate = new Date('2023-06-16T05:00:00');
      const result = DateTimeHelper.convertDateToUtc('2023-06-16T00:00:00');

      expect(result).toEqual(expectedDate);
      expect(result.getTimezoneOffset()).toEqual(timezoneOffset);
    });

    it('should convert the ISO string date to UTC', () => {
      const timezoneOffset = -180;
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(timezoneOffset);

      const init = new Date('2023-06-16T00:00:00.000Z');
      const expectedDate = new Date(init.setUTCDate(init.getUTCDate()) + timezoneOffset * 60 * 1000);
      const result = DateTimeHelper.convertDateToUtc('2023-06-16T00:00:00.000Z');

      expect(result).toEqual(expectedDate);
      expect(result.getTimezoneOffset()).toEqual(timezoneOffset);
    });
  });

  describe('DateTimeHelper.toUtcFormat', () => {
    const input = new Date('2023-06-16T04:00:45');

    it('should convert date to ISO string in 0 timezone with saved hours', () => {
      const expectedDate = '2023-06-16T04:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat(input);

      expect(result).toEqual(expectedDate);
    });

    it('should convert date to ISO string in 0 timezone with zeroed hours', () => {
      const expectedDate = '2023-06-16T00:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat(input, true);

      expect(result).toEqual(expectedDate);
    });

    it('should convert date to ISO string in 0 timezone with offset', () => {
      const expectedDate = '2023-06-16T00:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat('2023-06-16T00:00:00.000-0500', true);

      expect(result).toEqual(expectedDate);
    });

    it('should convert string date to ISO string in 0 timezone with saved hours', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);

      const expectedDate = '2023-06-15T21:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat(inputDate);

      expect(result).toEqual(expectedDate);
    });

    it('should convert string date to ISO string in 0 timezone with zeroed hours', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);

      const expectedDate = '2023-06-15T00:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat(inputDate, true);

      expect(result).toEqual(expectedDate);
    });
  });

  describe('DateTimeHelper.setInitDateHours:', () => {
    it('should set init hours for input date object', () => {
      const input = new Date('2023-06-16T04:22:45');
      const expectedDate = new Date('2023-06-16T00:00:00');
      const result = DateTimeHelper.setInitDateHours(input);

      expect(result).toEqual(expectedDate);
    });

    it('should set init hours for input date string', () => {
      const input = '2023-06-16T04:22:45';
      const expectedDate = new Date('2023-06-16T00:00:00');
      const result = DateTimeHelper.setInitDateHours(input);

      expect(result).toEqual(expectedDate);
    });
  });

  describe('DateTimeHelper.getFirstDayofWeek:', () => {
    it('should return first day of week', () => {
      const input = new Date('2023-06-16T04:22:45');
      const expectedDate = new Date('Sun Jun 11 2023 04:22:45');
      const result = DateTimeHelper.getFirstDayofWeek(input);

      expect(result).toEqual(expectedDate);
      expect(result.getDay()).toEqual(0);
    });

    it('should return Date', () => {
      const input = new Date('2023-12-12T08:00:45');
      const result = DateTimeHelper.getFirstDayofWeek(input);

      expect(result instanceof Date).toBe(true);
    });
  });

  describe('DateTimeHelper.getLastDayOfWeek:', () => {
    it('should return the last day of week', () => {
      const input = new Date('2023-06-16T04:22:45');
      const expectedDate = new Date('Sat Jun 17 2023 04:22:45');
      const result = DateTimeHelper.getLastDayOfWeek(input);

      expect(result).toEqual(expectedDate);
      expect(result.getDay()).toEqual(6);
    });

    it('should return Date', () => {
      const input = new Date('2023-12-12T08:00:45');
      const result = DateTimeHelper.getLastDayOfWeek(input);

      expect(result instanceof Date).toBe(true);
    });
  });

  describe('DateTimeHelper.isDateBetween:', () => {
    const input1 = new Date('2023-06-16T02:22:22');
    const input2 = new Date('2023-06-15T02:22:22');
    const fromDate = new Date('2023-06-16T00:00:00');
    const toDate = new Date('2023-06-16T04:22:45');

    it('should return true if the date is fit in the time range', () => {
      const result1 = DateTimeHelper.isDateBetween(input1, fromDate, toDate);
      expect(result1).toBeTrue();
    });

    it('should return false if the date is out off the time range', () => {
      const result2 = DateTimeHelper.isDateBetween(input2, fromDate, toDate);
      expect(result2).toBeFalse();
    });

    it('should return false if the input date is undefined', () => {
      const result = DateTimeHelper.isDateBetween(undefined, fromDate, toDate);
      expect(result).toBeFalse();
    });
  });

  describe('DateTimeHelper.isDateBefore:', () => {
    const input1 = new Date('2023-06-16T02:22:22');
    const input2 = new Date('2023-06-18T02:22:22');
    const toDate = new Date('2023-06-16T02:22:22');

    it('should return true if Date1 is less than Date2', () => {
      const result = DateTimeHelper.isDateBefore(input1, toDate);
      expect(result).toBeTrue();
    });

    it('should return true if Date1 is equal to Date2', () => {
      const result = DateTimeHelper.isDateBefore(input1, toDate);
      expect(result).toBeTrue();
    });

    it('should return false if Date1 is bigger than Date2', () => {
      const result2 = DateTimeHelper.isDateBefore(input2, toDate);
      expect(result2).toBeFalse();
    });
  });

  it('DateTimeHelper.newDateInTimeZone: should return date in specific timeZone', () => {
    const input = 'America/New_York';
    const result = DateTimeHelper.newDateInTimeZone(input);

    expect(result instanceof Date).toBe(true);
  });

  describe('DateTimeHelper.formatDateUTC:', () => {
    const formatDate1 = 'MM/dd/yyyy';
    const formatDate2 = 'dd/MM/yy';
    const formatTime = 'HH:mm';

    beforeEach(() => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);
    });

    it(`should formate date to ${formatDate1}`, () => {
      const result1 = DateTimeHelper.formatDateUTC(inputDate, formatDate1);
      expect(result1).toEqual('06/15/2023');
    });

    it(`should formate date to ${formatDate2}`, () => {
      const result1 = DateTimeHelper.formatDateUTC(inputDate, formatDate2);
      expect(result1).toEqual('15/06/23');
    });

    it(`should formate date to ${formatTime}`, () => {
      const result1 = DateTimeHelper.formatDateUTC(inputDate, formatTime);
      expect(result1).toEqual('21:00');
    });
  });

  it('DateTimeHelper.getCurrentDateWithoutOffset: should set hours, minutes, seconds to 0 in current date', () => {
    const result = DateTimeHelper.getCurrentDateWithoutOffset();

    expect(result.getHours()).toEqual(0);
    expect(result.getMinutes()).toEqual(0);
    expect(result.getMinutes()).toEqual(0);
  });

  it('DateTimeHelper.getISOTimeZone: should get offSet from ISO date string', () => {
    const input = '2023-01-30T09:43:32.2300926-05:00';
    const result = DateTimeHelper.getISOTimeZone(input);

    expect(result).toEqual('-0500');
  });

  describe('DateTimeHelper.getDateDiffInDays:', () => {
    const date1 = new Date('2023-06-16');
    const date2 = new Date('2023-06-26');

    it('should return difference in days between dates', () => {
      const result = DateTimeHelper.getDateDiffInDays(date1, date2);
      expect(result).toEqual(10);
    });

    it('should return negative number if first date is bigger than second', () => {
      const result = DateTimeHelper.getDateDiffInDays(date2, date1);
      expect(result).toEqual(-10);
    });
  });

  describe('DateTimeHelper.getDatesBetween', () => {
    const startDate = new Date('2023-06-16');
    const endDate = new Date('2023-06-21');

    it('should return array of dates between start/end dates', () => {
      const result = DateTimeHelper.getDatesBetween(startDate, endDate);
      expect(result).toEqual(arrayDates);
    });

    it('should return empty array if startDate is bigger than endDate', () => {
      const result = DateTimeHelper.getDatesBetween(endDate, startDate);
      expect(result.length).toEqual(0);
    });
  });


  describe('DateTimeHelper.findPreviousNearestDateIndex', () => {
    beforeEach(() => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);
    });

    it('should find date index in array of dates', () => {
      const findDateIndex = arrayDates[4];
      const result = DateTimeHelper.findPreviousNearestDateIndex(arrayDates, findDateIndex);
      expect(result).toEqual(4);
    });

    it('should return last date index if input index is undefined', () => {
      const expectedResult = arrayDates.length - 1;
      const result2 = DateTimeHelper.findPreviousNearestDateIndex(arrayDates, undefined);
      expect(result2).toEqual(expectedResult);
    });
  });

  describe('DateTimeHelper.getWeekStartEnd:', () => {
    it('should split date string and return array with dates', () => {
      const input = '6-21-2023 - 6-30-2023';
      const expectedResult = [new Date('6-21-2023'), new Date('6-30-2023')];
      const result = DateTimeHelper.getWeekStartEnd(input);

      expect(result).toEqual(expectedResult);
    });

    it('should return "Invalid Date" if format input string is wrong', () => {
      const input = '6-21-2023 - 6-30-2023T00:00:00';
      const result = DateTimeHelper.getWeekStartEnd(input);
      const isValidDate = result[1] instanceof Date && !isNaN(result[1].getTime());

      expect(isValidDate).toBe(false);
    });
  });

  /**TODO rework test with mock static data */
  describe('DateTimeHelper.getDynamicWeekDate:', () => {
    const input = '2023-06-12';
    const startDate = new Date('2023-06-19');

    it('should return date of the first day of week as Sunday from input date', () => {
      const firstWeekDay = 0;
      const dayDiff = getDateDiff(input, startDate, firstWeekDay);
      const timeStamp = new Date(input).getTime() - CalcDaysMs(dayDiff);
      const expectedResult = new Date(timeStamp);
      const result = DateTimeHelper.getDynamicWeekDate(input, true, startDate, DatesRangeType.OneWeek, 0, true);

      expect(result).toEqual(expectedResult);
      expect(result.getDay()).toEqual(0);
    });

    it('should return date of the first day of week as Monday from input date', () => {
      const firstWeekDay = 1;
      const dayDiff = getDateDiff(input, startDate, firstWeekDay);
      const timeStamp = new Date(input).getTime() - CalcDaysMs(dayDiff);
      const expectedResult = new Date(timeStamp);
      const result = DateTimeHelper.getDynamicWeekDate(input, true, startDate, DatesRangeType.OneWeek, firstWeekDay, true);

      expect(result).toEqual(expectedResult);
      expect(result.getDay()).toEqual(1);
    });

    it('should return date of the last day of week as Saturday from input date', () => {
      const firstWeekDay = 0;
      const dayDiff = getDateDiff(input, startDate, firstWeekDay);
      const timeStamp = new Date(input).getTime() - CalcDaysMs(dayDiff) + CalcDaysMs(RangeDaysOptions[DatesRangeType.OneWeek] - 1);
      const expectedResult = new Date(timeStamp);
      const result = DateTimeHelper.getDynamicWeekDate(input, false, startDate, DatesRangeType.OneWeek, firstWeekDay, true);

      expect(result).toEqual(expectedResult);
      expect(result.getDay()).toEqual(6);
    });

    it(`should return "${input}" date if range option is "${DatesRangeType.Day}"`, () => {
      const expectedResult = new Date(input);
      const result = DateTimeHelper.getDynamicWeekDate(input, true, startDate, DatesRangeType.Day);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('DateTimeHelper.getRange:', () => {
    const startDate = new Date('2023-06-16');

    it('should return date range in one week', () => {
      const expectedResult = '06/11/2023 - 06/17/2023';
      const result = DateTimeHelper.getRange(inputDate, startDate, DatesRangeType.OneWeek, 0, true);
      expect(result).toEqual(expectedResult);
    });

    it('should return date range in two weeks', () => {
      const expectedResult = '06/12/2023 - 06/25/2023';
      const result = DateTimeHelper.getRange(inputDate, startDate, DatesRangeType.TwoWeeks, 1, false);
      expect(result).toEqual(expectedResult);
    });
  });

  it('DateTimeHelper.getWeekDate: should return date of the last day of week as Saturday from input date', () => {
    const input = '2023-06-12';
    const startDate = new Date('2023-06-19');
    const firstWeekDay = 0;
    const dayDiff = getDateDiff(input, startDate, firstWeekDay);
    const timeStamp = new Date(input).getTime() - CalcDaysMs(dayDiff) + CalcDaysMs(RangeDaysOptions[DatesRangeType.OneWeek] - 1);
    const expectedResult = new Date(timeStamp);
    const result = DateTimeHelper.getWeekDate(input, false, DatesRangeType.OneWeek, firstWeekDay);

    expect(result).toEqual(expectedResult);
    expect(result.getDay()).toEqual(6);
  });


  it('DateTimeHelper.getLastDayOfWeekFromFirstDay should return the last day of week', () => {
    const expectedResult = new Date('2023-06-11T23:59:59.999');
    const result = DateTimeHelper.getLastDayOfWeekFromFirstDay(inputDate, 0);

    expect(result).toEqual(expectedResult);
    expect(result.getDay()).toEqual(0);
  });

  describe('DateTimeHelper.getFirstDayOfWeekUtc:', () => {
    it('should return date in current timeZone', () => {
      const date = new Date();
      const result = DateTimeHelper.getFirstDayOfWeekUtc(inputDate);
      expect(result.getTimezoneOffset()).toEqual(date.getTimezoneOffset());
    });

    it('should return date in -180 timeZone', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);
      const result2 = DateTimeHelper.getFirstDayOfWeekUtc(inputDate);
      expect(result2.getTimezoneOffset()).toEqual(-180);
    });
  });

  describe('DateTimeHelper.calculateMonthBoundDays:', () => {
    const inputDate = new Date(2023, 5, 1);
    const inputDate2 = new Date(2023, 5, 30);
    const firstWeekDay = 0;
    const firstWeekDay1 = 1;
    const firstWeekDay2 = 6;

    beforeEach(() => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(300);
    });

    it('should return period (month) range which starts from Sunday', () => {
      const expectedResult = { from: '2023-05-28T00:00:00.000Z', to: '2023-07-01T00:00:00.000Z' };
      const result = DateTimeHelper.calculateMonthBoundDays(inputDate, firstWeekDay);
      expect(result).toEqual(expectedResult);
    });

    it('should return period (month) range which starts from Suturday', () => {
      const expectedResult = { from: '2023-05-29T00:00:00.000Z', to: '2023-07-02T00:00:00.000Z' };
      const result = DateTimeHelper.calculateMonthBoundDays(inputDate2, firstWeekDay1);
      expect(result).toEqual(expectedResult);
    });

    it('should return period (month) range which starts from Sunday', () => {
      const expectedResult = { from: '2023-05-27T00:00:00.000Z', to: '2023-07-01T00:00:00.000Z' };
      const result = DateTimeHelper.calculateMonthBoundDays(inputDate2, firstWeekDay2);
      expect(result).toEqual(expectedResult);
    });
  });
});

function getDateDiff(date: string, weekStartDay: Date, firstWeekDay: number): number {
  const curr = new Date(date);
  const startDayNum = firstWeekDay ?? weekStartDay.getDay();
  const currDayNum = curr.getDay();

  let dayDiff: number;

  if (currDayNum >= startDayNum) {
    dayDiff = currDayNum - startDayNum;
  } else {
    dayDiff = 7 - startDayNum + currDayNum;
  }

  return dayDiff;
}
