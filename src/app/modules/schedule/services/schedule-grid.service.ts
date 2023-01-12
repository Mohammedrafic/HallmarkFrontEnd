import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { BaseObservable } from '@core/helpers';

@Injectable()
export class ScheduleGridService {
  private readonly search: BaseObservable<string> = new BaseObservable('');

  setSearch(searchCriteria: string): void {
    this.search.set(searchCriteria);
  }

  getSearchStream(): Observable<string> {
    return this.search.getStream();
  }
}
