import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';


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
    return this.http.get<AgencyOrderFilteringOptions>(`/api/OrdersFilteringOptions/agency`).pipe(
      map((data) => {
        const sortedFields: Record<keyof AgencyOrderFilteringOptions, string> = {
          partneredOrganizations: 'name',
          candidateStatuses: 'statusText',
          orderStatuses: 'statusText',
          reorderStatuses: 'statusText',
          masterSkills: 'name',
          poNumbers: 'poNumber',
          projectNames: 'projectName',
          specialProjectCategories: 'projectType',
        }
          return Object.fromEntries(Object.entries(data).map(([key, value]) => [[key], sortByField(value, sortedFields[key as keyof AgencyOrderFilteringOptions])]))
      }),
    );;
  }
}

