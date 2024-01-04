import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  CandidateDetailsPage,
  CandidatesDetailsRegions,
  FiltersPageModal
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { DoNotReturnSearchCandidate, GetCandidateOrgSearch } from '@shared/models/donotreturn.model';
import { ExportPayload } from '@shared/models/export.model';
import { AgencyOrderFilteringOptions } from '@shared/models/agency.model';

@Injectable()
export class CandidateDetailsApiService {
  constructor(private http: HttpClient) {}
  public getCandidateDetails(payload: FiltersPageModal): Observable<CandidateDetailsPage> {
    let candidatePayload:any = Object.assign({},payload)
    if(candidatePayload.organizationIds){
      candidatePayload.organizationIds = [candidatePayload.organizationIds]
    }
    if(candidatePayload.agencyIds){
      candidatePayload.agencyIds = [candidatePayload.agencyIds]
    }
    return this.http.post<CandidateDetailsPage>(`/api/CandidateProfile/profiles/details`, candidatePayload);
  }

  public getSkills(): Observable<MasterSkillByOrganization[]> {
    return this.http.get<MasterSkillByOrganization[]>('/api/MasterSkills/listByActiveBusinessUnit').pipe(map((data) => sortByField(data, 'name')));
  }

  public getRegions(): Observable<CandidatesDetailsRegions[]> {
    return this.http.get<CandidatesDetailsRegions[]>('/api/Regions/listByActiveBusinessUnit').pipe(map((data) => sortByField(data, 'name')));
  }
  public getcandidatesearchbytext(filter: any): Observable<DoNotReturnSearchCandidate[]> {
    return this.http.post<DoNotReturnSearchCandidate[]>(`/api/CandidateProfile/candidatesearchbytext`, filter);
  }

  public getcandidateOrgsearchbytext(filter: any): Observable<GetCandidateOrgSearch[]> {
    return this.http.post<GetCandidateOrgSearch[]>(`/api/CandidateProfile/CandidateOrgSearchByText`, filter);
  }

  public export(payload: ExportPayload): Observable<Blob> {
    if (payload.ids) {
      return this.http.post(`/api/CandidateProfile/profiles/export`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/CandidateProfile/profiles/export`, payload, { responseType: 'blob' });
  }

  public getAssociateOrganizations(lastSelectedBusinessUnitId?: number): Observable<AgencyOrderFilteringOptions> {
    let headers = {};

    if (lastSelectedBusinessUnitId) {
      headers = new HttpHeaders({ 'selected-businessunit-id': `${lastSelectedBusinessUnitId}` });
    }
    return this.http.get<AgencyOrderFilteringOptions>(`/api/OrdersFilteringOptions/agencyorg`).pipe(
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
