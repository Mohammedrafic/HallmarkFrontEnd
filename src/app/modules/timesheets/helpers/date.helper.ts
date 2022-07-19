import { DateTimeHelper, Destroyable } from '@core/helpers';

export class TimesheetDateHelper extends Destroyable {
  public timeSettings: { min: string, max: string } = {
    min: '',
    max: '',
  };

  protected setDateBounds(initValue: string, dayBound: number): void {
    this.timeSettings.min = DateTimeHelper.getFirstDayOfWeekUtc(initValue);
    this.timeSettings.max = DateTimeHelper.getLastDayOfWeekFromFirstDay(initValue, dayBound);
  }
}