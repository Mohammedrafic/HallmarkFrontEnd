import { Injectable } from '@angular/core';

import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';

import { PreservedFiltersService } from '@shared/services/preserved-filters.service';
import {
  ClearPageFilters,
  GetPreservedFiltersByPage,
  ResetPageFilters,
  SaveFiltersByPageName,
} from './preserved-filters.actions';

import { PreservedFiltersByPage } from '@core/interface/preserved-filters.interface';

export interface PreservedFiltersStateModel {
  preservedFiltersByPageName: PreservedFiltersByPage<unknown>;
}

@State<PreservedFiltersStateModel>({
  name: 'preservedFilters',
  defaults: {
    preservedFiltersByPageName: { state: null, isNotPreserved: true, dispatch: false },
  },
})
@Injectable()
export class PreservedFiltersState {
  constructor(private preservedFIltersService: PreservedFiltersService) {}

  @Selector()
  static preservedFiltersByPageName(
    state: PreservedFiltersStateModel
  ): PreservedFiltersStateModel['preservedFiltersByPageName'] {
    return state.preservedFiltersByPageName;
  }

  @Selector()
  static preservedFiltersState(state: PreservedFiltersStateModel): unknown {
    return state.preservedFiltersByPageName.state;
  }

  @Action(GetPreservedFiltersByPage)
  GetPreservedPageFilters(
    { patchState }: StateContext<PreservedFiltersStateModel>,
    { pageName }: GetPreservedFiltersByPage
  ): Observable<PreservedFiltersByPage<unknown>> {
    return this.preservedFIltersService.getPreservedFilterState(pageName).pipe(
      tap((response) => {
        patchState({ preservedFiltersByPageName: response });
      })
    );
  }

  @Action(SaveFiltersByPageName)
  SaveFiltersByPageName(
    { patchState }: StateContext<PreservedFiltersStateModel>,
    { pageName, filterState }: SaveFiltersByPageName
  ): Observable<PreservedFiltersByPage<unknown>> {
    return this.preservedFIltersService.saveFiltersByPageName(pageName, filterState).pipe(
      tap((response) => {
        patchState({ preservedFiltersByPageName: response });
      })
    );
  }

  @Action(ClearPageFilters)
  ClearPageFilters({ patchState }: StateContext<PreservedFiltersStateModel>, { pageName }: ClearPageFilters) {
    return this.preservedFIltersService.clearPageFilters(pageName).pipe(
      tap(() => {
        patchState({ preservedFiltersByPageName: { state: null, isNotPreserved: true, dispatch: false } });
      })
    );
  }

  @Action(ResetPageFilters)
  ResetPageFilters({ patchState }: StateContext<PreservedFiltersStateModel>) {
    patchState({ preservedFiltersByPageName: { state: null, isNotPreserved: true, dispatch: false } });
  }
}
