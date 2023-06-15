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
  private profileData$: BaseObservable<CandidateModel | null> = new BaseObservable<CandidateModel | null>(null);

  public employeeId: number | null;
  public hasWorkCommitments = false;
  
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

  public setProfileData(candidate: CandidateModel): void {
    this.profileData$.set(candidate);
  }

  public getProfileData(): CandidateModel | null {
    return this.profileData$.get();
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

  public getEmployeeHireDate(): string | Date {
    return this.getProfileData()?.hireDate ?? '';
  }

  public getTerminationDate(): string {
    return this.getProfileData()?.terminationDate ?? '';
  }

  public getGridPageNumber(items: number, pageNumber: number): number {
    if (items === 1 && pageNumber > 1) {
      return pageNumber - 1;
    }

    return pageNumber;
  }
}
