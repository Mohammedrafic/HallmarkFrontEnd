import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { TimesheetsFilterState, TimesheetRecord } from '../interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';

@Injectable()
export class TimesheetsApiService {

  constructor(
    private http: HttpClient,
  ) {}

  public getTimesheets(filters: TimesheetsFilterState): Observable<TimeSheetsPage> {
    // return this.http.get('')
    return of(
      {
        items: [],
        pageNumber: 1,
        totalPages: 1,
        totalCount: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      }
    )
  }

  public getTimesheetRecords(id: number): Observable<TimesheetRecord[]> {
    return of([]);
  }

  public postProfileTimesheets(body: TimesheetRecord): Observable<null> {
    return of(null);
  }

  public patchProfileTimesheets(
    profileId: number,
    profileTimesheetId:number,
    body: TimesheetRecord,
  ): Observable<null> {
    return of(null);
  }

  public deleteProfileTimesheets(profileId: number, profileTimesheetId: number): Observable<null> {
    return of(null);
  }
}
