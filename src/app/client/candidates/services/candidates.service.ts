import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, map, Observable, Subject } from 'rxjs';

import { CandidateTabsEnum } from '@client/candidates/enums/candidate-tabs.enum';
import { CandidateWorkCommitmentShort } from '../interface/employee-work-commitments.model';
import { BaseObservable } from '@core/helpers';
import { CandidateModel } from '../candidate-profile/candidate.model';

@Injectable()
export class CandidatesService {
  private selectedTab$: BehaviorSubject<CandidateTabsEnum> = new BehaviorSubject<CandidateTabsEnum>(
    CandidateTabsEnum.CandidateProfile
  );
  private candidateName$: Subject<string> = new Subject<string>();
  private activeEmployeeWorkCommitment$: 
  BaseObservable<CandidateWorkCommitmentShort | null> = new BaseObservable<CandidateWorkCommitmentShort | null>(null);
  private employeeProfile$: BehaviorSubject<CandidateModel | null> = new BehaviorSubject<CandidateModel | null>(null);
  private employeeHireDate: string;
  private terminationDate: string;

  public employeeId: number | null;
  
  public constructor(private httpClient: HttpClient) { }

  public getSelectedTab$(): Observable<CandidateTabsEnum> {
    return this.selectedTab$.asObservable();
  }

  public getCandidateName(): Observable<string> {
    return this.candidateName$.asObservable();
  }

  public setCandidateName(name: string): void {
    this.candidateName$.next(name);
  }

  public setActiveEmployeeWorkCommitment(commitment: CandidateWorkCommitmentShort | null): void {
    this.activeEmployeeWorkCommitment$.set(commitment);
  }

  public getActiveWorkCommitmentStream(): Observable<CandidateWorkCommitmentShort | null> {
    return this.activeEmployeeWorkCommitment$.getStream();
  }

  public setEmployeeProfileData(employee: CandidateModel): void {
    this.employeeProfile$.next(employee);
  }

  public getEmployeeProfileData(): CandidateModel | null {
    return this.employeeProfile$.getValue();
  }

  public changeTab(tab: CandidateTabsEnum): void {
    this.selectedTab$.next(tab);
  }

  public getEmployeeWorkCommitments(): Observable<CandidateWorkCommitmentShort | undefined> {
    return this.httpClient
      .get<CandidateWorkCommitmentShort[]>('/api/EmployeeWorkCommitments/compact', {
        params: { employeeId: this.employeeId! },
      })
      .pipe(
        map((data) => {
          const activeWorkCommitment = data.find((commitment) => commitment.isActive);
          this.setActiveEmployeeWorkCommitment(activeWorkCommitment || null);
          return activeWorkCommitment;
        })
      );
  }

  public setEmployeeHireDate(hireDate: string): void {
    this.employeeHireDate = hireDate;
  }

  public getEmployeeHireDate(): string {
    return this.employeeHireDate;
  }

  public setTerminationDate(terminationDate: string): void {
    this.terminationDate = terminationDate;
  }

  public getTerminationDate(): string {
    return this.terminationDate;
  }

  public getGridPageNumber(items: number, pageNumber: number): number {
    if (items === 1 && pageNumber > 1) {
      return pageNumber - 1;
    }

    return pageNumber;
  }
}
