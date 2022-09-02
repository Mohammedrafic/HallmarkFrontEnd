import { Injectable } from '@angular/core';
import { Duration } from '@shared/enums/durations';

@Injectable({
  providedIn: 'root',
})
export class DurationService {
  public getEndDate(duration: Duration, jobStartDate: Date): Date {
    const jobStartDateValue = new Date(jobStartDate.getTime());

    switch (duration) {
      case Duration.TwelveWeeks:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 12 * 7 - 1));
        break;

      case Duration.ThirteenWeeks:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 13 * 7 - 1));
        break;

      case Duration.TwentySixWeeks:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 26 * 7 - 1));
        break;

      case Duration.Month:
        return new Date(jobStartDateValue.setMonth(jobStartDateValue.getMonth() + 1));
        break;

      case Duration.Year:
        return new Date(jobStartDateValue.setFullYear(jobStartDateValue.getFullYear() + 1));
        break;

      case Duration.NinetyDays:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 89));
        break;

      default:
        return new Date();
    }
  }
}
