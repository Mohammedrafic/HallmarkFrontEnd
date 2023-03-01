import { GetCandidateJob, ReloadOrderCandidatesLists } from '@agency/store/order-management.actions';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GetAvailableSteps, GetOrganisationCandidateJob } from '@client/store/order-managment-content.actions';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { DialogNextPreviousOption } from '@shared/components/dialog-next-previous/dialog-next-previous.component';
import { OrderCandidateListViewService } from '@shared/components/order-candidate-list/order-candidate-list-view.service';
import { OrganizationalHierarchy, OrganizationSettingKeys, RECORD_MODIFIED } from '@shared/constants';
import { ApplicantStatus as CandidateStatus, CandidatStatus } from '@shared/enums/applicant-status.enum';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

import { Order, OrderCandidateJob, OrderCandidatesList } from '@shared/models/order-management.model';
import { SettingsViewService } from '@shared/services';
import { catchError, distinctUntilChanged, filter, merge, Observable, takeUntil, tap } from 'rxjs';
import { AppState } from 'src/app/store/app.state';
import { UserState } from 'src/app/store/user.state';
import { AbstractOrderCandidateListComponent } from '../abstract-order-candidate-list.component';
import { OrderCandidateApiService } from '../order-candidate-api.service';
import { CreateCandidateDto } from '@shared/components/order-candidate-list/edit-candidate-list.helper';
import { HttpErrorResponse } from '@angular/common/http';
import { ShowToast } from '../../../../store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';

enum ReorderCandidateStatuses {
  BillRatePending = 44,
  OfferedBR = 47,
  Onboard = 60,
  Rejected = 100,
  Cancelled = 110,
  Offboard = 90,
}

@Component({
  selector: 'app-reorder-candidates-list',
  templateUrl: './reorder-candidates-list.component.html',
  styleUrls: ['./reorder-candidates-list.component.scss'],
})
export class ReorderCandidatesListComponent extends AbstractOrderCandidateListComponent implements OnInit {
  @Input() selectedOrder: Order;

  @Input() system: OrderManagementIRPSystemId;

  public candidate: OrderCandidatesList;
  public dialogNextPreviousOption: DialogNextPreviousOption = { next: false, previous: false };
  public candidateStatuses = ReorderCandidateStatuses;
  public candidateJob: OrderCandidateJob;
  public agencyActionsAllowed: boolean;
  public isFeatureIrpEnabled = false;
  public isCandidatePayRateVisible: boolean;
  public readonly cancelledStatusName = ReorderCandidateStatuses[ReorderCandidateStatuses.Cancelled];
  public readonly systemType = OrderManagementIRPSystemId;
  public readonly onboardedCandidate: CandidateStatus = CandidateStatus.OnBoarded;

  private selectedIndex: number;

  constructor(
    protected override store: Store,
    protected override router: Router,
    private orderCandidateListViewService: OrderCandidateListViewService,
    private candidateApiService: OrderCandidateApiService,
    private actions$: Actions,
    private settingService: SettingsViewService,
    private cdr: ChangeDetectorRef,
    private orderCandidateApiService: OrderCandidateApiService
  ) {
    super(store, router);
    this.setIrpFeatureFlag();
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.onChangeCandidateJob().pipe(takeUntil(this.unsubscribe$)).subscribe();
    this.subscribeOnReloadAction();

    if (this.isAgency) {
      this.checkForAgencyStatus();
    }
  }

  public onEdit(data: OrderCandidatesList & { index: string }, event: MouseEvent): void {
    if (this.order?.isClosed && data.statusName !== this.cancelledStatusName) {
      return;
    }

    this.candidate = { ...data };
    this.selectedIndex = Number(data.index);

    this.getCandidateJobData();
    this.getCandidatePayRateSetting();
    this.dialogNextPreviousOption = this.getDialogNextPreviousOption(this.candidate);
    this.orderCandidateListViewService.setIsCandidateOpened(true);
    this.openDetails.next(true);
  }

  private getCandidateJobData(): void {
    if (this.order && this.candidate) {
      if (this.isAgency) {
        this.store.dispatch(new GetCandidateJob(this.order.organizationId, this.candidate.candidateJobId));
      } else if (this.isOrganization) {
        const isGetAvailableSteps = [CandidatStatus.BillRatePending,
          CandidatStatus.OfferedBR, CandidatStatus.OnBoard].includes(
          this.candidate.status
        );

        this.store.dispatch(new GetOrganisationCandidateJob(this.order.organizationId, this.candidate.candidateJobId));
        isGetAvailableSteps &&
          this.store.dispatch(new GetAvailableSteps(this.order.organizationId, this.candidate.candidateJobId));
      }
    }
  }

  private getDialogNextPreviousOption(selectedOrder: OrderCandidatesList): DialogNextPreviousOption {
    const gridData = this.grid.dataSource as OrderCandidatesList[];
    const [first] = gridData;
    const last = gridData[gridData.length - 1];
    return {
      previous: first.candidateId !== selectedOrder.candidateId,
      next: last.candidateId !== selectedOrder.candidateId,
    };
  }

  public changeIrpCandidateStatus(candidate: OrderCandidatesList): void {
    if(candidate.status === this.onboardedCandidate) {
      return;
    }
 
    this.orderCandidateApiService.createIrpCandidate(
      CreateCandidateDto(candidate.candidateProfileId, this.selectedOrder.id)
    ).pipe(
      catchError((error: HttpErrorResponse) => this.orderCandidateApiService.handleError(error)),
      filter(Boolean),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_MODIFIED));
      this.emitGetCandidatesList();
    });
  }

  public onNextPreviousOrderEvent(next: boolean): void {
    const nextIndex = next ? this.selectedIndex + 1 : this.selectedIndex - 1;
    const nextCandidate = (this.grid.dataSource as OrderCandidatesList[])[nextIndex];
    this.candidate = nextCandidate;
    this.selectedIndex = nextIndex;
    this.getCandidateJobData();
    this.dialogNextPreviousOption = this.getDialogNextPreviousOption(this.candidate);
  }

  private onChangeCandidateJob(): Observable<OrderCandidateJob> {
    return merge(this.candidateJobOrganisationState$, this.candidateJobAgencyState$).pipe(
      filter((candidateJob) => !!candidateJob),
      tap((candidateJob: OrderCandidateJob) => (this.candidateJob = candidateJob, this.cdr.detectChanges()))
    );
  }

  private subscribeOnReloadAction(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(ReloadOrderCandidatesLists)).subscribe(() => {
      this.emitGetCandidatesList();
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
        this.cdr.markForCheck();
      });
    }
  }
}
