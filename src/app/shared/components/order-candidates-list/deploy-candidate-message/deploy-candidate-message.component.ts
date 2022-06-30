import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { OrderCandidateJob, OrderCandidatesList } from '../../../models/order-management.model';
import { Select, Store } from '@ngxs/store';
import { GetCandidateJob } from '@agency/store/order-management.actions';
import { Observable, Subject, takeUntil } from 'rxjs';
import { OrderManagementState } from '@agency/store/order-management.state';

@Component({
  selector: 'app-deploy-candidate-message',
  templateUrl: './deploy-candidate-message.component.html',
  styleUrls: ['./deploy-candidate-message.component.scss']
})
export class DeployCandidateMessageComponent implements OnChanges, OnInit, OnDestroy {
  @Input() candidate: OrderCandidatesList

  @Select(OrderManagementState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>

  public candidateJob: OrderCandidateJob

  private unsubscribe$: Subject<void> = new Subject();

  constructor(private store: Store) { }


  ngOnInit(): void {
    this.candidateJobState$.pipe(takeUntil(this.unsubscribe$)).subscribe(data => {
      this.candidateJob = data
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    const deployedCandidate = this.candidate.deployedCandidateInfo

    if (deployedCandidate) {
      this.store.dispatch(new GetCandidateJob(this.candidate.deployedCandidateInfo!.organizationId, this.candidate.deployedCandidateInfo!.jobId))
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next()
    this.unsubscribe$.complete()
  }


}
