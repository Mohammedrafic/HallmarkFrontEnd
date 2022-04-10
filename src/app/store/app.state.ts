import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';
import { ToggleMobileView, ToggleTheme, SetSidebarMenu, SetHeaderState, ToggleSidebarState } from './app.actions';

export interface AppStateModel {
  sideBarMenu: any; // TODO: create model
  isMobile: boolean;
  isDarkTheme: boolean;
  headerState: any; // TODO: create model
  isLoading: boolean;
  isSidebarOpened: boolean;
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    sideBarMenu: null,
    isMobile: false,
    isDarkTheme: true,
    headerState: null,
    isLoading: false,
    isSidebarOpened: true
  },
})
@Injectable()
export class AppState {
  @Selector()
  static isMobile(state: AppStateModel): boolean { return state.isMobile; }

  @Selector()
  static isLoading(state: AppStateModel): boolean { return state.isLoading; }

  @Selector()
  static sideBarMenu(state: AppStateModel): boolean { return state.sideBarMenu; }

  @Selector()
  static headerState(state: AppStateModel): boolean { return state.headerState; }

  @Selector()
  static isDarkTheme(state: AppStateModel): boolean { return state.isDarkTheme; }

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

  @Action(SetSidebarMenu)
  SetSidebarMenu({ patchState }: StateContext<AppStateModel>, { payload }: SetSidebarMenu): void {
    patchState({ sideBarMenu: payload });
  }

  @Action(SetHeaderState)
  SetHeaderState({ patchState }: StateContext<AppStateModel>, { payload }: SetHeaderState): void {
    patchState({ headerState: payload });
  }

  @Action(ToggleSidebarState)
  SetSidebarState({ patchState }: StateContext<AppStateModel>, { payload }: ToggleSidebarState): void {
    patchState({ isSidebarOpened: payload });
  }
}
