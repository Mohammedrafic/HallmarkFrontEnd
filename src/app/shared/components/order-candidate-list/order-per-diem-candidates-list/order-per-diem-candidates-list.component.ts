import { Component, Inject, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Select, Store } from '@ngxs/store';
import { Observable, distinctUntilChanged, filter, merge, takeUntil } from 'rxjs';

import { GetCandidateJob, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { GlobalWindow } from '@core/tokens';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SelectedSystems } from '@shared/components/credentials-list/constants';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { OrganizationSettingKeys, OrganizationalHierarchy } from '@shared/constants';
import { ApplicantStatus } from '@shared/enums/applicant-status.enum';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { SettingsViewService } from '@shared/services';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { getDialogNextPreviousOption } from '@shared/helpers/canidate-navigation.helper';
import { PartnershipStatus } from '@shared/enums/partnership-settings';
import { DateTimeHelper } from '@core/helpers';

@Component({
  selector: 'app-order-per-diem-candidates-list',
  templateUrl: './order-per-diem-candidates-list.component.html',
  styleUrls: ['./order-per-diem-candidates-list.component.scss'],
})
export class OrderPerDiemCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  @Input() selectedOrder: Order;

  @Input() system: OrderManagementIRPSystemId;

  public candidate: OrderCandidatesList;
  public candidateJob: OrderCandidateJob | null;
  public agencyActionsAllowed: boolean;
  public isFeatureIrpEnabled = false;
  public isCandidatePayRateVisible: boolean;
  public readonly systemType = OrderManagementIRPSystemId;
  public selectedIndex: number;
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public selectedSystem: SelectedSystemsFlag = SelectedSystems;
  private isOrgIRPEnabled = false;
  private previousSelectedSystemId: OrderManagementIRPSystemId | null;
  private isOrgVMSEnabled = false;
  public OrderManagementIRPSystemId = OrderManagementIRPSystemId;
  public activeSystem: OrderManagementIRPSystemId;
  public readonly partnershipStatus = PartnershipStatus;

  constructor(
    protected override store: Store,
    protected override router: Router,
    private settingService: SettingsViewService,
    private orderManagementService: OrderManagementService,
    private cd: ChangeDetectorRef,
    @Inject(GlobalWindow) protected override readonly globalWindow : WindowProxy & typeof globalThis,
    ) {
    super(store, router, globalWindow);
    this.setIrpFeatureFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.subscribeOnChangeCandidateJob();

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }
    this.organizationId$.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe((id) => {
      this.getOrganization(id);
    });
  }

  public emitChangeCandidate(isNext: boolean): void {
    const nextIndex = isNext ? this.selectedIndex + 1 : this.selectedIndex - 1;
    const nextCandidate = (this.grid.dataSource as OrderCandidatesList[])[nextIndex];
    this.candidate = nextCandidate;
    this.selectedIndex = nextIndex;
    this.getCandidateJob(this.candidate);
    this.dialogNextPreviousOption =
      getDialogNextPreviousOption(this.candidate, this.grid.dataSource as OrderCandidatesList[]);
  }

  public getPartnershipMessage(data: OrderCandidatesList): string {
    return `Partnership was suspended on ${DateTimeHelper.formatDateUTC(data.suspentionDate, 'MM/dd/yyyy')}`;
  }

  public onEdit(data: OrderCandidatesList & { index: string }): void {
    this.candidate = { ...data };
    this.getCandidatePayRateSetting();
    this.selectedIndex = Number(data.index);
    this.dialogNextPreviousOption =
      getDialogNextPreviousOption(this.candidate, this.grid.dataSource as OrderCandidatesList[]);
    this.getCandidateJob(this.candidate);
  }

  private getCandidateJob(data: OrderCandidatesList): void {
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
      .subscribe((candidateJob: OrderCandidateJob) => {
        this.candidateJob = candidateJob;
        this.cd.markForCheck();
      });
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

  private setPreviousSelectedSystem(): void {
    this.previousSelectedSystemId = this.orderManagementService.getOrderManagementSystem();
  }

  private getOrganization(businessUnitId: number) {

    const id = businessUnitId || this.store.selectSnapshot(UserState.user)?.businessUnitId as number;

    this.store.dispatch(new GetOrganizationById(id)).pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      const { isIRPEnabled, isVMCEnabled } =
        this.store.selectSnapshot(OrganizationManagementState.organization)?.preferences || {};

      this.isOrgIRPEnabled = !!isIRPEnabled;
      this.isOrgVMSEnabled = !!isVMCEnabled;
      this.setPreviousSelectedSystem();
      
      if (this.previousSelectedSystemId === OrderManagementIRPSystemId.IRP && !this.isOrgIRPEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.VMS;
      } else if (this.previousSelectedSystemId === OrderManagementIRPSystemId.IRP && this.isOrgIRPEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.IRP;
      }

      if (this.previousSelectedSystemId === OrderManagementIRPSystemId.VMS && !this.isOrgVMSEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.IRP;
      } else if (this.previousSelectedSystemId === OrderManagementIRPSystemId.VMS && this.isOrgVMSEnabled) {
        this.activeSystem = OrderManagementIRPSystemId.VMS;
      }

      this.previousSelectedSystemId = null;
    });
  }
}
