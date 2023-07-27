import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';

import { Store } from '@ngxs/store';
import { map, Observable } from 'rxjs';

import { FilterPageName } from '@core/enums';
import { PreservedFiltersByPage } from '@core/interface';
import { OpenJobFilter,  PreservedFilters } from '../interfaces';
import { JobFilterService } from '../services';
import { GetPreservedFiltersByPage } from '../../../store/preserved-filters.actions';

@Injectable()
export class OpenJobResolver implements Resolve<PreservedFilters> {
  constructor(
    private store: Store,
    private jobFilterService: JobFilterService,
  ) {}

  resolve(): Observable<PreservedFilters> {
    return this.store.dispatch(new GetPreservedFiltersByPage(FilterPageName.EmployeeOpenJobs)).pipe(
      map(({preservedFilters}) => {
        return preservedFilters.preservedFiltersByPageName;
      }),
      map((filters: PreservedFiltersByPage<OpenJobFilter>) => {
        return this.jobFilterService.getUpdatedFilters(filters);
      }),
    );
  }
}
