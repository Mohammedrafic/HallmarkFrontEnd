import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CandidateTabsEnum } from '@client/candidates/enums/candidate-tabs.enum';
import { CandidateWorkCommitment } from '../candidate-work-commitment/models/candidate-work-commitment.model';

@Injectable()
export class CandidatesService {
  private selectedTab$: BehaviorSubject<CandidateTabsEnum> = new BehaviorSubject<CandidateTabsEnum>(CandidateTabsEnum.CandidateProfile);
  private candidateName$: Subject<string> = new Subject<string>();
  private activeEmployeeWorkCommitment$: Subject<CandidateWorkCommitment> = new Subject<CandidateWorkCommitment>();

  public employeeId: number | null;
  public constructor() {
  }

  public getSelectedTab$(): Observable<CandidateTabsEnum> {
    return this.selectedTab$.asObservable();
  }

  public getCandidateName(): Observable<string> {
    return this.candidateName$.asObservable();
  }

  public setCandidateName(name: string): void {
    this.candidateName$.next(name);
  }

  public setActiveEmployeeWorkCommitment(commitment: CandidateWorkCommitment): void {
    this.activeEmployeeWorkCommitment$.next(commitment)
  }

  public getActiveEmployeeWorkCommitment(): Observable<CandidateWorkCommitment> {
    return this.activeEmployeeWorkCommitment$.asObservable();
  }

  public changeTab(tab: CandidateTabsEnum): void {
    this.selectedTab$.next(tab);
  }
}
