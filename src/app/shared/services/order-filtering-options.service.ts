import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';


@Injectable({
  providedIn: 'root',
})
export class OrderFilteringOptionsService {
  constructor(private http: HttpClient) {}

  /**
   * Get the list of available options for agency filter
   * @return Array of options for agency filter
   */
  public getAgencyOptions(): Observable<AgencyOrderFilteringOptions> {
    return this.http.get<AgencyOrderFilteringOptions>(`/api/OrdersFilteringOptions/agency`);
  }
}

