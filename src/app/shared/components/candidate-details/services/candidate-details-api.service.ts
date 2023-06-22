import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  CandidateDetailsPage,
  CandidatesDetailsRegions,
  FiltersPageModal
} from '@shared/components/candidate-details/models/candidate.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';
import { DoNotReturnSearchCandidate } from '@shared/models/donotreturn.model';
import { ExportPayload } from '@shared/models/export.model';

@Injectable()
export class CandidateDetailsApiService {
  constructor(private http: HttpClient) {}
  public getCandidateDetails(payload: FiltersPageModal): Observable<CandidateDetailsPage> {
    return this.http.post<CandidateDetailsPage>(`/api/CandidateProfile/profiles/details`, payload);
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
  
  public export(payload: ExportPayload): Observable<Blob> {
    if (payload.ids) {
      return this.http.post(`/api/CandidateProfile/profiles/export`, payload, { responseType: 'blob' });
    }
    return this.http.post(`/api/CandidateProfile/profiles/export`, payload, { responseType: 'blob' });
  }

}
