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

import { AfterViewInit, ChangeDetectorRef, Component,EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
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
import { distinct, distinctUntilChanged, skip } from 'rxjs/operators';
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
import { MultiselectDropdownComponent } from '@shared/components/form-controls/multiselect-dropdown/multiselect-dropdown.component';
import { OutsideZone } from '@core/decorators';
import { SyncOptionType } from './add-edit-reorder.interface';

@Component({
  selector: 'app-add-edit-reorder',
  templateUrl: './add-edit-reorder.component.html',
  styleUrls: ['./add-edit-reorder.component.scss'],
})
export class AddEditReorderComponent extends DestroyableDirective implements OnInit, OnDestroy, AfterViewInit, OnChanges {
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

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private reorderService: AddEditReorderService,
    private commentsService: CommentsService,
    private actions$: Actions,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) {
    super();
    this.createForm();
  }

  public get isEditMode(): boolean {
    return this.order?.reOrderFromId !== 0;
  }

  ngOnInit(): void {
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

  ngOnChanges(): void {
    if (this.order) {
      this.setFormData(this.order);
      this.setInitialDatesValue();
      this.getComments();
    }
  }

  ngAfterViewInit(): void {
    this.initAgenciesAndCandidates();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public onSave(): void {
    if (this.reorderForm.invalid) {
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

  public setInitialDatesValue(): void {
    const { jobStartDate, shiftStartTime, shiftEndTime } = this.order;
    this.initialDates = {
      shiftStartTime,
      shiftEndTime,
      jobStartDate,
    };
  }

  public isDatesChanged(): boolean {
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

  private getComments(): void {
    this.commentsService.getComments(this.order.commentContainerId as number, null).subscribe((comments: Comment[]) => {
      this.comments = comments;
    });
  }

  private initAgenciesAndCandidates(): void {
    const { id, organizationId, reOrderFromId, skillId } = this.order;
    const isReOrder = !isNil(reOrderFromId) && reOrderFromId !== 0;
    const orderId = isReOrder ? reOrderFromId : id;
    this.billRate$ = this.reorderService.getBillRate(organizationId!, skillId).pipe(filter(() => !this.isEditMode));

    forkJoin([
      this.reorderService.getAgencies(this.order.id, orderId),
      this.reorderService.getCandidates(orderId, organizationId as number, this.order.id),
    ])
    .pipe(
      takeUntil(this.destroy$),
    )
    .subscribe(([agencies, candidates]) => {
      this.numberOfAgencies = agencies.length;
      this.agencies = agencies;
      this.candidates = candidates;
      const orderCandidates = this.order.candidates;

      this.reorderForm.patchValue({
        agencies: this.getAgencyIds(this.order.jobDistributions),
        candidates: orderCandidates ? this.getCandidateIds(orderCandidates) : [],
      });

      this.cdr.markForCheck();
      this.disableOptions();
    });
  }

  @OutsideZone
  private disableOptions(): void {
    const statusesToDisable = ['Onboard', 'Cancelled', 'Offboard'];

      setTimeout(() => {
        const agencyItems: NodeList[] = this.agencySelector.selector['popupObj'].element.querySelectorAll('.e-list-item');
        const candidatesItems: NodeList[] = this.candidatesSelector.selector['popupObj']
        .element.querySelectorAll('.e-list-item');

        agencyItems.forEach((element) => {
          // We can't use Node and NodeList interfaces as syncfusion modified it.
          const el = element as unknown as SyncOptionType;
          const optionValue = el.dataset.value;
          const agency = this.agencies.find((agency) => agency.agencyId === Number(optionValue));

          if (agency && agency.hasActiveCandidate) {
            (el as unknown as HTMLElement).classList.add('hidden-option');
          }
        });

        candidatesItems.forEach((element) => {
          const el = element as unknown as SyncOptionType;
          const optionValue = el.dataset.value;
          const candidate = this.candidates.find((candidate) => candidate.candidateId === Number(optionValue));
          
          if (candidate && candidate.hasActiveCandidate) {
            (el as unknown as HTMLElement).classList.add('hidden-option');
          }
        });
      }, 500);
  }

  private setFormData(reorder?: Order): void {
    const { jobStartDate, shiftStartTime, shiftEndTime, hourlyRate, openPositions } = reorder || {};
      
    this.reorderForm.patchValue({
      reorderDate: jobStartDate ? DateTimeHelper.convertDateToUtc(jobStartDate.toString()) : '',
      shiftStartTime: shiftStartTime ? DateTimeHelper.convertDateToUtc(shiftStartTime.toString()) : '',
      shiftEndTime: shiftEndTime ? DateTimeHelper.convertDateToUtc(shiftEndTime.toString()) : '',
      billRate: hourlyRate ?? '',
      openPosition: openPositions ?? '',
    });
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
      filter((agenciesIds) => !!agenciesIds),
      tap((agenciesIds: number[]) => {
        const candidates = this.reorderForm.get('candidates')?.value;
        if (!agenciesIds.length && candidates.length) {
          this.reorderForm.patchValue({ openPosition: null, candidates: [] });
          this.reorderForm.updateValueAndValidity();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private listenCandidateChanges(): void {
    this.reorderForm
      .get('candidates')
      ?.valueChanges.pipe(
        skip(1),
        tap((candidateIds: number[]) => {
          if (!candidateIds.length) {
            this.reorderForm.patchValue({ openPosition: null, agencies: this.getAgencyIds(this.order.jobDistributions) });
            this.reorderForm.updateValueAndValidity();
          } else {
            this.reorderForm.patchValue({ openPosition: candidateIds?.length || 1 });
          }
        }),
        filter((candidateIds: number[]) => !!candidateIds?.length),
        map((candidateIds) => {
          const cands = this.candidates.filter((candidate: CandidateModel) => candidateIds.includes(candidate.candidateId));
          return this.getAgenciesBelongToCandidates(cands);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((agencies: number[]) => {
        const uniqueAgencies = uniq(agencies);
        this.reorderForm?.patchValue({ agencies: uniqueAgencies });
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
    return DateTimeHelper.toUtcFormat(date1) === DateTimeHelper.toUtcFormat(date2);
  }

  private saveReorder(): void {
    const reorder: ReorderModel = this.reorderForm.getRawValue();
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
}
