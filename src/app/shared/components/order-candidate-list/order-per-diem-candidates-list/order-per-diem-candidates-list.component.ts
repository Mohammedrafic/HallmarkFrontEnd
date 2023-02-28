import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, merge, Subject, takeUntil } from 'rxjs';

import { Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { UserState } from 'src/app/store/user.state';
import { AppState } from 'src/app/store/app.state';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { SettingsViewService } from '@shared/services';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';

@Component({
  selector: 'app-order-per-diem-candidates-list',
  templateUrl: './order-per-diem-candidates-list.component.html',
  styleUrls: ['./order-per-diem-candidates-list.component.scss'],
})
export class OrderPerDiemCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  @Input() selectedOrder: Order;

  @Input() system: OrderManagementIRPSystemId;

  public templateState: Subject<any> = new Subject();
  public candidate: OrderCandidatesList;
  public candidateJob: OrderCandidateJob | null;
  public agencyActionsAllowed: boolean;
  public isFeatureIrpEnabled = false;
  public isCandidatePayRateVisible: boolean;
  public readonly systemType = OrderManagementIRPSystemId;

  constructor(
    protected override store: Store,
    protected override router: Router,
    private settingService: SettingsViewService,
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
  }

  public onEdit(data: OrderCandidatesList, event: MouseEvent): void {
    if (this.order?.isClosed) {
      return;
    }

    this.candidate = { ...data };
    this.getCandidatePayRateSetting();
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
      isAvailable: this.isAvailable,
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

  private setIrpFeatureFlag(): void {
    this.isFeatureIrpEnabled = this.store.selectSnapshot(AppState.isIrpFlagEnabled);
  }

  private getCandidatePayRateSetting(): void {
    const organizationId = this.candidate.organizationId;

    if(organizationId) {
    this.settingService
      .getViewSettingKey(
        OrganizationSettingKeys.CandidatePayRate,
        OrganizationalHierarchy.Organization,
        organizationId,
        organizationId
      ).pipe(takeUntil(this.unsubscribe$))
      .subscribe(({ CandidatePayRate }) => {
        this.isCandidatePayRateVisible = JSON.parse(CandidatePayRate);
      });
    }
  }
}
