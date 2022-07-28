import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { filter, merge, Observable, Subject, takeUntil } from 'rxjs';

import { OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { OrderManagementState } from '@agency/store/order-management.state';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';

@Component({
  selector: 'app-order-per-diem-candidates-list',
  templateUrl: './order-per-diem-candidates-list.component.html',
  styleUrls: ['./order-per-diem-candidates-list.component.scss'],
})
export class OrderPerDiemCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  public templateState: Subject<any> = new Subject();
  public candidate: OrderCandidatesList;
  public candidateJob: OrderCandidateJob | null;

  constructor(protected override store: Store, protected override router: Router) {
    super(store, router);
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscribeOnChangeCandidateJob();
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    this.candidate = { ...data };
    this.addActiveCssClass(event);

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
}
