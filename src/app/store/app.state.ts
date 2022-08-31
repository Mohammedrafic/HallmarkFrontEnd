import { GetAlertsForUserStateModel } from './../shared/models/get-alerts-for-user-state-model';
import { UserService } from './../shared/services/user.service';
import { AlertsModel } from './../shared/models/alerts-model';
import { Injectable } from '@angular/core';
import { State, Action, StateContext, Selector } from '@ngxs/store';

import {
  ToggleMobileView,
  ToggleTheme,
  SetHeaderState,
  ToggleSidebarState,
  SetIsFirstLoadState,
  SetIsOrganizationAgencyArea,
  GetAlertsForCurrentUser
} from './app.actions';
import { HeaderState } from '../shared/models/header-state.model';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { Observable, tap } from 'rxjs';

export interface AppStateModel {
  isMobile: boolean;
  isDarkTheme: boolean;
  headerState: HeaderState | null;
  isLoading: boolean;
  isFirstLoad: boolean;
  isSidebarOpened: boolean;
  isOrganizationAgencyArea: IsOrganizationAgencyAreaStateModel;
  getAlertsForCurrentUser: GetAlertsForUserStateModel[];
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    isMobile: false,
    isDarkTheme: false,
    headerState: null,
    isLoading: false,
    isFirstLoad: true,
    isSidebarOpened: false,
    isOrganizationAgencyArea: {
      isOrganizationArea: false,
      isAgencyArea: false
    },
    getAlertsForCurrentUser : []
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

  @Selector()
  static isOrganizationAgencyArea(state: AppStateModel): IsOrganizationAgencyAreaStateModel { return state.isOrganizationAgencyArea; }
  
  @Selector()
  static getAlertsForCurrentUser(state: AppStateModel): GetAlertsForUserStateModel[] { return state.getAlertsForCurrentUser; }

  constructor(private userService: UserService) {}

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

  @Action(SetIsOrganizationAgencyArea)
  SetIsOrganizationAgencyArea({ patchState }: StateContext<AppStateModel>, { payload }: SetIsOrganizationAgencyArea): void {
    patchState({ isOrganizationAgencyArea: payload });
  }
  
  @Action(GetAlertsForCurrentUser)
  GetAlertsForCurrentUser({ patchState }: StateContext<AppStateModel>, { payload }: GetAlertsForCurrentUser): Observable<AlertsModel[]> {
    return this.userService.getAlertsForUser().pipe(
      tap((payload) => {
        patchState({ getAlertsForCurrentUser: payload });        
        return payload;
      })
    );
  }
}
