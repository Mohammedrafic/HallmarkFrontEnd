import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, Subject } from 'rxjs';
import { CandidateTabsEnum } from '@client/candidates/enums/candidate-tabs.enum';
import { HttpClient } from '@angular/common/http';
import { EmployeeWorkCommitment } from '../interface/employee-work-commitments.model';

@Injectable()
export class CandidatesService {
  private selectedTab$: BehaviorSubject<CandidateTabsEnum> = new BehaviorSubject<CandidateTabsEnum>(
    CandidateTabsEnum.CandidateProfile
  );
  private candidateName$: Subject<string> = new Subject<string>();
  private activeEmployeeWorkCommitment$: Subject<EmployeeWorkCommitment> = new Subject<EmployeeWorkCommitment>();

  public employeeId: number | null;
  public constructor(private httpClient: HttpClient) {}

  public getSelectedTab$(): Observable<CandidateTabsEnum> {
    return this.selectedTab$.asObservable();
  }

  public getCandidateName(): Observable<string> {
    return this.candidateName$.asObservable();
  }

  public setCandidateName(name: string): void {
    this.candidateName$.next(name);
  }

  public setActiveEmployeeWorkCommitment(commitment: EmployeeWorkCommitment): void {
    this.activeEmployeeWorkCommitment$.next(commitment);
  }

  public getActiveEmployeeWorkCommitment(): Observable<EmployeeWorkCommitment> {
    return this.activeEmployeeWorkCommitment$.asObservable();
  }

  public changeTab(tab: CandidateTabsEnum): void {
    this.selectedTab$.next(tab);
  }

  public getEmployeeWorkCommitments(): Observable<EmployeeWorkCommitment | void> {
    return this.httpClient
      .get<EmployeeWorkCommitment[]>('/api/EmployeeWorkCommitments/compact', {
        params: { employeeId: this.employeeId! },
      })
      .pipe(
        map((data) => {
          const activeWorkCommitment = data.find((commitment) => commitment.isActive);
          activeWorkCommitment && this.setActiveEmployeeWorkCommitment(activeWorkCommitment);
          return activeWorkCommitment;
        })
      );
  }
}
