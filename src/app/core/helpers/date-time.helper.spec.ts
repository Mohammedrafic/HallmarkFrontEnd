import { DateTimeHelper } from './date-time.helper';
import { DatesRangeType } from '@shared/enums';
import { CalcDaysMs } from './functions.helper';
import { RangeDaysOptions } from '@shared/components/date-week-picker/date-week.constant';

describe('DateTimeHelper', () => {
  const arrayDates = ['2023-06-16', '2023-06-17', '2023-06-18', '2023-06-19', '2023-06-20', '2023-06-21'];
  const inputDate = '2023-06-16T00:00:00';

  it('DateTimeHelper.convertDateToUtc should convert the date to UTC -0500', () => {
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-300);
    const expectedDate = new Date('2023-06-15T19:00:00');
    const result = DateTimeHelper.convertDateToUtc(inputDate);

    expect(result).toEqual(expectedDate);
  });

  it('DateTimeHelper.convertDateToUtc: should convert the date to UTC +0500', () => {
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(300);
    const expectedDate = new Date('2023-06-16T05:00:00');
    const result = DateTimeHelper.convertDateToUtc(inputDate);

    expect(result).toEqual(expectedDate);
  });

  describe('DateTimeHelper.toUtcFormat', () => {
    it('should convert date to ISO string in 0 timezone', () => {
      const input = new Date('2023-06-16T04:00:45');
      const expectedDate = '2023-06-16T04:00:00.000Z';
      const expectedDate2 = '2023-06-16T00:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat(input);
      const result2 = DateTimeHelper.toUtcFormat(input, true);

      expect(result).toEqual(expectedDate);
      expect(result2).toEqual(expectedDate2);
    });

    it('should convert string date to ISO string in 0 timezone', () => {
      spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);

      const expectedDate = '2023-06-15T21:00:00.000Z';
      const expectedDate2 = '2023-06-15T00:00:00.000Z';
      const result = DateTimeHelper.toUtcFormat(inputDate);
      const result2 = DateTimeHelper.toUtcFormat(inputDate, true);

      expect(result).toEqual(expectedDate);
      expect(result2).toEqual(expectedDate2);
    });
  });

  it('DateTimeHelper.setInitDateHours: should set init hours', () => {
    const input = new Date('2023-06-16T04:22:45');
    const expectedDate = new Date('Fri Jun 16 2023 00:00:00');
    const result = DateTimeHelper.setInitDateHours(input);

    expect(result).toEqual(expectedDate);
  });

  it('DateTimeHelper.getFirstDayofWeek: should return first day of week', () => {
    const input = new Date('2023-06-16T04:22:45');
    const expectedDate = new Date('Sun Jun 11 2023 04:22:45');
    const result = DateTimeHelper.getFirstDayofWeek(input);

    expect(result).toEqual(expectedDate);
    expect(result.getDay()).toEqual(0);
  });

  it('DateTimeHelper.getLastDayOfWeek: should return the last day of week', () => {
    const input = new Date('2023-06-16T04:22:45');
    const expectedDate = new Date('Sat Jun 17 2023 04:22:45');
    const result = DateTimeHelper.getLastDayOfWeek(input);

    expect(result).toEqual(expectedDate);
    expect(result.getDay()).toEqual(6);
  });

  it('DateTimeHelper.isDateBetween: should return true if the date is fit in the time range', () => {
    const input1 = new Date('2023-06-16T02:22:22');
    const input2 = new Date('2023-06-15T02:22:22');
    const fromDate = new Date('2023-06-16T00:00:00');
    const toDate = new Date('2023-06-16T04:22:45');
    const result1 = DateTimeHelper.isDateBetween(input1, fromDate, toDate);
    const result2 = DateTimeHelper.isDateBetween(input2, fromDate, toDate);

    expect(result1).toBeTrue();
    expect(result2).toBeFalse();
  });

  it('DateTimeHelper.isDateBefore: should return true if the date1 is less or equal to date2', () => {
    const input1 = new Date('2023-06-16T02:22:22');
    const input2 = new Date('2023-06-18T02:22:22');
    const toDate = new Date('2023-06-16T02:22:22');
    const result1 = DateTimeHelper.isDateBefore(input1, toDate);
    const result2 = DateTimeHelper.isDateBefore(input2, toDate);

    expect(result1).toBeTrue();
    expect(result2).toBeFalse();
  });

  it('DateTimeHelper.newDateInTimeZone: should return date in specific timeZone', () => {
    const input = 'America/New_York';
    const result = DateTimeHelper.newDateInTimeZone(input);

    expect(result instanceof Date).toBe(true);

  });

  it('DateTimeHelper.formatDateUTC: should formate date to to specific formate', () => {
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);

    const formatDate1 = 'MM/dd/yyyy';
    const formatDate2 = 'dd/MM/yy';
    const formatTime = 'HH:mm';
    const expectedResult1 = '06/15/2023';
    const expectedResult2 = '21:00';
    const expectedResult3 = '15/06/23';
    const result1 = DateTimeHelper.formatDateUTC(inputDate, formatDate1);
    const result2 = DateTimeHelper.formatDateUTC(inputDate, formatTime);
    const result3 = DateTimeHelper.formatDateUTC(inputDate, formatDate2);

    expect(result1).toEqual(expectedResult1);
    expect(result2).toEqual(expectedResult2);
    expect(result3).toEqual(expectedResult3);
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

  it('DateTimeHelper.getDateDiffInDays: should return difference in days between dates', () => {
    const date1 = new Date('2023-06-16');
    const date2 = new Date('2023-06-26');
    const result = DateTimeHelper.getDateDiffInDays(date1, date2);

    expect(result).toEqual(10);
  });


  it('DateTimeHelper.getDatesBetween: should return array of dates between start/end dates', () => {
    const startDate = new Date('2023-06-16');
    const endDate = new Date('2023-06-21');
    const result = DateTimeHelper.getDatesBetween(startDate, endDate);

    expect(result).toEqual(arrayDates);
  });

  it('DateTimeHelper.findPreviousNearestDateIndex: should find date index in array of dates', () => {
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);

    const findDateIndex = arrayDates[4];
    const result = DateTimeHelper.findPreviousNearestDateIndex(arrayDates, findDateIndex);
    const result2 = DateTimeHelper.findPreviousNearestDateIndex(arrayDates, undefined);

    expect(result).toEqual(4);
    expect(result2).toEqual(5);
  });

  it('DateTimeHelper.getWeekStartEnd: should should split date string and return array with dates', () => {
    const input = '6-21-2023 - 6-30-2023';
    const expectedResult = [new Date('6-21-2023'), new Date('6-30-2023')];
    const result = DateTimeHelper.getWeekStartEnd(input);

    expect(result).toEqual(expectedResult);
  });

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
    })

    it('should return date range in two weeks', () => {
      const expectedResult = '06/12/2023 - 06/25/2023';
      const result = DateTimeHelper.getRange(inputDate, startDate, DatesRangeType.TwoWeeks, 1, false);
      expect(result).toEqual(expectedResult);
    });
  })

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

  it('DateTimeHelper.getFirstDayOfWeekUtc should return date in specific timeZone', () => {
    const date = new Date();
    const result = DateTimeHelper.getFirstDayOfWeekUtc(inputDate);
    expect(result.getTimezoneOffset()).toEqual(date.getTimezoneOffset());

    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(-180);
    const result2 = DateTimeHelper.getFirstDayOfWeekUtc(inputDate);
    expect(result2.getTimezoneOffset()).toEqual(-180);
  });

  it('DateTimeHelper.calculateMonthBoundDays: should create period (month) range, first day could be in previous month and last in next', () => {
    spyOn(Date.prototype, 'getTimezoneOffset').and.returnValue(300);

    const inputDate = new Date(2023, 5, 1);
    const inputDate2 = new Date(2023, 5, 30);
    const firstWeekDay = 0;
    const firstWeekDay1 = 1;
    const firstWeekDay2 = 6;

    const expectedResult = { from: '2023-05-28T00:00:00.000Z', to: '2023-07-01T00:00:00.000Z' };
    const expectedResult2 = { from: '2023-05-29T00:00:00.000Z', to: '2023-07-02T00:00:00.000Z' };
    const expectedResult3 = { from: '2023-05-27T00:00:00.000Z', to: '2023-07-01T00:00:00.000Z' };

    const result = DateTimeHelper.calculateMonthBoundDays(inputDate, firstWeekDay);
    const result2 = DateTimeHelper.calculateMonthBoundDays(inputDate2, firstWeekDay1);
    const result3 = DateTimeHelper.calculateMonthBoundDays(inputDate2, firstWeekDay2);

    expect(result).toEqual(expectedResult);
    expect(result2).toEqual(expectedResult2);
    expect(result3).toEqual(expectedResult3);
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
