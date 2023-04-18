import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { PreservedFiltersService } from '@shared/services/preserved-filters.service';
import {
  ClearPageFilters,
  GetPreservedFiltersByPage,
  InitPreservedFilters,
  ResetPageFilters,
  SaveFiltersByPageName,
  SetPreservedFilters,
} from './preserved-filters.actions';
import { PreservedFilters } from '@shared/models/preserved-filters.model';
import { PreservedFiltersGlobal } from '@shared/models/preserved-filters.model';
import { SetPreservedFiltersForTimesheets } from './preserved-filters.actions';
import { PreservedFiltersByPage } from '@core/interface/preserved-filters.interface';

export interface PreservedFiltersStateModel {
  preservedFilters: PreservedFilters | null;
  preservedFiltersGlobal: PreservedFiltersGlobal | null;
  preservedFiltersTimesheets: PreservedFilters | null;
  preservedFiltersByPageName: PreservedFiltersByPage<unknown>;
}

@State<PreservedFiltersStateModel>({
  name: 'preservedFilters',
  defaults: {
    preservedFilters: null,
    preservedFiltersGlobal: null,
    preservedFiltersTimesheets: null,
    preservedFiltersByPageName: { state: null, isNotPreserved: true, dispatch: false },
  },
})
@Injectable()
export class PreservedFiltersState {
  constructor(private preservedFIltersService: PreservedFiltersService) {}

  @Selector()
  static preservedFilters(state: PreservedFiltersStateModel): PreservedFilters | null {
    return state.preservedFilters;
  }

  @Selector()
  static preservedFiltersGlobal(state: PreservedFiltersStateModel): PreservedFiltersGlobal | null {
    return state.preservedFiltersGlobal;
  }

  @Selector()
  static preservedFiltersTimesheets(state: PreservedFiltersStateModel): PreservedFilters | null {
    return state.preservedFiltersTimesheets;
  }

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

  //TODO remove after implementing preserving filters by page
  @Action(InitPreservedFilters)
  InitPreservedFilters({ patchState }: StateContext<PreservedFiltersStateModel>): Observable<{ state: string }> {
    return this.preservedFIltersService.getPreservedFilters().pipe(
      tap((filters: { state: string }) => {
        const state = JSON.parse(filters.state);
        return patchState({
          preservedFilters: state.filters || null,
          preservedFiltersGlobal: state.global || null,
          preservedFiltersTimesheets: state.timesheets || null,
        });
      })
    );
  }

  //TODO remove after implementing preserving filters by page
  @Action(SetPreservedFilters)
  SetPreservedFilters(
    { patchState, getState }: StateContext<PreservedFiltersStateModel>,
    { payload, isGlobal }: SetPreservedFilters
  ): Observable<string> {
    if (isGlobal) {
      patchState({ preservedFiltersGlobal: payload as PreservedFiltersGlobal });
    } else {
      patchState({ preservedFilters: payload as PreservedFilters });
    }
    const state = getState();
    return this.preservedFIltersService.setPreservedFilters(
      JSON.stringify({
        filters: state.preservedFilters,
        global: state.preservedFiltersGlobal,
        timesheets: state.preservedFiltersTimesheets,
      })
    );
  }

  //TODO remove after implementing preserving filters by page
  @Action(SetPreservedFiltersForTimesheets)
  SetPreservedFiltersForTimesheets(
    { patchState, getState }: StateContext<PreservedFiltersStateModel>,
    { payload }: SetPreservedFilters
  ): Observable<string> {
    patchState({ preservedFiltersTimesheets: payload as PreservedFilters });
    const state = getState();
    return this.preservedFIltersService.setPreservedFilters(
      JSON.stringify({
        filters: state.preservedFilters,
        global: state.preservedFiltersGlobal,
        timesheets: state.preservedFiltersTimesheets,
      })
    );
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
