import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkCommitmentDetails } from '@organization-management/work-commitment/interfaces';
import { HolidaysPage } from '@shared/models/holiday.model';
import { map, Observable } from 'rxjs';
import {
  CandidateWorkCommitment,
  CandidateWorkCommitmentsPage,
} from '../models/candidate-work-commitment.model';

@Injectable()
export class CandidateWorkCommitmentService {
  public constructor(private readonly httpClient: HttpClient) {}

  public getAvailableWorkCommitments(employeeId: number): Observable<WorkCommitmentDetails[]> {
    return this.httpClient.get<WorkCommitmentDetails[]>('/api/WorkCommitment/all', { params: { EmployeeId: employeeId }});
  }

  public saveCandidateWorkCommitment(workCommitment: CandidateWorkCommitment): Observable<CandidateWorkCommitment> {
    if (workCommitment.id) {
      return this.httpClient.put<CandidateWorkCommitment>('/api/EmployeeWorkCommitments/' + workCommitment.id, workCommitment);
    }
    return this.httpClient.post<CandidateWorkCommitment>('/api/EmployeeWorkCommitments', workCommitment);
  }

  public getCandidateWorkCommitmentById(id: number): Observable<CandidateWorkCommitment> {
    return this.httpClient.get<CandidateWorkCommitment>('/api/EmployeeWorkCommitments/' + id);
  }

  public getActiveCandidateWorkCommitment(employeeId: number): Observable<CandidateWorkCommitment | null> {
    return this.httpClient.get<CandidateWorkCommitmentsPage>('/api/EmployeeWorkCommitments/all/' + employeeId, { params: {
      id: employeeId,
      pageNumber: 1,
      pageSize: 1,
    }}).pipe(map((workCommitmentsPage: CandidateWorkCommitmentsPage) => {
      return workCommitmentsPage.items[0] || null;
    }));
  }

  public getCandidateWorkCommitmentByPage(pageNumber: number, pageSize: number, employeeId: number): Observable<CandidateWorkCommitmentsPage> {
    return this.httpClient.get<CandidateWorkCommitmentsPage>('/api/EmployeeWorkCommitments/all/' + employeeId, { params: {
      id: employeeId,
      pageNumber,
      pageSize,
    }});
  }

  public deleteCandidateWorkCommitmentById(id: number): Observable<void> {
    return this.httpClient.delete<void>('/api/EmployeeWorkCommitments/' + id);
  }

  public getHolidays(): Observable<HolidaysPage> {
    return this.httpClient.get<HolidaysPage>('/api/OrganizationHolidays');
  }
}
