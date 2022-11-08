import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { PreservedFiltersService } from '@shared/services/preserved-filters.service';
import { InitPreservedFilters, SetPreservedFilters } from './preserved-filters.actions';
import { PreservedFilters } from '@shared/models/preserved-filters.model';
import { PreservedFiltersGlobal } from '@shared/models/preserved-filters.model';

export interface PreservedFiltersStateModel {
  preservedFilters: PreservedFilters | null;
  preservedFiltersGlobal: PreservedFiltersGlobal | null;
}

@State<PreservedFiltersStateModel>({
  name: 'preservedFilters',
  defaults: {
    preservedFilters: null,
    preservedFiltersGlobal: null,
  },
})
@Injectable()
export class PreservedFiltersState {
  constructor(
    private preservedFIltersService: PreservedFiltersService,
  ) {}

  @Selector()
  static preservedFilters(state: PreservedFiltersStateModel): PreservedFilters | null {
    return state.preservedFilters;
  }

  @Selector()
  static preservedFiltersGlobal(state: PreservedFiltersStateModel): PreservedFiltersGlobal | null {
    return state.preservedFiltersGlobal;
  }

  @Action(InitPreservedFilters)
  InitPreservedFilters({ patchState }: StateContext<PreservedFiltersStateModel>): Observable<{state: string}> {
    return this.preservedFIltersService.getPreservedFilters().pipe(
      tap((filters: {state: string}) => {
        const state = JSON.parse(filters.state);
        return patchState({ preservedFilters: state.filters || null, preservedFiltersGlobal: state.global || null });
      })
    );
  }

  @Action(SetPreservedFilters)
  SetPreservedFilters({ patchState, getState }: StateContext<PreservedFiltersStateModel>, { payload, isGlobal }: SetPreservedFilters): Observable<string> {
    if (isGlobal) {
      patchState({ preservedFiltersGlobal: payload as PreservedFiltersGlobal });
    } else {
      patchState({ preservedFilters: payload as PreservedFilters });
    }
    const state = getState();
    return this.preservedFIltersService.setPreservedFilters(JSON.stringify({ filters: state.preservedFilters, global: state.preservedFiltersGlobal }));
  }
}
