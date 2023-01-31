import { Injectable } from '@angular/core';
import { Duration } from '@shared/enums/durations';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { ExtensionGridModel, ExtensionModel } from './models/extension.model';
import { AppState } from '../../../../store/app.state';
import { Store } from '@ngxs/store';
import { toCorrectTimezoneFormat } from '@shared/utils/date-time.utils';
import { DateTimeHelper } from '@core/helpers';

@Injectable({
  providedIn: 'root',
})
export class ExtensionSidebarService {
  constructor(private http: HttpClient, private store: Store) {}

  public saveExtension(extension: ExtensionModel): Observable<void> {
    const payload = this.prepareExtension(extension);
    return this.http.put<void>('/api/candidatejobs/extensions', payload);
  }

  public getExtensions(id: number, orderId: number, organizationId?: number): Observable<ExtensionGridModel[]> {
    const { isAgencyArea } = this.store.selectSnapshot(AppState.isOrganizationAgencyArea);
    if (isAgencyArea) {
      return this.http
        .get<ExtensionGridModel[]>(`/api/organizations/${organizationId}/candidatejobs/${id}/extensions`, {
          params: { orderId },
        })
        .pipe(catchError(() => of([])));
    } else {
      return this.http
        .get<ExtensionGridModel[]>(`/api/candidatejobs/${id}/extensions`, { params: { orderId } })
        .pipe(catchError(() => of([])));
    }
  }

  public getSecondaryDuration(durationPrimary: Duration): number {
    const listOfWeeks = [Duration.ThirteenWeeks, Duration.TwentySixWeeks];
    const listOfMonths = [Duration.Month, Duration.Year];
    const listOfDays = [Duration.NinetyDays];

    switch (true) {
      case listOfWeeks.includes(durationPrimary):
        return Duration.Weeks;
      case listOfMonths.includes(durationPrimary):
        return Duration.Months;
      case listOfDays.includes(durationPrimary):
        return Duration.Days;
      default:
        return Duration.Days;
    }
  }

  public getTertiaryDuration(durationPrimary: Duration): number {
    const one = 1;
    const twelve = 12;
    const thirteen = 13;
    const twentySix = 26;
    const ninety = 90;

    const numbers: { [key: number]: number } = {
      [Duration.ThirteenWeeks]: thirteen,
      [Duration.TwentySixWeeks]: twentySix,
      [Duration.Month]: one,
      [Duration.NinetyDays]: ninety,
      [Duration.Year]: twelve,
    };

    return numbers[durationPrimary];
  }

  public getEndDate(startDate: Date, shiftSecondary: Duration, shiftTertiary: Duration): Date {
    try {
      const week = 7;
      const date = new Date(startDate.getTime());

      switch (true) {
        case shiftSecondary === Duration.Days:
          return new Date(date.setDate(date.getDate() + shiftTertiary - 1));
        case shiftSecondary === Duration.Weeks:
          return new Date(date.setDate(date.getDate() + shiftTertiary * week - 1));
        case shiftSecondary === Duration.Months:
          return new Date(date.setMonth(date.getMonth() + shiftTertiary));
        default:
          return new Date();
      }
    } catch (error) {
      throw error;
    }
  }

  private prepareExtension(extension: any): ExtensionModel {
    const { orderId, startDate, endDate, billRate, billRates, comments,
      jobId, durationPrimary, ignoreMissingCredentials } = extension || {};

    return {
      jobId,
      orderId,
      billRate,
      billRates,
      comments,
      actualStartDate: toCorrectTimezoneFormat(startDate),
      actualEndDate: DateTimeHelper.setInitHours(toCorrectTimezoneFormat(endDate)),
      duration: durationPrimary,
      ignoreMissingCredentials,
    };
  }
}
