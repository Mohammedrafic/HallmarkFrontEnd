import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { DonoreturnFilters, DonoreturnAddedit, DoNotReturnsPage, AllOrganization, GetLocationByOrganization, DoNotReturnSearchCandidate } from '@shared/models/donotreturn.model';
import { ExportPayload } from '@shared/models/export.model';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';

@Injectable({ providedIn: 'root' })
export class DonotreturnService {

  constructor(private http: HttpClient) { }

  public getDonotreturn(pageNumber: number, pageSize: number, filters: DonoreturnFilters): Observable<DoNotReturnsPage> {
    if (filters.candidatename || filters.ssn) {
      let parameters;
      let urls;
      parameters = { parameters: { PageNumber: pageNumber, PageSize: pageSize, Filters: filters } };
      urls = '/api/DoNotReturn/filter';
      return this.http.post<DoNotReturnsPage>(urls, filters);
    }
    let params;
    let url;
    params = { params: { PageNumber: pageNumber, PageSize: pageSize } };
    url = '/api/DoNotReturn';
    return this.http.get<DoNotReturnsPage>(url, params);
  }
 
  public updateDoNotReturn(donotreturn: DonoreturnAddedit): Observable<DonoreturnAddedit> {
    return this.http.put<DonoreturnAddedit>(`/api/DoNotReturn/`, donotreturn);
  }
  /**
* Save the do not return candidate
*/
  public saveDonotReturn(donotreturn: DonoreturnAddedit): Observable<DonoreturnAddedit> {
    return donotreturn.id ?
      this.http.put<DonoreturnAddedit>(`/api/DoNotReturn`, donotreturn)
      : this.http.post<DonoreturnAddedit>(`/api/DoNotReturn`, donotreturn);
  }

  public allOrganizations(): Observable<UserAgencyOrganization> {
    return this.http.get<UserAgencyOrganization>(`/api/Users/organizations`);
  }

  public getLocationsByOrganizationId(organizationId: number): Observable<GetLocationByOrganization[]> {
    return this.http.get<GetLocationByOrganization[]>(`/api/Locations/organization/${organizationId}`);
  }

  public getCandidatesByOrganizationId(organizationId: number): Observable<Location[]> {
    return this.http.get<Location[]>(`/api/DoNotReturn/organization/${organizationId}`);
  }


  public export(payload: ExportPayload): Observable<Blob> {
    if (payload.ids) {
      return this.http.post(`/api/DoNotReturn/export/byIds`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/DoNotReturn/export`, payload, { responseType: 'blob' });
  }


  public removeDonotReturn(donotreturn: DonoreturnAddedit): Observable<DonoreturnAddedit> {
    return this.http.delete<DonoreturnAddedit>(`/api/DoNotReturn/${donotreturn.id}`);
  }

  public getDoNotCandidateSearch(filter: any): Observable<DoNotReturnSearchCandidate[]> {
    return this.http.post<DoNotReturnSearchCandidate[]>(`/api/DoNotReturn/candidatesearch`, filter);
  }

  public getDoNotCandidateListSearch(filter: any): Observable<DoNotReturnSearchCandidate[]> {
    return this.http.post<DoNotReturnSearchCandidate[]>(`/api/DoNotReturn/candidateListsearch`, filter);
  }
}