import { DateTimeHelper, Destroyable } from '@core/helpers';

export class TimesheetDateHelper extends Destroyable {
  public dateSettings = {
    timeIn: {
      min: '',
      max: '',
    },
    timeOut: {
      min: '',
      max: '',
    }
  }

  protected setDateBounds(initValue: string, dayBound: number): void {
    this.dateSettings.timeIn.min = DateTimeHelper.getFirstDayOfWeekUtc(initValue);
    this.dateSettings.timeIn.max = DateTimeHelper.getLastDayOfWeekFromFirstDay(initValue, dayBound - 1);

    this.dateSettings.timeOut.min = DateTimeHelper.getFirstDayOfWeekUtc(initValue);
    this.dateSettings.timeOut.max = DateTimeHelper.getLastDayOfWeekFromFirstDay(initValue, dayBound);
  }

  protected setdateBoundsForDay(initValue: string): void {
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const date = new Date(initValue);
    const startDate = new Date(date.setUTCDate(date.getDate()));

    this.dateSettings.timeIn.min = new Date(startDate.setUTCHours(0, 0, 0, 0) + offset).toUTCString();
    this.dateSettings.timeIn.max = new Date(startDate.setUTCHours(23, 50, 50) + offset).toUTCString();

    this.dateSettings.timeOut.min = new Date(startDate.setUTCHours(0, 0, 0) + offset).toUTCString();
    this.dateSettings.timeOut.max = new Date(new Date(startDate.setUTCDate(startDate.getDate() + 1))
    .setUTCHours(23, 50, 50) + offset).toUTCString();
  }
}