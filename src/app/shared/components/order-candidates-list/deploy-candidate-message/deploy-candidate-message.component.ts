import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { CandidatesBasicInfo, OrderCandidatesList } from '../../../models/order-management.model';
import { Select, Store } from '@ngxs/store';
import { GetCandidatesBasicInfo } from '@agency/store/order-management.actions';
import { combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

@Component({
  selector: 'app-deploy-candidate-message',
  templateUrl: './deploy-candidate-message.component.html',
  styleUrls: ['./deploy-candidate-message.component.scss']
})
export class DeployCandidateMessageComponent implements OnChanges, OnInit, OnDestroy {
  @Input() candidate: OrderCandidatesList
  @Input() isAgency: boolean

  @Select(OrderManagementState.candidateBasicInfo)
  candidateBasicInfoStateAg$: Observable<CandidatesBasicInfo>
  @Select(OrderManagementContentState.candidateBasicInfo)
  candidateBasicInfoStateOrg$: Observable<CandidatesBasicInfo>

  public candidateBasicInfo: CandidatesBasicInfo

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store) { }


  ngOnInit(): void {
    this.subscribeOnInitialObs()
  }

  ngOnChanges(changes: SimpleChanges): void {
    const deployedCandidate = this.candidate.deployedCandidateInfo

    if (deployedCandidate) {
      this.store.dispatch(new GetCandidatesBasicInfo(this.candidate.deployedCandidateInfo!.organizationId, this.candidate.deployedCandidateInfo!.jobId))
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }


  private subscribeOnInitialObs() {
    combineLatest([this.candidateBasicInfoStateAg$, this.candidateBasicInfoStateOrg$]).pipe(takeUntil(this.unsubscribe$))
      .subscribe(([dataAg, dataOrg]) => {
      this.candidateBasicInfo = dataAg ?? dataOrg
    })
  }
}
