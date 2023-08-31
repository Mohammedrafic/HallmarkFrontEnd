import { Injectable } from '@angular/core';

import { catchError, Observable, tap } from 'rxjs';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';

import { Organisation, UserVisibilitySettingsPage } from '@shared/models/visibility-settings.model';
import { BusinessUnit } from '@shared/models/business-unit.model';
import { BusinessUnitService } from '@shared/services/business-unit.service';

import {
  GetBusinessByUnitType,
  GetNewRoleBusinessByUnitType,
  GetRolesForCopy,
  GetPermissionsTree,
  GetIRPPermissionsTree,
  GetRolePerUser,
  GetRolesPage,
  GetUsersPage,
  RemoveRole,
  SaveRole,
  SaveRoleSucceeded,
  SaveUser,
  SaveUserSucceeded,
  GetUserVisibilitySettingsPage,
  SaveUserVisibilitySettings,
  SaveUserVisibilitySettingsSucceeded,
  RemoveUserVisibilitySetting,
  RemoveUserVisibilitySettingSucceeded,
  GetOrganizationsStructureAll,
  GetNewRoleBusinessByUnitTypeSucceeded,
  ExportUserList,
  ExportRoleList,
  GetAllUsersPage,
  ResendWelcomeEmail,
  ImportUsers,
  GetOrgInterfacePage,
  GetLogInterfacePage,
  GetLogHistoryById,
  GetBusinessForEmployeeType,
  GetEmployeeUsers,
  ExportTimeSheetList,
  GetLogFileDownload,
  GetNonEmployeeUsers,
} from './security.actions';
import { Role, RolesPage } from '@shared/models/roles.model';
import { RolesService } from '../services/roles.service';
import { PermissionsTree } from '@shared/models/permission.model';
import { RoleTreeField } from '../roles-and-permissions/role-form/role-form.component';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { DOCUMENT_DOWNLOAD_SUCCESS, EMAIL_RESEND_SUCCESS, RECORD_ADDED, RECORD_DELETE, RECORD_MODIFIED } from '@shared/constants/messages';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../services/users.service';
import { RolesPerUser, User, UsersPage } from '@shared/models/user-managment-page.model';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { getAllErrors } from '@shared/utils/error.utils';
import { saveSpreadSheetDocument } from '@shared/utils/file.utils';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { TimeZoneModel } from '@shared/models/location.model';
import { GetUSCanadaTimeZoneIds } from './security.actions';
import { NodatimeService } from '@shared/services/nodatime.service';
import { LogInterface, LogInterfacePage, LogTimeSheetHistory, LogTimeSheetHistoryPage, OrgInterface, OrgInterfacePage } from '@shared/models/org-interface.model';
import { OrgInterfaceService } from '../services/org-interface.service';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';

const BUSINNESS_DATA_DEFAULT_VALUE = { id: 0, name: 'All' };
const BUSINNESS_DATA_HALLMARK_VALUE = { id: 0, name: 'Hallmark' };

interface SecurityStateModel {
  bussinesData: BusinessUnit[];
  usersPage: UsersPage | null;
  allUsersPage: UsersPage | null;
  rolesPage: RolesPage | null;
  rolesPerUsers: RolesPerUser[] | null;
  permissionsTree: PermissionsTree;
  permissionsIRPTree:PermissionsTree;
  isNewRoleDataLoading: boolean;
  newRoleBussinesData: BusinessUnit[];
  userVisibilitySettingsPage: UserVisibilitySettingsPage | null;
  copyRoleData: Role[];
  organizations: Organisation[];
  timeZones: TimeZoneModel[] | null;
  orgInterfacePage: OrgInterfacePage | null;
  logInterfacePage: LogInterfacePage | null;
  logDialogOptions: DialogNextPreviousOption;
  logTimeSheetHistoryPage: LogTimeSheetHistoryPage | null;
  userData: User[];
  nonEmployeeUserData: User[];
  logFileDownloadDetail:any;
}

@State<SecurityStateModel>({
  name: 'security',
  defaults: {
    bussinesData: [],
    rolesPage: null,
    usersPage: null,
    allUsersPage: null,
    rolesPerUsers: [],
    permissionsTree: [],
    permissionsIRPTree:[],
    isNewRoleDataLoading: false,
    newRoleBussinesData: [],
    userVisibilitySettingsPage: null,
    copyRoleData: [],
    organizations: [],
    timeZones: [],
    orgInterfacePage: null,
    logInterfacePage: null,
    logDialogOptions: {
      next: false,
      previous: false,
    },
    logTimeSheetHistoryPage:null,
    userData: [],
    nonEmployeeUserData: [],
    logFileDownloadDetail:null
  },
})
@Injectable()
export class SecurityState {
  @Selector()
  static bussinesData(state: SecurityStateModel): BusinessUnit[] {
    return state.bussinesData;
  }

  @Selector()
  static roleGirdData(state: SecurityStateModel): Role[] {
    return state.rolesPage?.items || [];
  }

  @Selector()
  static rolesPerUsers(state: SecurityStateModel): RolesPerUser[] | null {
    return state.rolesPerUsers;
  }

  @Selector()
  static rolesPage(state: SecurityStateModel): RolesPage | null {
    return state.rolesPage;
  }

  @Selector()
  static userGridData(state: SecurityStateModel): User[] {
    return state.usersPage?.items || [];
  }

  @Selector()
  static usersPage(state: SecurityStateModel): UsersPage | null {
    return state.usersPage;
  }
  @Selector()
  static allUsersPage(state: SecurityStateModel): UsersPage | null {
    return state.allUsersPage;
  }

  @Selector()
  static userVisibilitySettingsPage(state: SecurityStateModel): UserVisibilitySettingsPage | null {
    return state.userVisibilitySettingsPage;
  }

  @Selector()
  static organisations(state: SecurityStateModel): Organisation[] {
    return state.organizations;
  }

  @Selector()
  static copyRoleData(state: SecurityStateModel): Role[] {
    return state.copyRoleData;
  }

  @Selector()
  static orgInterfaceGridData(state: SecurityStateModel): OrgInterface[] {
    return state.orgInterfacePage?.items || [];
  }

  @Selector()
  static orgInterfacePage(state: SecurityStateModel): OrgInterfacePage | null {
    return state.orgInterfacePage;
  }

  @Selector()
  static logInterfaceGridData(state: SecurityStateModel): LogInterface[] {
    return state.logInterfacePage?.items || [];
  }

  @Selector()
  static logInterfacePage(state: SecurityStateModel): LogInterfacePage | null {
    return state.logInterfacePage;
  }

  @Selector()
  static logDialogOptions(state: SecurityStateModel): DialogNextPreviousOption {
    return state.logDialogOptions;
  }

  @Selector()
  static logTimeSheetHistoryPage(state: SecurityStateModel): LogTimeSheetHistoryPage | null {
    return state.logTimeSheetHistoryPage;
  }

  @Selector()
  static logTimeSheetHistoryGridData(state: SecurityStateModel): LogTimeSheetHistory[] {
    return state.logTimeSheetHistoryPage?.items || [];
  }

  static getPermissionsForCopyById(id: number) {
    return createSelector([SecurityState], (state: SecurityStateModel): string[] => {
      const role = state.copyRoleData.find((role) => role.id === id);
      return role?.permissions.map(String) || [];
    });
  }

  @Selector()
  static roleTreeField(state: SecurityStateModel): RoleTreeField {
    return {
      dataSource: state.permissionsTree.filter(({ isAvailable }) => isAvailable),
      id: 'id',
      parentID: 'parentId',
      text: 'name',
      hasChildren: 'hasChild',
    };
  }

  @Selector()
  static permissionsTree(state: SecurityStateModel): PermissionsTree {
    return state.permissionsTree;
  }
  @Selector()
  static permissionsIRPTree(state: SecurityStateModel): PermissionsTree {
    return state.permissionsIRPTree;
  }

  @Selector()
  static isNewRoleDataLoading(state: SecurityStateModel): boolean {
    return state.isNewRoleDataLoading;
  }

  @Selector()
  static newRoleBussinesData(state: SecurityStateModel): (type: BusinessUnitType) => BusinessUnit[] {
    return (type: BusinessUnitType) =>
      type === BusinessUnitType.Hallmark
        ? ([BUSINNESS_DATA_DEFAULT_VALUE, ...state.newRoleBussinesData] as BusinessUnit[])
        : (state.newRoleBussinesData as BusinessUnit[]);
  }

  @Selector()
  static newBusinessDataPerUser(state: SecurityStateModel): (type: number) => BusinessUnit[] {
    return (type: number) =>
      type === 1
        ? ([BUSINNESS_DATA_HALLMARK_VALUE, ...state.newRoleBussinesData] as BusinessUnit[])
        : state.newRoleBussinesData;
  }

  @Selector()
  static businessUserData(state: SecurityStateModel): (type: number) => BusinessUnit[] {
    return (type: number) =>
      type === 1
        ? ([BUSINNESS_DATA_HALLMARK_VALUE, ...state.newRoleBussinesData] as BusinessUnit[])
        : ([BUSINNESS_DATA_DEFAULT_VALUE, ...state.newRoleBussinesData] as BusinessUnit[]);
  }

  @Selector()
  static timeZones(state: SecurityStateModel): TimeZoneModel[] | null {
    return state.timeZones;
  }

  @Selector()
  static userData(state: SecurityStateModel): User[] {
    return state.userData;
  }

  @Selector()
  static nonEmployeeUserData(state: SecurityStateModel): User[] {
    return state.nonEmployeeUserData;
  }

  @Selector()
  static logFileDownloadDetail(state: SecurityStateModel): any | null {
    return state.logFileDownloadDetail;
  }

  constructor(
    private businessUnitService: BusinessUnitService,
    private roleService: RolesService,
    private userService: UsersService,
    private nodatimeService: NodatimeService,  
    private orgInterfaceService: OrgInterfaceService
  ) {}

  @Action(GetBusinessByUnitType)
  GetBusinessByUnitType(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { type,isUsers }: GetBusinessByUnitType
  ): Observable<BusinessUnit[] | void> {
    return this.businessUnitService.getBusinessByUnitType(type,isUsers).pipe(
      tap((payload) => {
        patchState({ newRoleBussinesData: payload });
        patchState({ bussinesData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetNewRoleBusinessByUnitType)
  GetNewRoleBusinessByUnitType(
    { patchState, dispatch }: StateContext<SecurityStateModel>,
    { type,isusers }: GetNewRoleBusinessByUnitType
  ): Observable<BusinessUnit[] | void> {
    patchState({ isNewRoleDataLoading: true });
    return this.businessUnitService.getBusinessByUnitType(type,isusers).pipe(
      tap((payload) => {
        patchState({ isNewRoleDataLoading: false });
        patchState({ newRoleBussinesData: payload });
        dispatch(new GetNewRoleBusinessByUnitTypeSucceeded(type));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetRolesPage)
  GetRolesPage(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { businessUnitIds, businessUnitType, pageNumber, pageSize, sortModel, filterModel, filters }: GetRolesPage
  ): Observable<RolesPage | void> {
    return this.roleService
      .getRolesPage(businessUnitType, businessUnitIds, pageNumber, pageSize, sortModel, filterModel, filters)
      .pipe(
        tap((payload) => {
          patchState({ rolesPage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetRolePerUser)
  GetRolesPerPage(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { businessUnitType, businessUnitIds }: GetRolePerUser
  ): Observable<RolesPerUser[] | void> {
    return this.userService.getRolesPerUser(businessUnitType, businessUnitIds).pipe(
      tap((payload) => {
        patchState({ rolesPerUsers: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetUsersPage)
  GetUsersPage(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { businessUnitIds, businessUnitType, pageNumber, pageSize, sortModel, filterModel }: GetUsersPage
  ): Observable<UsersPage | void> {
    return this.userService
      .getUsersPage(businessUnitType, businessUnitIds, pageNumber, pageSize, sortModel, filterModel)
      .pipe(
        tap((payload) => {
          patchState({ usersPage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }
  @Action(GetAllUsersPage)
  GetAllUsersPage(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { businessUnitType, businessUnitIds, pageNumber, pageSize, sortModel, filterModel, getAll }: GetAllUsersPage
  ): Observable<UsersPage | void> {
    return this.userService
      .getAllUsersPage(businessUnitType, businessUnitIds, pageNumber, pageSize, sortModel, filterModel, getAll)
      .pipe(
        tap((payload) => {
          patchState({ allUsersPage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetPermissionsTree)
  GetPermissionsTree(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { type,businessUnitId}: GetPermissionsTree
  ): Observable<PermissionsTree | void> {
    patchState({ isNewRoleDataLoading: true });
    return this.roleService.getPermissionsTree(type,businessUnitId).pipe(
      tap((payload) => {
        patchState({ permissionsTree: payload });
        patchState({ isNewRoleDataLoading: false });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  @Action(GetIRPPermissionsTree)
  GetPermissionsIRPTree(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { type }: GetIRPPermissionsTree
  ): Observable<PermissionsTree | void> {
    patchState({ isNewRoleDataLoading: true });
    return this.roleService.getPermissionsIRPTree(type).pipe(
      tap((payload) => {
        patchState({ permissionsIRPTree: payload });
        patchState({ isNewRoleDataLoading: false });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveRole)
  SaveRole(
    { patchState, getState, dispatch }: StateContext<SecurityStateModel>,
    { role }: SaveRole
  ): Observable<Role | void> {
    const state = getState();
    return this.roleService.seveRoles(role).pipe(
      tap((payload) => {
        if (state.rolesPage && role.id) {
          const editedRole = state.rolesPage.items.find(({ id }) => id === role.id) as Role;
          const items = [
            ...state.rolesPage.items.filter(({ id }) => id !== editedRole.id),
            { ...editedRole, ...payload },
          ];
          const rolesPage = { ...state.rolesPage, items };
          patchState({ rolesPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else if (state.rolesPage) {
          const items = [...state.rolesPage?.items, payload];
          const rolesPage = { ...state.rolesPage, items };
          patchState({ rolesPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveRoleSucceeded(payload));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveUser)
  SaveUser(
    { patchState, getState, dispatch }: StateContext<SecurityStateModel>,
    { user }: SaveUser
  ): Observable<User | void> {
    const state = getState();
    return this.userService.saveUser(user).pipe(
      tap((payload) => {
        if (state.usersPage && user.metadata.id) {
          const editedUser = state.usersPage.items.find(({ id }) => id === user.metadata.id) as User;
          const items = [
            { ...editedUser, ...payload },
            ...state.usersPage.items.filter(({ id }) => id !== editedUser.id),
          ];
          const usersPage = { ...state.usersPage, items };
          patchState({ usersPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        } else if (state.usersPage) {
          const items = [payload, ...state.usersPage?.items];
          const usersPage = { ...state.usersPage, items } as UsersPage;
          patchState({ usersPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
        }
        dispatch(new SaveUserSucceeded(payload));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      })
    );
  }

  @Action(RemoveRole)
  RemoveRole({ dispatch, patchState, getState }: StateContext<SecurityStateModel>, { id }: RemoveRole): Observable<RolesPage | void> {
    const state = getState();
    return this.roleService.removeRoles(id).pipe(
      tap(() => {
        if (state.rolesPage) {
          const items = state.rolesPage?.items.filter((item) => item.id !== id);
          const rolesPage = { ...state.rolesPage, items };
          patchState({ rolesPage });
          dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetRolesForCopy)
  GetRolesForCopy({ patchState }: StateContext<SecurityStateModel>, { id, type }: GetRolesForCopy): Observable<Role[]> {
    return this.roleService.getRolesForCopy(type, id).pipe(
      tap((payload) => {
        patchState({ copyRoleData: payload });
      })
    );
  }

  @Action(GetUserVisibilitySettingsPage)
  GetUserVisibilitySettingsPage(
    { patchState, dispatch }: StateContext<SecurityStateModel>,
    { filters }: GetUserVisibilitySettingsPage
  ): Observable<UserVisibilitySettingsPage | void> {
    return this.userService.getUserVisibilitySettingsPage(filters).pipe(
      tap((payload) => {
        patchState({ userVisibilitySettingsPage: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        patchState({ userVisibilitySettingsPage: null });
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(SaveUserVisibilitySettings)
  SaveUserVisibilitySettings(
    { dispatch }: StateContext<SecurityStateModel>,
    { payload }: SaveUserVisibilitySettings
  ): Observable<UserVisibilitySettingsPage | void> {
    return this.userService.saveUserVisibilitySettings(payload).pipe(
      tap((payload) => {
        dispatch(new SaveUserVisibilitySettingsSucceeded());
        dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(RemoveUserVisibilitySetting)
  RemoveUserVisibilitySetting(
    { dispatch }: StateContext<SecurityStateModel>,
    { id, userId }: RemoveUserVisibilitySetting
  ): Observable<void> {
    return this.userService.removeUserVisibilitySettings(id, userId).pipe(
      tap(() => dispatch(new RemoveUserVisibilitySettingSucceeded())),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetOrganizationsStructureAll)
  GetOrganizationsStructureAll(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { userId }: GetOrganizationsStructureAll
  ): Observable<Organisation[] | void> {
    return this.userService.getUserVisibilitySettingsOrganisation(userId).pipe(
      tap((payload) => {
        payload.forEach(item => {
          item.regions.forEach(region => region.organisationName = item.name);
        });
        patchState({ organizations: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(ExportUserList)
  ExportUserList({}: StateContext<SecurityStateModel>, { payload }: ExportUserList): Observable<Blob> {
    return this.userService.export(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(ExportRoleList)
  ExportRoleList({}: StateContext<SecurityStateModel>, { payload }: ExportRoleList): Observable<Blob> {
    return this.roleService.export(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }
  @Action(GetUSCanadaTimeZoneIds)
  GetUSCanadaTimeZoneIds(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    {}: GetUSCanadaTimeZoneIds
  ): Observable<TimeZoneModel[] | void> {
    return this.nodatimeService.getUSCanadaTimeZoneIds().pipe(
      tap((payload) => {
        patchState({ timeZones: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      }),
    );
  }
  @Action(ResendWelcomeEmail)
  ResendWelcomeEmail({ dispatch }: StateContext<SecurityStateModel>, { userId }: ResendWelcomeEmail): Observable<void> {
    return this.userService.resendWelcomeEmail(userId)
    .pipe(
      tap(() => { dispatch(new ShowToast(MessageTypes.Success, EMAIL_RESEND_SUCCESS)); }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      }),
    );
  }

  @Action(ImportUsers)
  ImportUsers(
    { dispatch }: StateContext<SecurityStateModel>,
    { file }: ImportUsers,
  ): Observable<void> {
    return this.userService.importUsers(file)
    .pipe(
      tap(() => {
        dispatch(new ShowToast(MessageTypes.Success, 'Users were imported successfully'));
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error.error)));
      }),
    );
  }


  @Action(GetOrgInterfacePage)
  GetOrgInterfacePage(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { organizationId,  pageNumber, pageSize }: GetOrgInterfacePage
  ): Observable<OrgInterfacePage | void> {
    return this.orgInterfaceService
      .getOrgInterfacePage(organizationId, pageNumber, pageSize)
      .pipe(
        tap((payload) => {
          patchState({ orgInterfacePage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetLogInterfacePage)
  GetLogInterfacePage(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { organizationId,  pageNumber, pageSize }: GetLogInterfacePage
  ): Observable<LogInterfacePage | void> {
    return this.orgInterfaceService
      .getLogInterfacePage(organizationId, pageNumber, pageSize)
      .pipe(
        tap((payload) => {
          patchState({ logInterfacePage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }

  @Action(GetLogHistoryById)
  GetLogHistoryById(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { runId,organizationId,  pageNumber, pageSize, options }: GetLogHistoryById
  ): Observable<LogTimeSheetHistoryPage | void> {
    patchState({ logDialogOptions: options });
    return this.orgInterfaceService
      .getLogTimeSheetHistory(runId, organizationId, pageNumber, pageSize)
      .pipe(
        tap((payload) => {
          patchState({ logTimeSheetHistoryPage: payload });
          return payload;
        }),
        catchError((error: HttpErrorResponse) => {
          return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
        })
      );
  }
  
  @Action(GetLogFileDownload)
  GetLogFileDownload({ patchState, dispatch }: StateContext<SecurityStateModel>, { runId,organizationId }: GetLogFileDownload): Observable<any | void> {
    return this.orgInterfaceService.logFileDownload(runId,organizationId).pipe(
      tap((payload) => {
        patchState({ logFileDownloadDetail: payload });
        dispatch(new ShowToast(MessageTypes.Success, DOCUMENT_DOWNLOAD_SUCCESS));
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(ExportTimeSheetList)
  ExportTimeSheetList({}: StateContext<SecurityStateModel>, { payload }: ExportTimeSheetList): Observable<Blob> {
    return this.orgInterfaceService.export(payload).pipe(
      tap((file: Blob) => {
        const url = window.URL.createObjectURL(file);
        saveSpreadSheetDocument(url, payload.filename || 'export', payload.exportFileType);
      })
    );
  }

  @Action(GetBusinessForEmployeeType)
  GetBusinessForEmployeeType(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { }: GetBusinessForEmployeeType
  ): Observable<BusinessUnit[] | void> {
    return this.businessUnitService.getBusinessForEmployeeType().pipe(
      tap((payload) => {
        patchState({ bussinesData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
  
  @Action(GetEmployeeUsers)
  GetEmployeeUsers(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { businessUnitId }: GetEmployeeUsers
  ): Observable<User[] | void> {
    return this.userService.getEmployeeUsers(businessUnitId).pipe(
      tap((payload) => {
        patchState({ userData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }

  @Action(GetNonEmployeeUsers)
  GetNonEmployeeUsers(
    { dispatch, patchState }: StateContext<SecurityStateModel>,
    { businessUnitId }: GetNonEmployeeUsers
  ): Observable<User[] | void> {
    return this.userService.getNonEmployeeUsers(businessUnitId).pipe(
      tap((payload) => {
        patchState({ nonEmployeeUserData: payload });
        return payload;
      }),
      catchError((error: HttpErrorResponse) => {
        return dispatch(new ShowToast(MessageTypes.Error, error.error.detail));
      })
    );
  }
}
