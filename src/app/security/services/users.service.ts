import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import {Observable} from "rxjs";
import {RolesPerUser, User, UserDTO, UsersPage} from "@shared/models/user-managment-page.model";

@Injectable({
  providedIn: 'root'
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
    PageSize: number
  ): Observable<UsersPage> {
    return this.http.get<UsersPage>(`/api/Users/Filtered`, { params: {BusinessUnitType, BusinessUnitId, PageNumber, PageSize } });
  }

  /**
   * Get the list of roles for user by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitId
   *
   * @return RolesPerUser
   */
  public getRolesPerUser(
    BusinessUnitType: BusinessUnitType,
    BusinessUnitId: number,
  ): Observable<RolesPerUser[]> {
    return this.http.get<RolesPerUser[]>(`/api/Roles/basicinfo`, { params: {BusinessUnitType, BusinessUnitId } });
  }

  /**
   * Save User
   * @param UserDTO
   * @return User
   */
  public saveUser(user: UserDTO): Observable<User> {
    return user.metadata.id ? this.http.put<User>(`/api/Users`, user) : this.http.post<User>(`/api/Users`, user);
  }
}
