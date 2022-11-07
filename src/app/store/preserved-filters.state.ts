import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Observable, tap } from 'rxjs';
import { PreservedFiltersService } from '@shared/services/preserved-filters.service';
import { InitPreservedFilters, SetPreservedFilters } from './preserved-filters.actions';
import { PreservedFilters } from '@shared/models/preserved-filters.model';

export interface PreservedFiltersStateModel {
  preservedFilters: PreservedFilters | null;
}

@State<PreservedFiltersStateModel>({
  name: 'preservedFilters',
  defaults: {
    preservedFilters: null,
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

  @Action(InitPreservedFilters)
  InitPreservedFilters({ patchState }: StateContext<PreservedFiltersStateModel>): Observable<{state: string}> {
    return this.preservedFIltersService.getPreservedFilters().pipe(
      tap((filters: {state: string}) => {
        return patchState({ preservedFilters: JSON.parse(filters.state) });
      })
    );
  }

  @Action(SetPreservedFilters)
  SetPreservedFilters({ patchState }: StateContext<PreservedFiltersStateModel>, { payload }: SetPreservedFilters): Observable<string> {
    patchState({ preservedFilters: payload });
    return this.preservedFIltersService.setPreservedFilters(JSON.stringify(payload));
  }
}
