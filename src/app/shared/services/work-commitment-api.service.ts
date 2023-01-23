import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  WorkCommitmentDetails,
  WorkCommitmentsPage,
} from '@organization-management/work-commitment/interfaces/work-commitment-grid.interface';
import { Observable, of } from 'rxjs';
import { ListOfSkills } from '../models/skill.model';
import { WorkCommitmentDTO } from '@organization-management/work-commitment/interfaces/work-commitment-dialog.interface';

@Injectable()
export class WorkCommitmentApiService {
  constructor(private http: HttpClient) {}

  public getCommitmentsByPage(pageNumber: number, pageSize: number): Observable<WorkCommitmentsPage> {
    return this.http.post<WorkCommitmentsPage>('/api/WorkCommitment/GetAll', { pageNumber, pageSize });
  }

  public saveCommitment(payload: WorkCommitmentDTO): Observable<WorkCommitmentDTO> {
    const url = '/api/WorkCommitment';
    if (payload.workCommitmentId) {
      return this.http.put<WorkCommitmentDTO>(url, payload);
    } else {
      return this.http.post<WorkCommitmentDTO>(url, payload);
    }
  }

  public deleteCommitment(id: number): Observable<void> {
    return this.http.delete<void>(`/api/WorkCommitment/${id}`);
  }
}
