import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { HistoricalEvent } from '../../models/historical-event.model';
import { Actions, ofActionDispatched, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { GetAgencyOrderCandidatesList, ReloadOrderCandidatesLists } from '@agency/store/order-management.actions';
import { combineLatest, Observable, of, Subject, takeUntil } from 'rxjs';
import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  GetHistoricalData,
  GetRejectReasonsForOrganisation, RejectCandidateJob,
  UpdateOrganisationCandidateJob
} from '@client/store/order-managment-content.actions';
import { filter, mergeMap, switchMap } from 'rxjs/operators';
import { OrderCandidatesListPage } from '../../models/order-management.model';

@Component({
  selector: 'app-historical-events',
  templateUrl: './historical-events.component.html',
  styleUrls: ['./historical-events.component.scss']
})
export class HistoricalEventsComponent implements OnInit, OnChanges, OnDestroy{

  @Input() candidateJobId: number
  @Input() organizationId: number
  @Input() candidateId: number

  @Select(OrderManagementContentState.candidateHistoricalData)
  historicalEventsOrg$: Observable<HistoricalEvent[]>

  @Select(OrderManagementState.candidateHistoricalData)
  historicalEventsAg$: Observable<HistoricalEvent[]>

  @Select(OrderManagementState.orderCandidatePage)
  candidateListAg$: Observable<OrderCandidatesListPage>

  @Select(OrderManagementContentState.orderCandidatePage)
  candidateListOrg$: Observable<OrderCandidatesListPage>

  public historicalEvents: HistoricalEvent[] = []

  private unsubscribe$: Subject<void> = new Subject()

  constructor(private store: Store, private actions$: Actions) {
  }

  ngOnInit(): void {
    this.subscribeToInitialObs()
  }

  ngOnChanges() {
    if(this.organizationId > 0 && this.candidateJobId) {
      this.store.dispatch(new GetHistoricalData(this.organizationId, this.candidateJobId))
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private subscribeToInitialObs(): void {
    combineLatest([this.historicalEventsOrg$, this.historicalEventsAg$])
      .pipe(
      takeUntil(this.unsubscribe$)
      ).subscribe(([dataOrg, dataAg]) => {
      this.historicalEvents = dataOrg ?? dataAg
    })

    if (!this.candidateJobId) {
      combineLatest([this.candidateListAg$, this.candidateListOrg$])
        .pipe(
          takeUntil(this.unsubscribe$)
        ).subscribe(([dataOrg, dataAg]) => {
          const data = dataOrg ?? dataAg
          const [currentCandidate] = data.items.filter(item => item.candidateId === this.candidateId)
          this.store.dispatch(new GetHistoricalData(this.organizationId, currentCandidate.candidateJobId))
      })
    }

    this.actions$.pipe(ofActionSuccessful(ReloadOrderCandidatesLists, UpdateOrganisationCandidateJob, RejectCandidateJob, GetAgencyOrderCandidatesList), takeUntil(this.unsubscribe$)).subscribe(() => {
      if (this.organizationId > 0 && this.candidateJobId)
      this.store.dispatch(new GetHistoricalData(this.organizationId, this.candidateJobId))
    })
  }
}
