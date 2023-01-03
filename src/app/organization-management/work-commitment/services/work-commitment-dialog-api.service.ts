import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { HolidaysPage, MasterWorkCommitments } from '../interfaces/work-commitment-dialog.interface';
import { AssignedSkillsByOrganization, ListOfSkills } from '@shared/models/skill.model';
import { sortByField } from '@shared/helpers/sort-by-field.helper';

@Injectable()
export class WorkCommitmentDialogApiService {
  constructor(private http: HttpClient) {}

  public getMasterCommitmentNames(): Observable<MasterWorkCommitments> {
    return this.http.post<MasterWorkCommitments>('/api/MasterWorkCommitment/GetAll', { pageNumber: 1, pageSize: 30 });
  }

  public getHolidays(): Observable<HolidaysPage> {
    const options: HttpHeaders = new HttpHeaders({
      PageSize: '100',
      PageNumber: '1',
    });

    return this.http.get<HolidaysPage>('/api/OrganizationHolidays');
  }

  public getAllSkills(): Observable<AssignedSkillsByOrganization[]> {
    return this.http
      .get<AssignedSkillsByOrganization[]>('/api/AssignedSkills/assignedSkillsForCurrentBusinessUnit')
      .pipe(map((data) => sortByField(data, 'skillDescription')));
  }
}
