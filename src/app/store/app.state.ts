import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';

import { ToggleMobileView, ToggleTheme, SetHeaderState, ToggleSidebarState, SetIsFirstLoadState } from './app.actions';
import { HeaderState } from '../shared/models/header-state.model';

export interface AppStateModel {
  isMobile: boolean;
  isDarkTheme: boolean;
  headerState: HeaderState | null;
  isLoading: boolean;
  isFirstLoad: boolean;
  isSidebarOpened: boolean;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    isMobile: false,
    isDarkTheme: false,
    headerState: null,
    isLoading: false,
    isFirstLoad: true,
    isSidebarOpened: false
  },
})
@Injectable()
export class AppState {
  @Selector()
  static isMobile(state: AppStateModel): boolean { return state.isMobile; }

  @Selector()
  static isLoading(state: AppStateModel): boolean { return state.isLoading; }

  @Selector()
  static headerState(state: AppStateModel): HeaderState | null { return state.headerState; }

  @Selector()
  static isDarkTheme(state: AppStateModel): boolean { return state.isDarkTheme; }

  @Selector()
  static isFirstLoad(state: AppStateModel): boolean { return state.isFirstLoad; }

  @Selector()
  static isSidebarOpened(state: AppStateModel): boolean { return state.isSidebarOpened; }

  @Action(ToggleMobileView)
  ToggleMobileView({ patchState }: StateContext<AppStateModel>, { payload }: ToggleMobileView): void {
    patchState({ isMobile: payload });
  }

  @Action(ToggleTheme)
  ToggleTheme({ patchState }: StateContext<AppStateModel>, { payload }: ToggleTheme): void {
    patchState({ isDarkTheme: payload });
  }

  @Action(SetHeaderState)
  SetHeaderState({ patchState }: StateContext<AppStateModel>, { payload }: SetHeaderState): void {
    patchState({ headerState: payload });
  }

  @Action(ToggleSidebarState)
  SetSidebarState({ patchState }: StateContext<AppStateModel>, { payload }: ToggleSidebarState): void {
    patchState({ isSidebarOpened: payload });
  }

  @Action(SetIsFirstLoadState)
  SetIsFirstLoadState({ patchState }: StateContext<AppStateModel>, { payload }: SetIsFirstLoadState): void {
    patchState({ isFirstLoad: payload });
  }
}
