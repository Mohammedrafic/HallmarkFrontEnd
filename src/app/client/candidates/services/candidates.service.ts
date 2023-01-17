import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CandidateTabsEnum } from '@client/candidates/enums/candidate-tabs.enum';

@Injectable()
export class CandidatesService {
  private selectedTab$: BehaviorSubject<CandidateTabsEnum> = new BehaviorSubject<CandidateTabsEnum>(CandidateTabsEnum.CandidateProfile);

  public employeeId: number | null;
  public constructor() {
  }

  public getSelectedTab$(): Observable<CandidateTabsEnum> {
    return this.selectedTab$.asObservable();
  }

  public changeTab(tab: CandidateTabsEnum) {
    this.selectedTab$.next(tab);
  }
}
