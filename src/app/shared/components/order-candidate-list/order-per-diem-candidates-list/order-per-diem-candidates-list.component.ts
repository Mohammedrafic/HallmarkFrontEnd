import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, merge, Subject, takeUntil } from 'rxjs';

import { IrpOrderCandidate, Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { UserState } from 'src/app/store/user.state';
import { OrderCandidateApiService } from '../order-candidate-api.service';
import { PageOfCollections } from '@shared/models/page.model';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-order-per-diem-candidates-list',
  templateUrl: './order-per-diem-candidates-list.component.html',
  styleUrls: ['./order-per-diem-candidates-list.component.scss'],
})
export class OrderPerDiemCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  @Input() selectedOrder: Order;

  public templateState: Subject<any> = new Subject();
  public candidate: OrderCandidatesList;
  public candidateJob: OrderCandidateJob | null;
  public agencyActionsAllowed: boolean;
  public irpCandidates: PageOfCollections<IrpOrderCandidate>;
  public isFeatureIrpEnabled = false;

  constructor(
    protected override store: Store,
    protected override router: Router,
    private candidateApiService: OrderCandidateApiService,
    ) {
    super(store, router);
    this.setIrpFeatureFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscribeOnChangeCandidateJob();

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }

    if (this.selectedOrder.irpOrderMetadata) {
      this.getIrpCandidates();
    }
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    if (this.order?.isClosed) {
      return;
    }

    this.candidate = { ...data };
    if (this.order && this.candidate) {
      if (this.isAgency) {
        if ([ApplicantStatus.NotApplied, ApplicantStatus.Withdraw].includes(this.candidate.status)) {
          this.candidateJob = null;
          this.store.dispatch(
            new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId)
          );
        } else {
          this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
        }
      } else {
        this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId));
        if (!this.isOnboardOrRejectStatus() && !this.isAgency) {
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, data.candidateJobId));
        }
      }
      this.openDetails.next(true);
    }
  }

  private subscribeOnChangeCandidateJob(): void {
    merge(this.candidateJobOrganisationState$, this.candidateJobAgencyState$)
      .pipe(
        filter((candidateJob) => !!candidateJob),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((candidateJob: OrderCandidateJob) => (this.candidateJob = candidateJob));
  }

  private isOnboardOrRejectStatus(): boolean {
    return [ApplicantStatus.OnBoarded, ApplicantStatus.Rejected].includes(this.candidate?.status);
  }

  protected override emitGetCandidatesList(): void {
    this.getCandidatesList.emit({
      orderId: this.order.orderId,
      organizationId: this.order.organizationId,
      currentPage: this.currentPage,
      pageSize: this.pageSize,
      excludeDeployed: false,
    });
  }

  private checkForAgencyStatus(): void {
    this.store.select(UserState.agencyActionsAllowed)
    .pipe(
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$),
    )
    .subscribe((value) => {
      this.agencyActionsAllowed = value;
    });
  }

  private getIrpCandidates(): void {
    this.candidateApiService.getIrpCandidates(this.selectedOrder.irpOrderMetadata?.orderId as number)
    .pipe(
      takeUntil(this.unsubscribe$),
    )
    .subscribe((candidates) => {
      this.irpCandidates = candidates;
    });
  }

  private setIrpFeatureFlag(): void {
    this.isFeatureIrpEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }
}
