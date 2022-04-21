import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Organization } from 'src/app/shared/models/organization.model';
import { BusinessUnit } from 'src/app/shared/models/business-unit.model';

@Injectable({ providedIn: 'root' })
export class OrganizationService {

  constructor(private http: HttpClient) { }

  /**
   * Create organization
   * @param Organization object to save
   * @return Created organization
   */
  public saveOrganization(organization: Organization): Observable<Organization> {
    return this.http.post<Organization>(`${environment.host}/api/Organizations`, organization);
  }

  /**
   * Get the list of available business units
   * @return Array of units
   */
  public getBusinessUnit(): Observable<BusinessUnit[]> {
    return this.http.get<BusinessUnit[]>(`${environment.host}/api/BusinessUnit`);
  }
}
