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
  GetAlertsForCurrentUser,
  CheckScreen,
  ShouldDisableUserDropDown,
  SetIrpFlag,
  GetDeviceScreenResolution,
} from './app.actions';
import { HeaderState } from '../shared/models/header-state.model';
import { IsOrganizationAgencyAreaStateModel } from '@shared/models/is-organization-agency-area-state.model';
import { map, Observable, tap } from 'rxjs';
import { IS_DARK_THEME } from '@shared/constants';
import { BreakpointObserverService } from '@core/services';
import { BreakpointQuery } from '@shared/enums/media-query-breakpoint.enum';

export interface AppStateModel {
  isMobile: boolean;
  isDarkTheme: boolean;
  headerState: HeaderState | null;
  isLoading: boolean;
  isFirstLoad: boolean;
  isSidebarOpened: boolean;
  isOrganizationAgencyArea: IsOrganizationAgencyAreaStateModel;
  getAlertsForCurrentUser: GetAlertsForUserStateModel[];
  isMobileScreen: boolean;
  isTabletScreen: boolean;
  isDekstopScreen: boolean;
  shouldDisableUserDropDown: boolean;
  isIrpEnabled: boolean;
  breakpoints: {
    isMobile: boolean;
    isTablet: boolean;
    isDesktopSmall: boolean;
    isDesktopLarge: boolean;
  };
}

@State<AppStateModel>({
  name: 'app',
  defaults: {
    isMobile: false,
    isDarkTheme: (JSON.parse(window.localStorage.getItem(IS_DARK_THEME) as string) as boolean) || false,
    headerState: null,
    isLoading: false,
    isFirstLoad: true,
    isSidebarOpened: false,
    isOrganizationAgencyArea: {
      isOrganizationArea: false,
      isAgencyArea: false,
    },
    getAlertsForCurrentUser: [],
    isMobileScreen: false,
    isTabletScreen: false,
    isDekstopScreen: false,
    shouldDisableUserDropDown: false,
    isIrpEnabled: false,
    breakpoints: {
      isMobile: false,
      isTablet: false,
      isDesktopSmall: false,
      isDesktopLarge: false,
    },
  },
})
@Injectable()
export class AppState {
  constructor(private userService: UserService, private breakpointObserver: BreakpointObserverService) {}

  @Selector()
  static isMobile(state: AppStateModel): boolean {
    return state.isMobile;
  }

  @Selector()
  static isLoading(state: AppStateModel): boolean {
    return state.isLoading;
  }

  @Selector()
  static headerState(state: AppStateModel): HeaderState | null {
    return state.headerState;
  }

  @Selector()
  static isDarkTheme(state: AppStateModel): boolean {
    return state.isDarkTheme;
  }

  @Selector()
  static isFirstLoad(state: AppStateModel): boolean {
    return state.isFirstLoad;
  }

  @Selector()
  static isSidebarOpened(state: AppStateModel): boolean {
    return state.isSidebarOpened;
  }

  @Selector()
  static isOrganizationAgencyArea(state: AppStateModel): IsOrganizationAgencyAreaStateModel {
    return state.isOrganizationAgencyArea;
  }

  @Selector()
  static getAlertsForCurrentUser(state: AppStateModel): GetAlertsForUserStateModel[] {
    return state.getAlertsForCurrentUser;
  }

  @Selector()
  static isMobileScreen(state: AppStateModel): boolean {
    return state.isMobileScreen;
  }

  @Selector()
  static isTabletScreen(state: AppStateModel): boolean {
    return state.isTabletScreen;
  }

  @Selector()
  static isDekstopScreen(state: AppStateModel): boolean {
    return state.isDekstopScreen;
  }

  @Selector()
  static shouldDisableUserDropDown(state: AppStateModel): boolean {
    return state.shouldDisableUserDropDown;
  }

  @Selector()
  static isIrpFlagEnabled(state: AppStateModel): boolean {
    return state.isIrpEnabled;
  }

  @Selector()
  static getDeviceScreenResolution(state: AppStateModel): AppStateModel['breakpoints'] {
    return state.breakpoints;
  }

  @Action(ToggleMobileView)
  ToggleMobileView({ patchState }: StateContext<AppStateModel>, { payload }: ToggleMobileView): void {
    patchState({ isMobile: payload });
  }

  @Action(ToggleTheme)
  ToggleTheme({ patchState }: StateContext<AppStateModel>, { payload }: ToggleTheme): void {
    patchState({ isDarkTheme: payload });
    window.localStorage.setItem(IS_DARK_THEME, JSON.stringify(payload));
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
  SetIsOrganizationAgencyArea(
    { patchState }: StateContext<AppStateModel>,
    { payload }: SetIsOrganizationAgencyArea
  ): void {
    patchState({ isOrganizationAgencyArea: payload });
  }

  @Action(GetAlertsForCurrentUser)
  GetAlertsForCurrentUser(
    { patchState }: StateContext<AppStateModel>,
    { payload }: GetAlertsForCurrentUser
  ): Observable<AlertsModel[]> {
    return this.userService.getAlertsForUser().pipe(
      tap((payload) => {
        patchState({ getAlertsForCurrentUser: payload });
        return payload;
      })
    );
  }

  @Action(CheckScreen)
  checkScreen({ patchState }: StateContext<AppStateModel>): void {
    this.breakpointObserver
      .listenBreakpoint([BreakpointQuery.MOBILE_MAX])
      .pipe(map(({ matches }) => matches))
      .subscribe((res) => {
        patchState({ isMobileScreen: res });
      });
    this.breakpointObserver
      .listenBreakpoint([BreakpointQuery.TABLET_MIN])
      .pipe(map(({ matches }) => matches))
      .subscribe((res) => {
        patchState({ isTabletScreen: res });
      });
    this.breakpointObserver
      .listenBreakpoint([BreakpointQuery.DESKTOP_SM_MIN])
      .pipe(map(({ matches }) => matches))
      .subscribe((res) => {
        patchState({ isDekstopScreen: res });
      });
  }

  @Action(ShouldDisableUserDropDown)
  ShouldDisableUserDropDown({ patchState }: StateContext<AppStateModel>, { payload }: ShouldDisableUserDropDown): void {
    patchState({ shouldDisableUserDropDown: payload });
  }

  @Action(SetIrpFlag)
  SetIrpFlag({ patchState }: StateContext<AppStateModel>, { irpEnabled }: SetIrpFlag): void {
    patchState({
      isIrpEnabled: irpEnabled,
    });
  }

  @Action(GetDeviceScreenResolution)
  GetDeviceScreenResolution({ patchState }: StateContext<AppStateModel>) {
    this.breakpointObserver
      .getBreakpointMediaRanges()
      .subscribe(({ isMobile, isTablet, isDesktopSmall, isDesktopLarge }) => {
        patchState({
          breakpoints: {
            isMobile,
            isTablet,
            isDesktopSmall,
            isDesktopLarge,
          },
        });
      });
  }
}
