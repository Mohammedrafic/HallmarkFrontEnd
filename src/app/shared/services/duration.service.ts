import { Injectable } from '@angular/core';
import { DateTimeHelper } from '@core/helpers';
import { Duration } from '@shared/enums/durations';

@Injectable({
  providedIn: 'root',
})
export class DurationService {
  private otherDurationHandler(
    jobStartDateValue: Date,
    orderDates: { jobStartDate: Date | string, jobEndDate: Date | string }
  ): Date {
    const startDate = DateTimeHelper.setInitDateHours(new Date(orderDates.jobStartDate));
    const endDate = DateTimeHelper.setInitDateHours( new Date(orderDates.jobEndDate));
    const durationInDays = DateTimeHelper.getDateDiffInDays(startDate, endDate);

    return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + durationInDays));
  }

  public getEndDate(
    duration: Duration,
    jobStartDate: Date,
    orderDates?: { jobStartDate: Date | string, jobEndDate: Date | string }
  ): Date {
    const jobStartDateValue = new Date(jobStartDate.getTime());

    switch (duration) {
      case Duration.TwelveWeeks:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 12 * 7 - 1));

      case Duration.ThirteenWeeks:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 13 * 7 - 1));

      case Duration.TwentySixWeeks:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 26 * 7 - 1));

      case Duration.Month:
        return new Date(jobStartDateValue.setMonth(jobStartDateValue.getMonth() + 1));

      case Duration.Year:
        return new Date(jobStartDateValue.setFullYear(jobStartDateValue.getFullYear() + 1));

      case Duration.NinetyDays:
        return new Date(jobStartDateValue.setDate(jobStartDateValue.getDate() + 89));

      case Duration.Other:
        return orderDates ? this.otherDurationHandler(jobStartDateValue, orderDates) : jobStartDate;

      default:
        return jobStartDate;
    }
  }
}
