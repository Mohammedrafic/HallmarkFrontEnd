import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ITimesheet, ITimesheetsFilter } from '../interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { MOK_TIMESHEETS } from '../constants';
import { mockProfileTableData } from '../components/profile-timesheet-table/mock-table-data';
import { ProfileTimeSheetDetail } from '../store/model/timesheets.model';

@Injectable()
export class TimesheetsApiService {
  private MOK_TIME_SHEETS: ITimesheet[] = MOK_TIMESHEETS;
  private MOK_PROFILES: ProfileTimeSheetDetail[] = mockProfileTableData;

  public getTimesheets(filters: ITimesheetsFilter): Observable<TimeSheetsPage> {
    return of({
      items: this.MOK_TIME_SHEETS,
      totalPages: 2,
      pageNumber: filters.pageNumber,
      totalCount: 32,
      hasNextPage: true,
      hasPreviousPage: false
    }).pipe(map(res => ({
      ...res,
      items: this.filterArray(res.items, Object.assign({}, filters, { pageNumber: res.totalCount <= filters.pageSize ? 1 : res.pageNumber })),
      pageNumber: res.totalCount <= filters.pageSize ? 1 : res.pageNumber
    })));
  }

  private filterArray(arr: any[], filters: ITimesheetsFilter): any[] {
    return arr.filter((el, idx) => {
      return filters.pageNumber === 1 ?
        idx < filters.pageSize * filters.pageNumber :
        idx >= filters.pageSize && idx < filters.pageSize * filters.pageNumber;
    });
  }

  public getProfileTimesheets(): Observable<ProfileTimeSheetDetail[]> {
    return of(this.MOK_PROFILES);
  }

  public postProfileTimesheets(body: ProfileTimeSheetDetail): Observable<null> {
    this.MOK_PROFILES = [...this.MOK_PROFILES, Object.assign({}, body, { total: body.hours * body.rate })];

    return of(null);
  }
}
