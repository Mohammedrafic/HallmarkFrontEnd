import { ClearDeployedCandidateOrderInfo, GetCandidateJob,
  GetDeployedCandidateOrderInfo, GetOrderApplicantsData } from '@agency/store/order-management.actions';
import { OrderManagementState } from '@agency/store/order-management.state';
import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GetAvailableSteps, GetOrganisationCandidateJob,
  GetPredefinedBillRates } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { Select, Store } from '@ngxs/store';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { ApplicantStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { IrpOrderCandidate, Order, OrderCandidatesList } from '@shared/models/order-management.model';
import { DeployedCandidateOrderInfo } from '@shared/models/deployed-candidate-order-info.model';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, filter, takeUntil } from 'rxjs/operators';
import { UserState } from 'src/app/store/user.state';
import { Duration } from '@shared/enums/durations';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { AcceptCandidateComponent } from './accept-candidate/accept-candidate.component';
import { ApplyCandidateComponent } from './apply-candidate/apply-candidate.component';
import { OfferDeploymentComponent } from './offer-deployment/offer-deployment.component';
import { OnboardedCandidateComponent } from './onboarded-candidate/onboarded-candidate.component';
import { OrderType } from '@shared/enums/order-type';
import { AppState } from 'src/app/store/app.state';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';
import { SettingsViewService } from '@shared/services';
import { OrganizationalHierarchy, OrganizationSettingKeys } from '@shared/constants';
import { EditCandidateDialogState } from '@shared/components/order-candidate-list/interfaces';
import { OrderStatus } from '@shared/enums/order-management';
import { GlobalWindow } from '@core/tokens';
import { OrganizationManagementState } from '@organization-management/store/organization-management.state';
import { SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { SelectedSystems } from '@shared/components/credentials-list/constants';
import { GetOrganizationById } from '@organization-management/store/organization-management.actions';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';
import { UserPermissions } from '@core/enums';

@Component({
  selector: 'app-order-candidates-list',
  templateUrl: './order-candidates-list.component.html',
  styleUrls: ['./order-candidates-list.component.scss'],
})
export class OrderCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;
  @ViewChild('accept') accept: AcceptCandidateComponent;
  @ViewChild('apply') apply: ApplyCandidateComponent;
  @ViewChild('onboarded') onboarded: OnboardedCandidateComponent;
  @ViewChild('offerDeployment') offerDeployment: OfferDeploymentComponent;

  @Input() system: OrderManagementIRPSystemId;
  @Input() orderDetails : Order;

  @Select(OrderManagementState.selectedOrder)
  public selectedAgOrder$: Observable<Order>;

  @Select(OrderManagementContentState.selectedOrder)
  public selectedOrgOrder$: Observable<Order>;

  @Select(OrderManagementState.deployedCandidateOrderInfo)
  public readonly deployedCandidateOrderInfo$: Observable<DeployedCandidateOrderInfo[]>;

  @Select(UserState.lastSelectedOrganizationId)
  organizationId$: Observable<number>;

  public isIRPLTAorder:boolean=false;
  public templateState: Subject<any> = new Subject();
  public targetElement: HTMLElement | null = document.body.querySelector('#main');
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidate: OrderCandidatesList;
  public applicantStatus = ApplicantStatus;
  public offboardCandidate: CandidatStatus = CandidatStatus.Offboard;
  public cancelledCandidate: CandidatStatus = CandidatStatus.Cancelled;
  public selectedOrder: Order;
  public agencyActionsAllowed = true;
  public deployedCandidateOrderIds: string[] = [];
  public isOrderOverlapped = false;
  public OrderManagementIRPSystemId = OrderManagementIRPSystemId;
  public activeSystem: OrderManagementIRPSystemId;
  public hideWithStatus = [
    ApplicantStatus.Rejected,
    ApplicantStatus.Cancelled,
    ApplicantStatus.NotApplied,
    ApplicantStatus.Withdraw,
  ];
  public orderTypes = OrderType;
  public isFeatureIrpEnabled = false;
  public readonly systemType = OrderManagementIRPSystemId;
  public isCandidatePayRateVisible: boolean;
  public readonly orderStatus = OrderStatus;
  public editCandidateDialogState: EditCandidateDialogState = {
    isOpen: false,
    candidate: {} as IrpOrderCandidate,
    order: {} as Order,
  };
  public commentContainerId = 0;

  private selectedSystem: SelectedSystemsFlag = SelectedSystems;
  private isOrgIRPEnabled = false;
  private previousSelectedSystemId: OrderManagementIRPSystemId | null;
  private isOrgVMSEnabled = false;
  private readonly permissions = UserPermissions;

  get isShowDropdown(): boolean {
    return [ApplicantStatus.OnBoarded].includes(this.candidate.status) && !this.isAgency;
  }

  get canEditClosedBillRates(): boolean {
    return this.userPermission[this.permissions.CanUpdateBillRates];
  }

  constructor(
    protected override store: Store,
    protected override router: Router,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private settingService: SettingsViewService,
    @Inject(GlobalWindow) protected override readonly globalWindow : WindowProxy & typeof globalThis,
    private orderManagementService: OrderManagementService,
  ) {
    super(store, router, globalWindow);
    this.setIrpFeatureFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    combineLatest([this.selectedAgOrder$, this.selectedOrgOrder$])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([agOrder, orgOrder]) => {
        this.selectedOrder = agOrder ?? orgOrder;
        this.isIRPLTAorder = this.selectedOrder.orderType === this.orderTypes.LongTermAssignment;
        this.initPredefinedBillRates();
      });
    if (this.isAgency) {
      this.checkForAgencyStatus();
      this.subscribeToDeployedCandidateOrdersInfo();
    }
    this.organizationId$.pipe(
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe((id) => {
      this.getOrganization(id);
    });
    if(this.orderDetails?.commentContainerId != undefined){
    this.commentContainerId = this.orderDetails.commentContainerId;
    }
  }

  public onEdit(data: OrderCandidatesList): void {
    this.candidate = { ...data };
    this.getDeployedCandidateOrders();
    this.getCandidatePayRateSetting();

    this.orderCandidateListViewService.setIsCandidateOpened(true);
    if (this.order && this.candidate) {
      if (this.isAgency) {
        const allowedApplyStatuses = [ApplicantStatus.NotApplied, ApplicantStatus.Withdraw];
        const allowedAcceptStatuses = [
          ApplicantStatus.Offered,
          ApplicantStatus.Accepted,
          ApplicantStatus.Rejected,
          ApplicantStatus.Applied,
          ApplicantStatus.Shortlisted,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
          ApplicantStatus.PreOfferCustom,
          ApplicantStatus.Offboard,
        ];

        if (allowedApplyStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrderApplicantsData(this.order.orderId, this.order.organizationId, this.candidate.candidateId)
          );
          data.candidateJobId &&
            this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
          this.openDialog(this.apply);
        } else if (allowedAcceptStatuses.includes(this.candidate.status)) {
          this.store.dispatch(new GetCandidateJob(this.order.organizationId, data.candidateJobId));
          this.openDialog(this.accept);
        }
      } else if (this.isOrganization) {

        const allowedOfferDeploymentStatuses = [
          ApplicantStatus.Withdraw,
          ApplicantStatus.Rejected,
          ApplicantStatus.Applied,
          ApplicantStatus.Shortlisted,
          ApplicantStatus.PreOfferCustom,
          ApplicantStatus.Offered,
        ];
        const allowedOnboardedStatuses = [
          ApplicantStatus.Accepted,
          ApplicantStatus.OnBoarded,
          ApplicantStatus.Cancelled,
          ApplicantStatus.Offboard,
        ];

        if (allowedOfferDeploymentStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId)
          );
          if (!this.isShowDropdown) {
            this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          }
          this.openDialog(this.offerDeployment);
        } else if (allowedOnboardedStatuses.includes(this.candidate.status)) {
          this.store.dispatch(
            new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId)
          );
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
          this.openDialog(this.onboarded);
        }
      }
    }
  }

  public saveIrpCandidate(): void {
    this.emitGetCandidatesList();
  }

  public onCloseDialog(): void {
    this.clearDeployedCandidateOrderInfo();
    this.sideDialog.hide();
  }

  public openEditCandidateModal(candidate: IrpOrderCandidate): void {
    this.editCandidateDialogState = {
      isOpen: true,
      candidate,
      order: this.selectedOrder,
    };
  }

  public closeEditCandidateModal(event: boolean): void {
    this.editCandidateDialogState = {
      ...this.editCandidateDialogState,
      isOpen: event,
    };
  }

  private getDeployedCandidateOrders(): void {
    if (!!this.candidate.deployedCandidateInfo) {
      const candidateId = this.candidate.candidateId;
      const organizationId = this.candidate.organizationId || this.candidate.deployedCandidateInfo.organizationId;
      this.store.dispatch(new GetDeployedCandidateOrderInfo(this.order.orderId, candidateId, organizationId));
    }
  }

  private openDialog(template: any): void {
    this.templateState.next(template);
    this.sideDialog.show();
  }

  private checkForAgencyStatus(): void {
    this.store
      .select(UserState.agencyActionsAllowed)
      .pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$))
      .subscribe((value) => {
        this.agencyActionsAllowed = value;
      });
  }

  private initPredefinedBillRates(): void {
    this.store.dispatch(new GetPredefinedBillRates());
  }

  private subscribeToDeployedCandidateOrdersInfo(): void {
    this.deployedCandidateOrderInfo$.pipe(takeUntil(this.unsubscribe$)).subscribe((ordersInfo) => {
      this.isOrderOverlapped = this.isOrderOverlappingByDate(ordersInfo);
      this.deployedCandidateOrderIds = ordersInfo.map((data) => data.orderPublicId);
    });
  }

  private isOrderOverlappingByDate(ordersInfo: DeployedCandidateOrderInfo[]): boolean {
    const timeRange_1 = {
      start: this.selectedOrder.jobStartDate,
      end: this.selectedOrder.jobEndDate,
    };
    const isOverlaped: boolean[] = [];

    ordersInfo.forEach((order) => {
      const timeRange_2 = {
        start: order.positionActualStartDate,
        end: order.positionActualEndDate,
      };
      isOverlaped.push(this.isThereOverlappingDateRange(timeRange_1, timeRange_2));
    });

    return isOverlaped.includes(true);
  }

  private isThereOverlappingDateRange(
    timeRange_1: { start: Date | string; end: Date | string },
    timeRange_2: { start: Date | string; end: Date | string }
  ): boolean {
    const startDate_1 = new Date(timeRange_1.start).getTime();
    const endDate_1 = new Date(timeRange_1.end).getTime();
    const startDate_2 = new Date(timeRange_2.start).getTime();
    const endDate_2 = new Date(timeRange_2.end).getTime();

    if (endDate_1 && endDate_2) {
      return startDate_1 <= endDate_2 && startDate_2 <= endDate_1;
    }
    if (endDate_1 && !endDate_2) {
      return endDate_1 > startDate_2;
    }
    if (!endDate_1 && endDate_2) {
      return startDate_1 < endDate_2;
    }
    return true;
  }

  private clearDeployedCandidateOrderInfo(): void {
    if (this.deployedCandidateOrderIds.length) {
      this.store.dispatch(new ClearDeployedCandidateOrderInfo());
    }
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
