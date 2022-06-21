import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';

import { ITimesheet, ITimesheetsFilter } from '../interface/i-timesheet.interface';
import { TimeSheetsPage } from '../store/model/timesheets.model';
import { MOK_TIMESHEETS } from '../constants/timesheets.constant';
import { map } from 'rxjs/operators';
import { mockProfileTableData } from '../components/profile-timesheet-table/mock-table-data';
import { ProfileTimeSheetDetail } from '../store/model/timesheets.model';

@Injectable()
export class TimesheetsApiService {
  private MOK_TIME_SHEETS: ITimesheet[] = MOK_TIMESHEETS;

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
    console.log(arr, 'arr');
    console.log(filters, 'filters');

    return arr.filter((el, idx) => {
      return filters.pageNumber === 1 ?
        idx < filters.pageSize * filters.pageNumber :
        idx >= filters.pageSize && idx < filters.pageSize * filters.pageNumber;
    });
  }

  public getProfileTimesheets(): Observable<ProfileTimeSheetDetail[]> {
    return of(mockProfileTableData);
  }
}
