import { HttpErrorResponse } from '@angular/common/http';
import isNil from 'lodash/fp/isNil';
import uniq from 'lodash/fp/uniq';

import {
  catchError,
  filter,
  forkJoin,
  map,
  merge,
  Observable,
  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';

import { AfterViewInit, ChangeDetectorRef, Component,EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output,
  ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddEditReorderService } from '@client/order-management/components/add-edit-reorder/add-edit-reorder.service';
import { AgencyModel, CandidateModel } from '@client/order-management/components/add-edit-reorder/models/candidate.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Order } from '@shared/models/order-management.model';
import {
  ReorderModel,
  ReorderRequestModel,
  ReorderResponse,
} from '@client/order-management/components/add-edit-reorder/models/reorder.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { skip } from 'rxjs/operators';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';
import {
  ONBOARDED_STATUS,
} from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { DateTimeHelper } from '@core/helpers';
import { SaveOrderSucceeded } from '@client/store/order-managment-content.actions';
import { AlertIdEnum, AlertParameterEnum } from '@admin/alerts/alerts.enum';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { UserState } from 'src/app/store/user.state';
import { AlertTriggerDto } from '@shared/models/alerts-template.model';
import { OrderStatus } from '@shared/enums/order-management';
import { AlertTrigger } from '@admin/store/alerts.actions';
import { getAllErrors } from '@shared/utils/error.utils';
import { MultiselectDropdownComponent,
} from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.component';
import { PermissionService } from 'src/app/security/services/permission.service';

@Component({
  selector: 'app-add-edit-reorder',
  templateUrl: './add-edit-reorder.component.html',
  styleUrls: ['./add-edit-reorder.component.scss'],
})
export class AddEditReorderComponent extends DestroyableDirective implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('agencySelector') agencySelector: MultiselectDropdownComponent;

  @ViewChild('candidatesSelector') candidatesSelector: MultiselectDropdownComponent;

  @Input() public order: Order;

  @Output() public saveEmitter: EventEmitter<void> = new EventEmitter<void>();

  public readonly agenciesOptionFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public readonly candidatesOptionFields: FieldSettingsModel = { text: 'candidateName', value: 'candidateId' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public readonly timepickerMask = { hour: 'HH', minute: 'MM' };
  public readonly numericInputAttributes = { maxLength: '10' };

  public reorderForm: FormGroup;
  public dialogTitle = 'Add Re-Order';
  public candidates: CandidateModel[];
  public agencies: AgencyModel[];
  public billRate$: Observable<number>;
  public commentContainerId = 0;
  public comments: Comment[] = [];
  public initialDates: {
    shiftStartTime: Date;
    shiftEndTime: Date;
    jobStartDate: Date;
  };
  private unsubscribe$: Subject<void> = new Subject();
  private numberOfAgencies: number;
  private multipleReorderDates: Date[] = [];
  public canCreateOrder: boolean;

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private reorderService: AddEditReorderService,
    private commentsService: CommentsService,
    private actions$: Actions,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private permissionService: PermissionService
  ) {
    super();
    this.createForm();
  }

  public get isEditMode(): boolean {
    return this.order?.reOrderFromId !== 0;
  }

  ngOnInit(): void {
    this.subscribeOnPermissions();
    this.listenCandidateChanges();
    this.listenAginciesChanges();
    this.commentContainerId = this.order.commentContainerId as number;
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionDispatched(SaveOrderSucceeded)).subscribe((data) => {
      const userAgencyOrganization = this.store.selectSnapshot(UserState.organizations) as UserAgencyOrganization;
      let orgName = userAgencyOrganization?.businessUnits?.find(i => i.id == data?.order?.organizationId)?.name;
      let params: any = {};
      params['@' + AlertParameterEnum[AlertParameterEnum.Organization]] = orgName == null || orgName == undefined ? "" : orgName;
      params['@' + AlertParameterEnum[AlertParameterEnum.OrderID]] =
        data?.order?.organizationPrefix == null
          ? data?.order?.publicId + ''
          : data?.order?.organizationPrefix + '-' + data?.order?.publicId;
      params['@' + AlertParameterEnum[AlertParameterEnum.Location]] = data?.order?.locationName;
      params['@' + AlertParameterEnum[AlertParameterEnum.Skill]] = data?.order?.skillName == null ? "" : data?.order?.skillName;
      //For Future Reference
      // var url = location.origin + '/ui/client/order-management/edit/' + data?.order?.id;
      params['@' + AlertParameterEnum[AlertParameterEnum.ClickbackURL]] = "";
      let alertTriggerDto: AlertTriggerDto = {
        BusinessUnitId: null,
        AlertId: 0,
        Parameters: null
      };
      if (data?.order?.status == OrderStatus.Open) {
        alertTriggerDto = {
          BusinessUnitId: data?.order?.organizationId,
          AlertId: AlertIdEnum['Order Status Update: Open'],
          Parameters: params,
        };
      }
      if (alertTriggerDto.AlertId > 0) {
        this.store.dispatch(new AlertTrigger(alertTriggerDto));
      }

    });
  }

  ngAfterViewInit(): void {
    this.initAgenciesAndCandidates();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public onSave(): void {
    const selectedAgencyIds = this.reorderForm.get('agencies')?.value;
    const selectedCandidateIds = this.reorderForm.get('candidates')?.value;
    const agenciesValid = this.reorderService.checkAgencies(this.agencies, selectedAgencyIds);
    const candidatesValid = this.reorderService.checkCandidates(this.candidates, selectedCandidateIds);
    const formInvalid = this.reorderForm.invalid || !agenciesValid || !candidatesValid;

    if (formInvalid) {
      this.reorderForm.markAllAsTouched();
      this.cdr.markForCheck();
    } else {
      this.saveReorder();
    }
  }

  public setMultipleDates(dates: Date[]): void {
    this.reorderForm.get('reorderDate')?.setValue(dates.length ? dates[0] : null);
    this.multipleReorderDates = dates;
  }

  private setInitialDatesValue(): void {
    const { jobStartDate, shiftStartTime, shiftEndTime } = this.order;
    this.initialDates = {
      shiftStartTime,
      shiftEndTime,
      jobStartDate,
    };
  }

  private isDatesChanged(): boolean {
    const { reorderDate, shiftEndTime, shiftStartTime } = this.reorderForm.getRawValue();
    const {
      jobStartDate: reorderDateInitial,
      shiftEndTime: shiftEndTimeInitial,
      shiftStartTime: shiftStartTimeInitial,
    } = this.initialDates;

    return (
      !this.areDatesEquals(reorderDate, reorderDateInitial) ||
      !this.areDatesEquals(shiftEndTime, shiftEndTimeInitial) ||
      !this.areDatesEquals(shiftStartTime, shiftStartTimeInitial)
    );
  }

  private initAgenciesAndCandidates(): void {
    const { id, organizationId, reOrderFromId, skillId } = this.order;
    const isReOrder = !isNil(reOrderFromId) && reOrderFromId !== 0;
    const reorderId = id;
    const perDiemId = isReOrder ? reOrderFromId : id;

    this.billRate$ = this.reorderService.getBillRate(organizationId!, skillId).pipe(filter(() => !this.isEditMode));

    forkJoin([
      this.reorderService.getAgencies(reorderId, perDiemId, isReOrder),
      this.reorderService.getCandidates(reorderId, perDiemId, isReOrder),
    ])
    .pipe(
      takeUntil(this.destroy$),
    )
    .subscribe(([agencies, candidates]) => {
      this.numberOfAgencies = agencies.length;
      this.agencies = agencies;
      this.candidates = candidates;

      this.setFormData(this.order);
      this.setInitialDatesValue();
      this.cdr.markForCheck();
    });
  }

  private setFormData(reorder: Order): void {
    const candidatesInOrder = this.order.candidates;

    this.reorderForm.patchValue({
      agencies: this.getAgencyIds(this.order.jobDistributions),
      candidates: candidatesInOrder ? this.getCandidateIds(candidatesInOrder) : [],
      reorderDate: reorder.jobStartDate ? DateTimeHelper.setCurrentUtcDate(reorder.jobStartDate.toString()) : '',
      shiftStartTime: reorder.shiftStartTime ? DateTimeHelper.setCurrentUtcDate(reorder.shiftStartTime.toString()) : '',
      shiftEndTime: reorder.shiftEndTime ? DateTimeHelper.setCurrentUtcDate(reorder.shiftEndTime.toString()) : '',
      billRate: reorder.hourlyRate ?? '',
      openPosition: reorder.openPositions ?? '',
    }, { emitEvent: false });
  }

  private createForm(): void {
    this.reorderForm = this.formBuilder.group({
      candidates: [],
      agencies: [null, Validators.required],
      reorderDate: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
      billRate: [null, Validators.required],
      openPosition: [null, [Validators.required, Validators.min(1)]],
    });
  }

  private listenAginciesChanges(): void {
    this.reorderForm.get('agencies')?.valueChanges
    .pipe(
      map((agenciesIds: number[]) => {
        const candidates: number[] = this.reorderForm.get('candidates')?.value;

        if (!agenciesIds.length && candidates.length) {
          this.reorderForm.patchValue({ candidates: [] });
          this.reorderForm.updateValueAndValidity();
        }

        return [agenciesIds, candidates];
      }),
      filter((data) => !!data[0].length && !!data[1].length),
      takeUntil(this.destroy$)
    ).subscribe(([agenciesIds, candidates]) => {
      this.checkCandidatesForSelectedAgencies(agenciesIds, candidates);
    });
  }

  private checkCandidatesForSelectedAgencies(agencyids: number[], candidatesIds: number[]): void {
    const selectedCandidates = this.candidates.filter((candidate) => candidatesIds.includes(candidate.candidateId));
    const canidatesBySelectedAgencies = selectedCandidates.filter((candidate) => agencyids.includes(candidate.agencyId))
    .map((candidate) => candidate.candidateId);

    if (canidatesBySelectedAgencies.length < candidatesIds.length) {
      this.reorderForm.patchValue({
        candidates: canidatesBySelectedAgencies,
      });
    }
  }

  private listenCandidateChanges(): void {
    this.reorderForm.get('candidates')
      ?.valueChanges.pipe(
        skip(1),
        tap((candidateIds: number[]) => {
          if (!candidateIds.length) {
            this.reorderForm.patchValue({ agencies: this.getAgencyIds(this.order.jobDistributions) });
            this.reorderForm.updateValueAndValidity();
          }
        }),
        filter((candidateIds: number[]) => !!candidateIds?.length),
        map((candidateIds) => {
          const cands = this.candidates.filter((candidate: CandidateModel) => candidateIds.includes(candidate.candidateId));
          return this.getAgenciesBelongToCandidates(cands);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((agencyIdsToSelect) => {
        const selectedAgenciesIds = this.reorderForm.get('agencies')?.value as number[];
        const agenciesToSet = selectedAgenciesIds
        .concat(agencyIdsToSelect.filter((id) => !selectedAgenciesIds.includes(id)));

        if (agenciesToSet.length >= selectedAgenciesIds.length) {
          this.reorderForm.patchValue({
            agencies: agenciesToSet,
          }, { emitEvent: false });
        }
      });
  }

  private getAgenciesBelongToCandidates(candidates: CandidateModel[]): number[] {
    const agencyIds = candidates.map(({ agencyId }: CandidateModel) => agencyId);
    return uniq(agencyIds);
  }

  private hasFilledPositions(): boolean {
    if (!this.order.candidates?.length) {
      return false;
    }

    return this.order.candidates.some((candidate) => candidate.status === ONBOARDED_STATUS);
  }

  private isWrongOpenPositionCount(payload: ReorderRequestModel): boolean {
    if (!this.order.candidates?.length) {
      return false;
    }

    const onboardedCandidates = this.order.candidates?.filter((candidate) => candidate.status === ONBOARDED_STATUS);

    return onboardedCandidates.length > payload.reorder.openPosition;
  }

  private areDatesEquals(date1: Date, date2: Date): boolean {
    return DateTimeHelper.setUtcTimeZone(date1) === DateTimeHelper.setUtcTimeZone(date2);
  }

  private saveReorder(): void {
    const reorder: ReorderModel = this.reorderForm.getRawValue();
    reorder.shiftStartTime = DateTimeHelper.setUtcTimeZone(reorder.shiftStartTime);
    reorder.shiftEndTime = DateTimeHelper.setUtcTimeZone(reorder.shiftEndTime);
    const agencyIds = this.numberOfAgencies === reorder.agencies.length ? null : reorder.agencies;
    const reOrderId = this.isEditMode ? this.order.id : null;
    const reOrderFromId = this.isEditMode ? this.order.reOrderFromId! : this.order.id;
    const payload = { reorder, agencyIds, reOrderId, reOrderFromId };

    if (this.isEditMode) {
      this.checkPositionsAndSave(<ReorderRequestModel>payload);
    } else {
      this.save(<ReorderRequestModel>payload);
    }
  }

  private showSaveErrorDateTimeIssue(): void {
    const message =
      'Re-order Date, Shift Start Time and Shift End Time CANNOT be edited if there is at least one Filled Position in this order.';
    this.store.dispatch(new ShowToast(MessageTypes.Error, message));
  }

  private showSaveErrorPositionsIssue(): void {
    const message =
      'Open Positions number CANNOT be less than the number of already Filled positions for this Re-Order';
    this.store.dispatch(new ShowToast(MessageTypes.Error, message));
  }

  private checkPositionsAndSave(payload: ReorderRequestModel): void {
    if (this.isWrongOpenPositionCount(<ReorderRequestModel>payload)) {
      this.showSaveErrorPositionsIssue();
      return;
    }

    if (this.hasFilledPositions()) {
      if (this.isDatesChanged()) {
        this.showSaveErrorDateTimeIssue();
      } else {
        this.save(<ReorderRequestModel>payload);
      }
    } else {
      this.save(<ReorderRequestModel>payload);
    }
  }

  private save(payload: ReorderRequestModel): void {
    this.reorderService.saveReorder(<ReorderRequestModel>payload, this.multipleReorderDates)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error: HttpErrorResponse) => {
          this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error)));
          return throwError(() => error);
        }),
        tap(() => {
          this.store.dispatch(new ShowToast(MessageTypes.Success, this.isEditMode ? RECORD_MODIFIED : RECORD_ADDED));
          this.saveEmitter.emit();
          this.multipleReorderDates = [];
        }),
        filter(() => !this.isEditMode && !!this.comments.length),
        switchMap((reorders: ReorderResponse[]) => {
          return merge(...this.getRequestsToSaveNewReordersComments(reorders));
        })
      )
      .subscribe();
  }

  private getAgencyIds(jobDistributions: JobDistributionModel[]): (number | null)[] | void {
    if (!jobDistributions?.length) {
      return [];
    }

    if (jobDistributions?.[0].agencyId === null) {
      return this.agencies.map(({ agencyId }: AgencyModel) => agencyId);
    } else {
      return jobDistributions?.map(({ agencyId }: JobDistributionModel) => agencyId);
    }
  }

  private getCandidateIds(candidate: CandidateModel[]): number[] {
    return candidate?.map(({ id }: CandidateModel) => id);
  }

  private getRequestsToSaveNewReordersComments(reorders: ReorderResponse[]): Observable<Comment>[] {
    return reorders.map((reOrder: ReorderResponse) => {
      const reOrderComments = this.comments.map((comment: Comment) => {
        return {
          ...comment,
          commentContainerId: reOrder.commentContainerId,
        };
      });

      return this.commentsService.saveCommentsBulk(reOrderComments);
    });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions().subscribe(({ canCreateOrder}) => {
      this.canCreateOrder = canCreateOrder;
    });
  }
}
