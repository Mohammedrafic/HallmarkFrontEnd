import { Component, Input, OnChanges, OnInit } from '@angular/core';

import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { merge, Observable, takeUntil } from 'rxjs';
import { filter } from 'rxjs/operators';

import {
  GetAgencyHistoricalData,
  GetAgencyOrderCandidatesList,
  GetOrderApplicantsData,
  GetOrderById,
  ReloadOrderCandidatesLists,
} from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import {
  GetHistoricalData,
  GetOrderById as GetOrgOrderById,
  RejectCandidateJob,
  UpdateOrganisationCandidateJob,
} from '@client/store/order-managment-content.actions';
import { OrderCandidatesListPage } from '../../models/order-management.model';
import { HistoricalEvent } from '../../models/historical-event.model';
import { DestroyableDirective } from '../../directives/destroyable.directive';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

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
  @Input() activeSystem: number;
  @Input() jobId: number;
  @Select(OrderManagementContentState.candidateHistoricalData)
  historicalEventsOrg$: Observable<HistoricalEvent[]>;

  @Select(OrderManagementState.candidateHistoricalData)
  historicalEventsAg$: Observable<HistoricalEvent[]>;

  @Select(OrderManagementState.orderCandidatePage)
  candidateListAg$: Observable<OrderCandidatesListPage>;

  @Select(OrderManagementContentState.orderCandidatePage)
  candidateListOrg$: Observable<OrderCandidatesListPage>;

  public historicalEvents$: Observable<HistoricalEvent[]>;
  public historicalIrpFlag:boolean;
  constructor(private store: Store, private actions$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.historicalEvents$ = merge(this.historicalEventsOrg$, this.historicalEventsAg$);
    this.subscribeToInitialObs();
  }

  ngOnChanges() { 
    this.IsIrpEnable();
    if (this.candidateJobId == undefined) {
      this.candidateJobId = this.jobId;
    }
    if (this.organizationId && this.candidateJobId) {
      this.dispatchHistoricalEvents(this.organizationId, this.candidateJobId,this.historicalIrpFlag);
    }
  }
  private IsIrpEnable():void
  {
    let isIrpId = JSON.parse(localStorage.getItem('flagId') || '""') as number;;
    this.historicalIrpFlag=false;
    if(isIrpId==OrderManagementIRPSystemId.IRP)
    {
      this.historicalIrpFlag=true;
    }
  }
  private subscribeToInitialObs(): void {  
    this.IsIrpEnable();
    if (this.candidateJobId == undefined) {
      this.candidateJobId = this.jobId;
    }
    if (!this.candidateJobId) {
      merge(this.candidateListAg$, this.candidateListOrg$)
        .pipe(
          takeUntil(this.destroy$),
          filter((value) => !!value)
        )
        .subscribe((data: OrderCandidatesListPage) => {
          const [currentCandidate] = data.items.filter((item) => item.candidateId === this.candidateId);
          this.dispatchHistoricalEvents(this.organizationId, currentCandidate.candidateJobId,this.historicalIrpFlag);
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
        this.dispatchHistoricalEvents(this.organizationId, this.candidateJobId,this.historicalIrpFlag);
      });
  }

  private dispatchHistoricalEvents(orgId: number, jobId: number,isIrpFlag:boolean): void {
    if (this.isAgency) {
      this.store.dispatch(new GetAgencyHistoricalData(orgId, jobId, isIrpFlag));
    } else {
      this.store.dispatch(new GetHistoricalData(orgId, jobId, isIrpFlag));
    }
  }
}
