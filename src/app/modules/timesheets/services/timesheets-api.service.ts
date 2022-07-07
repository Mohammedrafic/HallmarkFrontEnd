import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { CapitalizeFirstPipe } from '@shared/pipes/capitalize-first/capitalize-first.pipe';

import {
  TimesheetsFilterState,
  TimesheetRecord,
  CandidateInfo,
  TimesheetAttachments,
  TabCountConfig,
  TimesheetRecordsDto,
  DataSourceItem,
  FilterDataSource,
} from '../interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { filterColumnDataSource, MokTabsCounts, MokTimesheet, MockCandidateHoursAndMilesData } from '../constants';
import { CandidateMockInfo, MockTimesheetRecords } from '../constants/timesheet-records-mock.constant';
import { TimesheetsTableColumns } from '../enums';
import { CandidateHoursAndMilesData } from '../interface';

@Injectable()
export class TimesheetsApiService {

  constructor(
    private http: HttpClient,
    private capitalizeFirst: CapitalizeFirstPipe,
  ) {}

  public getTimesheets(filters: TimesheetsFilterState): Observable<TimeSheetsPage> {
    return of({
      pageNumber: 1,
      totalPages: 1,
      totalCount: 1,
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

  public setDataSources(filterKeys: TimesheetsTableColumns[]): Observable<FilterDataSource> {
    const res = filterKeys.reduce((acc: any, key) => {
      acc[key] = filterColumnDataSource[key].map((el: DataSourceItem) =>
        ({...el, name: this.capitalizeFirst.transform(el.name)})
      );

      return acc;
    }, {});

    return of(res);
  }

  public getCandidateInfo(id: number): Observable<CandidateInfo> {
    return of(CandidateMockInfo);
  }

  public getCandidateHoursAndMilesData(id: number): Observable<CandidateHoursAndMilesData> {
    return of(MockCandidateHoursAndMilesData);
  }

  public getCandidateAttachments(id: number): Observable<TimesheetAttachments> {
    return of();
  }
}
