import { Injectable } from '@angular/core';

import { filter, Observable } from 'rxjs';
import { SortChangedEvent } from '@ag-grid-community/core';

import { OpenJobPage } from '@shared/models';

import { FiltersState } from '../interfaces';
import { MyJobsApiService } from './my-jobs-api.service';
import { MyJobsFilterService } from './my-jobs-filter.service';

@Injectable()
export class MyJobsService {
  constructor(
    private myJobsApiService: MyJobsApiService,
    private myJobsFilterService: MyJobsFilterService
  ) {}

  sortMyJobsGrid(event: SortChangedEvent): void {
    const columnWithSort = event.columnApi.getColumnState().find((col) => col.sort !== null);
    const orderBy = columnWithSort ? {orderBy: `${columnWithSort.colId} ${columnWithSort.sort}`} : {orderBy: null};

    this.myJobsFilterService.setFilters(orderBy);
  }

  getMyJobs(filters: FiltersState): Observable<OpenJobPage> {
    return this.myJobsApiService.getMyJobsPage(filters).pipe(
      filter((openJobPage: OpenJobPage) => !!openJobPage),
    );
  }
}
