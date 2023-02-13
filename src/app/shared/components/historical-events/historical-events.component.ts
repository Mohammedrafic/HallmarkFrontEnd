import { Component, Input, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { HistoricalEvent } from '../../models/historical-event.model';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import {
  GetAgencyHistoricalData,
  GetAgencyOrderCandidatesList,
  GetOrderApplicantsData,
  GetOrderById,
  ReloadOrderCandidatesLists,
} from '@agency/store/order-management.actions';
import { merge, Observable, takeUntil } from 'rxjs';
import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  GetHistoricalData,
  GetOrderById as GetOrgOrderById,
  RejectCandidateJob,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { OrderCandidatesListPage } from '../../models/order-management.model';
import { DestroyableDirective } from '../../directives/destroyable.directive';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-historical-events',
  templateUrl: './historical-events.component.html',
  styleUrls: ['./historical-events.component.scss'],
})
export class HistoricalEventsComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() candidateJobId: number;
  @Input() organizationId: number;
  @Input() candidateId: number;
  @Input() isAgency: boolean;

  @Select(OrderManagementContentState.candidateHistoricalData)
  historicalEventsOrg$: Observable<HistoricalEvent[]>;

  @Select(OrderManagementState.candidateHistoricalData)
  historicalEventsAg$: Observable<HistoricalEvent[]>;

  @Select(OrderManagementState.orderCandidatePage)
  candidateListAg$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.orderCandidatePage)
  candidateListOrg$: Observable<OrderCandidatesListPage>;

  public historicalEvents$: Observable<HistoricalEvent[]>;
  private selectedOrgId: number;
  private selectedJobId: number;

  constructor(private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.historicalEvents$ = merge(this.historicalEventsOrg$, this.historicalEventsAg$);
    this.subscribeToInitialObs();
  }

  ngOnChanges() {
    if (this.organizationId && this.candidateJobId) {
      this.dispatchHistoricalEvents(this.organizationId, this.candidateJobId);
    }
  }

  private subscribeToInitialObs(): void {
    if (!this.candidateJobId) {
      merge(this.candidateListAg$, this.candidateListOrg$)
        .pipe(
          takeUntil(this.destroy$),
          filter((value) => !!value)
        )
        .subscribe((data: OrderCandidatesListPage) => {
          const [currentCandidate] = data.items.filter((item) => item.candidateId === this.candidateId);
          this.dispatchHistoricalEvents(this.organizationId, currentCandidate.candidateJobId);
        });
    }

    this.actions$
      .pipe(
        ofActionSuccessful(
          ReloadOrderCandidatesLists,
          UpdateOrganisationCandidateJob,
          RejectCandidateJob,
          GetAgencyOrderCandidatesList,
          GetOrderApplicantsData,
          GetOrderById,
          GetOrgOrderById
        ),
        filter(() => !!this.organizationId && !!this.candidateJobId),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.dispatchHistoricalEvents(this.organizationId, this.candidateJobId);
      });
  }

  private dispatchHistoricalEvents(orgId: number, jobId: number): void {
    if (this.selectedOrgId === orgId && this.selectedJobId === jobId) {
      return;
    } else {
      this.selectedOrgId = orgId;
      this.selectedJobId = jobId;
    }
    if (this.isAgency) {
      this.store.dispatch(new GetAgencyHistoricalData(orgId, jobId));
    } else {
      this.store.dispatch(new GetHistoricalData(orgId, jobId));
    }
  }
}
