import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Agency } from 'src/app/shared/models/agency.model';

@Injectable({
  providedIn: 'root',
})
export class AgencyService {
  constructor(private http: HttpClient) {}

  /**
   * Create or update agency
   * @param agency object to save
   * @return Created/Updated agency
   */
  public saveAgency(agency: Agency): Observable<Agency> {
    return agency.agencyDetails.id ? this.http.put<Agency>(`/api/agency`, agency) : this.http.post<Agency>(`/api/agency`, agency);
  }
}
