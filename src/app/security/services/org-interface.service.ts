import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogInterfacePage, OrgInterfacePage } from '@shared/models/org-interface.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrgInterfaceService {

  constructor(private http: HttpClient) { }


    /**
   * Get the list of Org Interface by  BusinessUnitId
   * @param BusinessUnitId
   * @param PageNumber
   * @param PageSize
   *
   * @return OrgInterfacePage
   */
    public getOrgInterfacePage(
      OrganizationId: number | null,
      PageNumber: number,
      PageSize: number,
    ): Observable<OrgInterfacePage> {
      return this.http.post<OrgInterfacePage>(`/api/Integration/getIntegrationConfig`, { OrganizationId, PageNumber, PageSize });
    }


        /**
   * Get the list of Log Interface by  BusinessUnitId
   * @param BusinessUnitId
   * @param PageNumber
   * @param PageSize
   *
   * @return OrgInterfacePage
   */
        public getLogInterfacePage(
          OrganizationId: number | null,
          PageNumber: number,
          PageSize: number,
        ): Observable<LogInterfacePage> {
          return this.http.post<LogInterfacePage>(`/api/Integration/getIntegrationProcessDetails`, { OrganizationId, PageNumber, PageSize });
        }
}
