import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrentUserPermission } from "@shared/models/permission.model";
import { Observable } from 'rxjs';
import { User, UsersAssignedToRole, UsersPage } from 'src/app/shared/models/user.model';
import { BusinessUnitType } from '../enums/business-unit-type';
import { Menu } from '../models/menu.model';
import { LasSelectedOrganizationAgency, UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { AlertsModel } from '@shared/models/alerts-model';
import { HelpSiteUrl } from '@shared/models/help-site-url.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private http: HttpClient) { }

  /**
   * Get users
   */
  public getUsers(pageNumber: number, pageSize: number): Observable<UsersPage> {
    return this.http.get<UsersPage>(`/api/users`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }

  /**
   * Get user
   */
  public getUser(): Observable<User> {
    return this.http.get<User>(`/api/user`);
  }

  /**
   * Get users menu configuration by business unit type
   * @param businessUnitType
   * @returns list of menu items by business unit type
   */
  public getUserMenuConfig(businessUnitType: BusinessUnitType): Observable<Menu> {
    return this.http.get<Menu>(`/api/Menu`, { params: { BusinessUnitType: businessUnitType }});
  }

  /**
   * Get users menu configuration by business unit type
   * @returns list of user's agencies
   */
  public getUserAgencies(): Observable<UserAgencyOrganization> {
    return this.http.get<UserAgencyOrganization>(`/api/Users/agencies`);
  }

  /**
   * Get users menu configuration by business unit type
   * @returns list of user's organizations
   */
  public getUserOrganizations(): Observable<UserAgencyOrganization> {
    return this.http.get<UserAgencyOrganization>(`/api/Users/organizations`);
  }

  /**
   * Add User Organization Access Setting
   * @param lasSelectedOrganizationAgency
   * @returns void
   */
  public saveLastSelectedOrganizationAgencyId(lasSelectedOrganizationAgency: LasSelectedOrganizationAgency): Observable<void> {
    const { lastSelectedOrganizationId, lastSelectedAgencyId } = lasSelectedOrganizationAgency;
    return this.http.post<void>('/api/Users/savestate', { lastSelectedOrganizationId, lastSelectedAgencyId });
  }

  /**
   * Get Users Assigned To Role
   * @param roleId
   * @returns list of UsersAssignedToRole
   */
  public getUsersAssignedToRole(roleId: number): Observable<UsersAssignedToRole> {
    return this.http.get<UsersAssignedToRole>(`/api/Users/GetByRoleId/${roleId}`);
  }

  /**
   * Get Current User Permissions
   * @returns list of Permissions
   */
  public getCurrentUserPermissions(): Observable<CurrentUserPermission[]> {
    return this.http.get<CurrentUserPermission[]>('/api/Permissions/currentUser');
  }

  /**
   * Get Alerts for Current User
   * @returns list of alerts
   */
  public getAlertsForUser(): Observable<AlertsModel[]> {
    return this.http.get<AlertsModel[]>('/api/Alerts/GetAlertsForUser');
  }

  public getAlertsCountForUser(): Observable<number> {
    return this.http.get<number>('/api/Alerts/GetAlertsCountForUser');
  }

  public getOrderPermissions(orderId: number): Observable<CurrentUserPermission[]> {
    return this.http.get<CurrentUserPermission[]>('/api/Permissions/orderscope/' + orderId);
  }

  public getHelpSiteUrl(): Observable<HelpSiteUrl> {
    return this.http.get<HelpSiteUrl>('/api/Help/link');
  }
}
