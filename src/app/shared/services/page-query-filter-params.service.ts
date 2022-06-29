import toNumber from 'lodash/fp/toNumber';
import isEqual from 'lodash/fp/isEqual';
import { Observable, map, distinctUntilChanged } from 'rxjs';

import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { GRID_CONFIG } from '@shared/constants';

export interface PageQueryParams extends Record<string, unknown> {
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class PageQueryFilterParamsService {
  public readonly pageQueryParams$: Observable<PageQueryParams> = this.getPageQueryParams();

  public constructor(private readonly activatedRoute: ActivatedRoute, private readonly router: Router) {}

  public changePage(page: number): void {
    this.changeQueryParams({ page });
  }

  public changePageSize(pageSize: number): void {
    this.changeQueryParams({ pageSize, page: GRID_CONFIG.initialPage });
  }

  private changeQueryParams(queryParams: Params): void {
    this.router.navigate([], { queryParams, queryParamsHandling: 'merge' });
  }

  private getPageQueryParams(): Observable<PageQueryParams> {
    return this.activatedRoute.queryParams.pipe(
      map((queryParams: Params) => {
        const { page, pageSize } = queryParams;

        return {
          page: toNumber(page) || GRID_CONFIG.initialPage,
          pageSize: toNumber(pageSize) || GRID_CONFIG.initialRowsPerPage,
        };
      }),
      distinctUntilChanged((previous: PageQueryParams, current: PageQueryParams) => isEqual(previous, current))
    );
  }
}
