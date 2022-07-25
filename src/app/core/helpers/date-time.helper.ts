export class DateTimeHelper {
  public static getLastDayOfWeekFromFirstDay(startDate: string, days: number): string {
    const start = new Date(startDate);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    // const initDate = new Date(start.setUTCDate(start.getDate() - start.getDay() + days));
    // const dayToSet = initDate > new Date() ? new Date() : initDate;

    const lastDay = new Date(start.setUTCDate(start.getDate() - start.getDay() + days)).setUTCHours(23, 59, 59, 999) + offset;

    return new Date(lastDay).toUTCString();
  }

  public static getFirstDayOfWeekUtc(date: string): string {
    const start = new Date(date);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const day = new Date(start.setUTCDate(start.getDate()))
      .setUTCHours(0, 0, 0, 0) + offset;

    return new Date(day).toUTCString();
  }

  public static convertDateToUtc(date: string): string {
    const init = new Date(date);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const day = new Date(init.setUTCDate(init.getDate()) + offset);

    return new Date(day).toUTCString();
  }

  public static toUtc(date: string | Date): string {

    if (typeof date === 'string') {
      const gmt = new Date(this.convertDateToUtc(date));
      return new Date(Date.UTC(gmt.getFullYear(),
      gmt.getMonth(), gmt.getDate(), gmt.getHours(), gmt.getMinutes())).toISOString();
    }

    return new Date(Date.UTC(date.getFullYear(),
    date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())).toISOString();
  }
}
