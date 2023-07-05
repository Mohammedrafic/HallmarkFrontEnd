import { DateTimeHelper, Destroyable } from '@core/helpers';

export class TimesheetDateHelper extends Destroyable {
  public dateSettings = {
    timeIn: {
      min: new Date(),
      max: new Date(),
    },
    timeOut: {
      min: new Date(),
      max: new Date(),
    },
  };

  protected setDateBounds(startDate: string, endWeekDate: string): void {
    const today = DateTimeHelper.setInitHours(new Date().toUTCString());
    const weekEndDate = DateTimeHelper.setInitHours(endWeekDate);

    const endDate = new Date(weekEndDate) < new Date(today) ? weekEndDate : today;

    this.dateSettings.timeIn.min = DateTimeHelper.setCurrentUtcDate(startDate);
    this.dateSettings.timeIn.max = DateTimeHelper.setCurrentUtcDate(endDate);

    this.dateSettings.timeOut.min = DateTimeHelper.setCurrentUtcDate(startDate);
    this.dateSettings.timeOut.max = DateTimeHelper.setCurrentUtcDate(endDate);
  }

  protected setdateBoundsForDay(initValue: string): void {
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const date = new Date(new Date(initValue).setHours(12, 0, 0));
    const startDate = new Date(date.setUTCDate(date.getDate()));

    this.dateSettings.timeIn.min = new Date(startDate.setUTCHours(0, 0, 0, 0) + offset);
    this.dateSettings.timeIn.max = new Date(startDate.setUTCHours(23, 50, 50) + offset);

    this.dateSettings.timeOut.min = new Date(startDate.setUTCHours(0, 0, 0) + offset);
    this.dateSettings.timeOut.max = new Date(new Date(startDate.setUTCDate(startDate.getDate() + 1))
    .setUTCHours(23, 50, 50) + offset);
  }
}
