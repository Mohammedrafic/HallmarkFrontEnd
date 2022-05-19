import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsersPage } from 'src/app/shared/models/user.model';
import { BusinessUnitType } from '../enums/business-unit-type';
import { Menu } from '../models/menu.model';

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
   * Get users menu configuration by business unit type
   * @param businessUnitType
   * @returns list of menu items by business unit type
   */
  public getUserMenuConfig(businessUnitType: BusinessUnitType): Observable<Menu> {
    return this.http.get<Menu>(`/api/Menu`, { params: { BusinessUnitType: businessUnitType }});
  }
}
