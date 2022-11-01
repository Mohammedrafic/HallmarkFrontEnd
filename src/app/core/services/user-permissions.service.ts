import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class UserPermissionsService {
  constructor(private http: HttpClient) {}

  public getUserPermissions(): Observable<number[]> {
    return this.http.get<number[]>('/api/permissions/currentUserDescriptor');
  }
}
