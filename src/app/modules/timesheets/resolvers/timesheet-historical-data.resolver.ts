import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Store } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { Timesheets } from '../store/actions/timesheets.actions';

@Injectable()
export class TimesheetHistoricalDataResolver implements Resolve<boolean> {
  constructor(private http: HttpClient, private store: Store) {}

  resolve(): Observable<boolean> {
    return this.http.get<boolean>('/api/FeaturesConfiguration/IsEnabled/DisplayTimesheetHistoricalData')
      .pipe(
        tap((value) => {
          this.store.dispatch(new Timesheets.SetDisplayTimesheetHistoricalData(value));
        }),
      );
  }
}
