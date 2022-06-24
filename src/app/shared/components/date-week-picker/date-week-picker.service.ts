import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable()
export class DateWeekPickerService {
  constructor(private datePipe: DatePipe,) {
  }

  public isDateBetween(date: Date | undefined, fromDate: Date, toDate: Date): boolean {
    return (date?.getTime() || 0) <= toDate.getTime() && (date?.getTime() || 0) >= fromDate.getTime();
  }

  public isDateBefore(date: Date, toDate: Date): boolean {
    return date.getTime() <= toDate.getTime();
  }

  public getWeekDate(date: string, isStart = false): Date {
    const curr = new Date(date); // get current date
    const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    const last = first + 6; // last day is the first day + 6

    return new Date(curr.setDate(isStart ? first : last));
  }

  public getWeekStartEnd(date: string): Date[] {
    const splitValue = date.split(' - ');
    const from = this.getWeekDate(splitValue[0], true);
    const to = this.getWeekDate(splitValue[1]);

    return [from, to];
  }

  public getRange(date: string | Date | any, prevRange: string = ''): string {
    let startWeekDay, endWeekDay;

    if (prevRange) {
      const splitValue = prevRange.split(' - ');
      const from = new Date(splitValue[0]);
      const to = new Date(splitValue[1]);

      if (!this.isDateBetween(date, from, to)) {
        if (this.isDateBefore(date, from)) {
          startWeekDay = this.datePipe.transform(this.getWeekDate(date, true), 'MM/dd/YYYY');
          endWeekDay = this.datePipe.transform(to, 'MM/dd/YYYY');
        } else {
          startWeekDay = this.datePipe.transform(from, 'MM/dd/YYYY');
          endWeekDay = this.datePipe.transform(this.getWeekDate(date), 'MM/dd/YYYY');
        }

        return `${startWeekDay} - ${endWeekDay}`;
      }
    }

    startWeekDay = this.datePipe.transform(this.getWeekDate(date, true), 'MM/dd/YYYY');
    endWeekDay = this.datePipe.transform(this.getWeekDate(date), 'MM/dd/YYYY');

    return `${startWeekDay} - ${endWeekDay}`;
  }
}
