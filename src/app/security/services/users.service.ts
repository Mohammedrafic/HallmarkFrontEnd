import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
    Agency,
  Organisation,
  UserVisibilityFilter,
  UserVisibilitySettingBody,
  UserVisibilitySettingsPage,
} from '@shared/models/visibility-settings.model';
import { Observable, map } from 'rxjs';
import { RolesPerUser, turnOffNotification, User, UserDTO, UsersPage } from '@shared/models/user-managment-page.model';
import { ExportPayload } from '@shared/models/export.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private http: HttpClient) {}

  /**
   * Get the list of users by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitId
   * @param PageNumber
   * @param PageSize
   *
   * @return UsersPage
   */
  public getUsersPage(
    BusinessUnitType: BusinessUnitType,
    BusinessUnitIds: number[] | null,
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any
  ): Observable<UsersPage> {
    return this.http.post<UsersPage>(`/api/Users/Filtered`, { BusinessUnitType, BusinessUnitIds, PageNumber, PageSize, SortModel, FilterModel });
  }

  public turnOffSubscription(
    BusinessUnitType: BusinessUnitType,
    userId: string,
    AlertChannel? : string,
    Enabled? : boolean
  ): Observable<turnOffNotification> {
    return this.http.post<turnOffNotification>(`/api/UserSubscription/IRPturnoffallsubscriptions`, { userId, BusinessUnitType, AlertChannel, Enabled });
  }

  /**
   * Get the list of users by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitId
   * @param PageNumber
   * @param PageSize
   *
   * @return UsersPage
   */
   public getAllUsersPage(
    BusinessUnitType: BusinessUnitType,
    BusinessUnitIds: number[],
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any,
    GetAll:boolean
  ): Observable<UsersPage> {
    return this.http.post<UsersPage>(`/api/Users/Filtered`, { BusinessUnitType, BusinessUnitIds, PageNumber, PageSize, SortModel, FilterModel ,GetAll}).pipe(map((data) => ({ ...data, items: sortByField(data.items, 'fullName')})));
  }

  /**
   * Get the list of roles for user by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitId
   *
   * @return RolesPerUser
   */
  public getRolesPerUser(BusinessUnitType: BusinessUnitType, BusinessUnitIds: number[]): Observable<RolesPerUser[]> {
    return this.http.post<RolesPerUser[]>(`/api/Roles/basicinfo`,  { BusinessUnitType, BusinessUnitIds } );
  }

  /**
   * Save User
   * @param UserDTO
   * @return User
   */
  public saveUser(user: UserDTO): Observable<User> {
    return user.metadata.id ? this.http.put<User>(`/api/Users`, user) : this.http.post<User>(`/api/Users`, user);
  }

  /**
   * Get the list of User Visibility Settings
   * @param filters of type UserVisibilityFilter
   * @return UserVisibilitySettingsPage
   */
  public getUserVisibilitySettingsPage(filters: UserVisibilityFilter): Observable<UserVisibilitySettingsPage> {
    return this.http.post<UserVisibilitySettingsPage>(`/api/UserVisibilitySettings/filter`,filters);
  }

  /**
   * Create or update UserVisibilitySettings
   * @param body object to save
   * @return UserVisibilitySettingsPage
   */
  public saveUserVisibilitySettings(body: UserVisibilitySettingBody): Observable<UserVisibilitySettingsPage> {
    return this.http.put<UserVisibilitySettingsPage>(`/api/UserVisibilitySettings`, body);
  }

  /**
   * Remove UserVisibilitySettings
   * @param id
   * @param userId
   */
  public removeUserVisibilitySettings(id: number, userId: string): Observable<never> {
    const params: any = { userId };

    if (id !== null) {
      params.id = id;
    }

    return this.http.delete<never>(`/api/UserVisibilitySettings`, { params });
  }

  /**
   * Get the list of Organisation
   * @param userId
   * @return UserVisibilitySettingsPage
   */
  public getUserVisibilitySettingsOrganisation(userId: string, visibilitySettings: boolean = false): Observable<Organisation[]> {
    return this.http
      .get<Organisation[]>(`/api/Organizations/structure/All/${userId}/${visibilitySettings}`)
      .pipe(
        map((organizations) =>
          sortByField(organizations, 'name').map((org) => ({
            ...org,
            regions: sortByField(org.regions, 'name').map((region) => ({
              ...region,
              organizationId: org.organizationId,
              regionId: region.id,
              locations: sortByField(region.locations, 'name').map((location) => ({
                ...location,
                organizationId: org.organizationId,
                regionId: region.id,
                locationId: location.id,
                departments: sortByField(location.departments, 'name').map((department) => ({
                  ...department,
                  organizationId: org.organizationId,
                  regionId: region.id,
                  locationId: location.id,
                })),
              })),
            })),
          }))
        )
      );
  }

  /**
   * Get the list of Agencies
   */
  public getAgencyList(): Observable<Agency[]> {
    return this.http
      .get<Agency[]>(`/api/Agency/agencylist`).pipe(map((data) => sortByField(data, 'name')));
  }

  /**
   * Migrate candidates
   * params agencyId is optional
   */
  public migrateCandidates(agencyId: number = 0): Observable<any> {
    const body = { NG_Agency_BusinessUnitID: agencyId };
    return this.http.post<any>('/api/LegacyCandidateMigration/LegacycandidatesProfilelist', body);
  }

  /**
   * remaning candidates for migration
   * params agencyId is optional
   */
  public remaningCandidatesForMigration(agencyId: number = 0): Observable<any> {
    const body = { NG_Agency_BusinessUnitID: agencyId };
    return this.http.post<any>('/api/LegacyCandidateMigration/NonSyncedLegacyCandidatesCount', body);
  }
  /**
   * Export users list
   * @param payload
   */
  public export(payload: ExportPayload): Observable<Blob> {
    return this.http.post(`/api/Users/export`, payload, { responseType: 'blob' });
  }

  public resendWelcomeEmail(userId: string): Observable<void> {
    return this.http.post<void>('/api/Users/resendwelcomeemail', { userId });
  }

  public importUsers(file: FormData): Observable<void> {
    return this.http.post<void>('/api/Users/import', file);
  }

  public getEmployeeUsers(businessUnitId:number): Observable<User[]>
  {
    return this.http.get<User[]>(`/api/Users/getemployeeusers/?BusinessUnitId=${businessUnitId}`)
      .pipe(map((data) => sortByField(data, 'name')));
  }

  public getNonEmployeeUsers(businessUnitId:number): Observable<User[]>
  {
    return this.http.get<User[]>(`/api/Users/getnonemployeeusers/?BusinessUnitId=${businessUnitId}`)
      .pipe(map((data) => sortByField(data, 'name')));
  }
}
