import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ITimesheet } from '../store/model/timesheets.model';

@Injectable()
export class TimesheetsApiService {
  private MOK_TIME_SHEETS: ITimesheet[] = [];

  public getTimesheets(filters: any): Observable<ITimesheet[]> {
    return of(this.MOK_TIME_SHEETS);
  }
}
