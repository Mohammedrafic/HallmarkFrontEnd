import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UsersPage } from 'src/app/shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {

  constructor(private http: HttpClient) { }

  /**
   * Get users
   */
  public getUsers(pageNumber: number, pageSize: number): Observable<UsersPage> {
    return this.http.get<UsersPage>(`/api/users`, { params: { PageNumber: pageNumber, PageSize: pageSize }});
  }
}
