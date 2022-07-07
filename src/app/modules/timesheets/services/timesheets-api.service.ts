import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import {
  TimesheetsFilterState,
  TimesheetRecord,
  CandidateInfo,
  TimesheetAttachments,
  TabCountConfig,
  TimesheetRecordsDto,
} from '../interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { MokTabsCounts, MokTimesheet } from '../constants';
import { CandidateMockInfo, MockTimesheetRecords } from '../constants/timesheet-records-mock.constant';

@Injectable()
export class TimesheetsApiService {

  constructor(
    private http: HttpClient,
  ) {}

  public getTimesheets(filters: TimesheetsFilterState): Observable<TimeSheetsPage> {
    return of({
      pageNumber: 1,
      totalPages: 1,
      totalCount: 0,
      items: [MokTimesheet],
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }

  public getTabsCounts(): Observable<TabCountConfig> {
    return of(MokTabsCounts);
  }

  public getTimesheetRecords(id: number): Observable<TimesheetRecordsDto> {
    return of(MockTimesheetRecords);
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

  public getCandidateInfo(id: number): Observable<CandidateInfo> {
    return of(CandidateMockInfo);
  }

  public getCandidateChartData(id: number): Observable<unknown> {
    return of();
  }

  public getCandidateAttachments(id: number): Observable<TimesheetAttachments> {
    return of();
  }
}
