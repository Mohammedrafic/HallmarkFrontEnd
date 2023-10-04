import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';

import { FilterPageName } from '@core/enums';
import { PreservedFiltersByPage } from '@core/interface';
import { GetPreservedFiltersByPage } from 'src/app/store/preserved-filters.actions';

import { MyJobsFilterService } from '../services/my-jobs-filter.service';
import { OpenJobFilter, PreservedFilters } from '../interfaces';

@Injectable()
export class MyJobsResolver implements Resolve<PreservedFilters> {
  constructor(
    private store: Store,
    private myJobsFilterService: MyJobsFilterService,
  ) {}

  resolve(): Observable<PreservedFilters> {
    return this.store.dispatch(new GetPreservedFiltersByPage(FilterPageName.EmployeeMyJobs)).pipe(
      map(({ preservedFilters }) => {
        return preservedFilters.preservedFiltersByPageName;
      }),
      map((filters: PreservedFiltersByPage<OpenJobFilter>) => {
        return this.myJobsFilterService.getUpdatedFilters(filters);
      }),
    );
  }
}
