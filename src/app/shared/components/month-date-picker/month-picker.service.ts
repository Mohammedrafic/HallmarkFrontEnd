import { Injectable } from '@angular/core';

import { BaseObservable, DateTimeHelper } from '@core/helpers';
import { DateWeekService } from '@core/services';

@Injectable()
export class MonthPickerService {
  private readonly selectedMonth: BaseObservable<Date> = new BaseObservable<Date>(new Date());

  constructor(
    private weekService: DateWeekService,
  ) { }

  public setSelectedMonth(date: Date): void {
    this.selectedMonth.set(date);
  }

  public getSelectedMonth(): Date {
    return this.selectedMonth.get();
  }

  public setDates(currentDate: Date, firstDayOfWeek: number): void {
    if(currentDate && firstDayOfWeek !== null && firstDayOfWeek !== undefined) {
      const utcStartDate = DateTimeHelper.setUtcTimeZone(this.getWeekByDayFirstMonth(currentDate,firstDayOfWeek));
      const utcLastDate = DateTimeHelper.setUtcTimeZone(this.getWeekByDayLastMonth(currentDate,firstDayOfWeek));

      this.weekService.setRange([
        utcStartDate,
        utcLastDate,
      ]);
    }
  }

  private getWeekByDayFirstMonth(currentDate: Date, firstDayOfWeek: number): Date {
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    const currentDay = lastDayOfMonth.getDay();
    lastDayOfMonth.setHours(0,0,0);
    const diff = firstDayOfWeek - lastDayOfMonth.getDay();

    if(currentDay >= firstDayOfWeek) {
      return new Date(lastDayOfMonth.setDate(lastDayOfMonth.getDate() + diff));
    } else {
      return new Date(lastDayOfMonth.setDate(lastDayOfMonth.getDate() - (7 - diff)));
    }
  }

  private getWeekByDayLastMonth(date: Date, dayOfWeek: number): Date {
    const currentDate = new Date(date.getTime());
    const currentMonth = currentDate.getMonth();
    currentDate.setMonth(currentMonth + 1);
    currentDate.setDate(1);
    const firstDayOfWeek = currentDate.getDay();
    const diff = dayOfWeek - firstDayOfWeek + (dayOfWeek < firstDayOfWeek ? 7 : 0);
    currentDate.setDate(currentDate.getDate() + diff - 1);

    return currentDate;
  }
}
