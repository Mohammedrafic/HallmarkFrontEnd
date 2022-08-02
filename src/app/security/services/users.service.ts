import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {
  Organisation,
  UserVisibilitySettingBody,
  UserVisibilitySettingsPage,
} from '@shared/models/visibility-settings.model';
import { Observable } from 'rxjs';
import { RolesPerUser, User, UserDTO, UsersPage } from '@shared/models/user-managment-page.model';
import { ExportPayload } from '@shared/models/export.model';

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
    BusinessUnitId: number,
    PageNumber: number,
    PageSize: number,
    SortModel: any,
    FilterModel: any
  ): Observable<UsersPage> {
    return this.http.post<UsersPage>(`/api/Users/Filtered`, { BusinessUnitType, BusinessUnitId, PageNumber, PageSize, SortModel, FilterModel });
  }

  /**
   * Get the list of roles for user by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitId
   *
   * @return RolesPerUser
   */
  public getRolesPerUser(BusinessUnitType: BusinessUnitType, BusinessUnitId: number): Observable<RolesPerUser[]> {
    return this.http.get<RolesPerUser[]>(`/api/Roles/basicinfo`, { params: { BusinessUnitType, BusinessUnitId } });
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
   * @param userId
   * @return UserVisibilitySettingsPage
   */
  public getUserVisibilitySettingsPage(userId: string): Observable<UserVisibilitySettingsPage> {
    return this.http.get<UserVisibilitySettingsPage>(`/api/UserVisibilitySettings/${userId}`);
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
  public getUserVisibilitySettingsOrganisation(userId: string): Observable<Organisation[]> {
    return this.http.get<Organisation[]>(`/api/Organizations/structure/All/${userId}`);
  }

  /**
   * Export users list
   * @param payload
   */
  public export(payload: ExportPayload): Observable<Blob> {
    return this.http.post(`/api/Users/export`, payload, { responseType: 'blob' });
  }
}
