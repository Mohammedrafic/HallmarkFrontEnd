import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { RolesPage } from '@shared/models/roles.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private http: HttpClient) {}

  /**
   * Get the list of roles by BusinessUnitType and BusinessUnitId
   * @param BusinessUnitType
   * @param BusinessUnitId
   * @param PageNumber
   * @param PageSize
   *
   * @return RolesPage
   */
  public getRolesPage(
    BusinessUnitType: BusinessUnitType,
    BusinessUnitId: number,
    PageNumber: number,
    PageSize: number
  ): Observable<RolesPage> {
    return this.http.get<RolesPage>(`/api/Roles`, { params: { BusinessUnitType, BusinessUnitId, PageNumber, PageSize } });
  }
}
