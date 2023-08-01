import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Observable } from 'rxjs';

import { BaseObservable } from '@core/helpers';
import { PreservedFiltersByPage } from '@core/interface';
import { AllOrderTypeOption, DefaultFilterState } from '../constants';
import { FiltersState, OpenJobFilter, PreservedFilters } from '../interfaces';

@Injectable()
export class JobFilterService {
  private readonly filterState: BaseObservable<FiltersState> = new BaseObservable<FiltersState>(
    {} as FiltersState
  );

  constructor(private fb: FormBuilder) {}

  public createFilterForm(): FormGroup {
    return this.fb.group({
      orderType: [null, Validators.required],
    });
  }

  public setFilters(filters: Partial<FiltersState>): void {
    this.filterState.set({
      ...this.filterState.get(),
      ...filters,
    });
  }

  public getFilters(): FiltersState {
   return this.filterState.get();
  }

  public getFilterStateStream(): Observable<FiltersState> {
    return this.filterState.getStream();
  }

  public getUpdatedFilters(preservedFilters: PreservedFiltersByPage<OpenJobFilter>): PreservedFilters {
    if (!preservedFilters.isNotPreserved) {
      return {
        filters: {
          ...DefaultFilterState,
          ...preservedFilters.state,
        },
        appliedFiltersAmount: Object.values(preservedFilters.state).length,
      };
    }

    return {
      filters: DefaultFilterState,
      appliedFiltersAmount: 0,
    };
  }

  public prepareOrderTypeField(filters: FiltersState): FiltersState {
    if(filters.orderType === AllOrderTypeOption) {
      return {
        ...filters,
        orderType: null,
      };
    }

    return filters;
  }
}
