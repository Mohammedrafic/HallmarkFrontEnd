export class DateTimeHelper {
  public static getLastDayOfWeekFromFirstDay(startDate: string, days: number): Date {
    const start = new Date(startDate);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const initDate = new Date(start.setUTCDate(start.getDate() - start.getDay() + days));
    const dayToSet = initDate > new Date() ? new Date() : initDate;

    const lastDay = dayToSet.setUTCHours(23, 59, 59, 999) + offset;

    return new Date(lastDay);
  }

  public static getFirstDayOfWeekUtc(date: string): Date {
    const start = new Date(date);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const day = new Date(start.setUTCDate(start.getDate()))
      .setUTCHours(0, 0, 0, 0) + offset;

    return new Date(day);
  }

  public static convertDateToUtc(date: string): Date {
    const init = new Date(date);
    const offset = new Date().getTimezoneOffset() * 60 * 1000;
    const day = new Date(init.setUTCDate(init.getUTCDate()) + offset);

    return day;
  }

  public static toUtcFormat(date: string | Date): string {
    if (typeof date === 'string') {
      const gmt = new Date(this.convertDateToUtc(date));
      return new Date(Date.UTC(gmt.getFullYear(),
      gmt.getMonth(), gmt.getDate(), gmt.getHours(), gmt.getMinutes())).toISOString();
    }

    return new Date(Date.UTC(date.getFullYear(),
    date.getMonth(), date.getDate(), date.getHours(), date.getMinutes())).toISOString();
  }
}
