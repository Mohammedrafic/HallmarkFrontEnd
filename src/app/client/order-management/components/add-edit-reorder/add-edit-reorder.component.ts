import { HttpErrorResponse } from '@angular/common/http';
import isNil from 'lodash/fp/isNil';
import uniq from 'lodash/fp/uniq';

import {
  catchError,
  filter,
  first,
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

import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { shareReplay } from 'rxjs/operators';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';
import {
  ONBOARDED_STATUS,
} from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { DateTimeHelper } from '@core/helpers';
import { getTimeFromDate } from '@shared/utils/date-time.utils';
import { SaveOrderSucceeded } from '@client/store/order-managment-content.actions';
import { AlertIdEnum, AlertParameterEnum } from '@admin/alerts/alerts.enum';
import { UserAgencyOrganization } from '@shared/models/user-agency-organization.model';
import { UserState } from 'src/app/store/user.state';
import { AlertTriggerDto } from '@shared/models/alerts-template.model';
import { OrderStatus } from '@shared/enums/order-management';
import { AlertTrigger } from '@admin/store/alerts.actions';
import { getAllErrors } from '@shared/utils/error.utils';

@Component({
  selector: 'app-add-edit-reorder',
  templateUrl: './add-edit-reorder.component.html',
  styleUrls: ['./add-edit-reorder.component.scss'],
})
export class AddEditReorderComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @Input() public order: Order;
  @Output() public saveEmitter: EventEmitter<void> = new EventEmitter<void>();

  public readonly agenciesOptionFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public readonly candidatesOptionFields: FieldSettingsModel = { text: 'candidateName', value: 'candidateId' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public readonly timepickerMask = { hour: 'HH', minute: 'MM' };
  public readonly numericInputAttributes = { maxLength: '10' };

  public reorderForm: FormGroup;
  public dialogTitle: string = 'Add Re-Order';
  public candidates$: Observable<CandidateModel[]>;
  public agencies$: Observable<AgencyModel[]>;
  public billRate$: Observable<number>;
  public commentContainerId: number = 0;
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
  ) {
    super();
  }

  public get isEditMode(): boolean {
    return this.order?.reOrderFromId !== 0;
  }

  public ngOnInit(): void {
    this.initAgenciesAndCandidates();
    this.createReorderForm();
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

  private getComments(): void {
    this.commentsService.getComments(this.order.commentContainerId as number, null).subscribe((comments: Comment[]) => {
      this.comments = comments;
    });
  }

  private createReorderForm(): void {
    if (this.isEditMode) {
      this.initForm(this.order);
      this.setInitialDatesValue();
      this.getComments();
    } else {
      this.initForm();
    }
  }

  private initAgenciesAndCandidates(): void {
    const { id, organizationId, reOrderFromId, skillId } = this.order;
    const isReOrder = !isNil(reOrderFromId) && reOrderFromId !== 0;
    const orderId = isReOrder ? reOrderFromId : id;
    this.candidates$ = this.reorderService.getCandidates(orderId, organizationId!).pipe(shareReplay());
    this.billRate$ = this.reorderService.getBillRate(organizationId!, skillId).pipe(filter(() => !this.isEditMode));
    this.agencies$ = this.reorderService.getAgencies(orderId, organizationId!).pipe(
      tap((agencyIds: AgencyModel[]) => (this.numberOfAgencies = agencyIds.length)),
      shareReplay()
    );
  }

  private initForm(reorder?: Order): void {
    const { candidates, jobStartDate, shiftStartTime, shiftEndTime, hourlyRate, openPositions, jobDistributions } =
      reorder || {};
    this.reorderForm = this.formBuilder.group({
      candidates: [this.getCandidateIds(candidates!)],
      agencies: [this.getAgencyIds(jobDistributions!), Validators.required],
      reorderDate: [jobStartDate ? DateTimeHelper.convertDateToUtc(jobStartDate.toString()) : '', Validators.required],
      shiftStartTime: [shiftStartTime ? DateTimeHelper.convertDateToUtc(shiftStartTime.toString()) : '', Validators.required],
      shiftEndTime: [ shiftEndTime ? DateTimeHelper.convertDateToUtc(shiftEndTime.toString()) : '', Validators.required],
      billRate: [hourlyRate ?? '', Validators.required],
      openPosition: [openPositions ?? '', [Validators.required, Validators.min(1)]],
    });
  }

  setInitialDatesValue(): void {
    const { jobStartDate, shiftStartTime, shiftEndTime } = this.order;
    this.initialDates = {
      shiftStartTime,
      shiftEndTime,
      jobStartDate,
    };
  }

  private listenAginciesChanges(): void {
    this.reorderForm.get('agencies')?.valueChanges.pipe(
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
        tap((candidateIds: number[]) => {
          if (!candidateIds.length) {
            this.reorderForm.patchValue({ openPosition: null, agencies: [] });
            this.reorderForm.updateValueAndValidity();
          } else {
            this.reorderForm.patchValue({ openPosition: candidateIds?.length || 1 });
          }
        }),
        filter((candidateIds: number[]) => !!candidateIds?.length),
        switchMap((candidateIds: number[]) => {
          return this.candidates$.pipe(
            map((candidates: CandidateModel[]) => {
              return candidates.filter((candidate: CandidateModel) => candidateIds.includes(candidate.candidateId))
            }),
            map(this.getAgenciesBelongToCandidates))
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

  isDatesChanged(): boolean {
    const { reorderDate, shiftEndTime, shiftStartTime } = this.reorderForm.getRawValue();
    const {
      jobStartDate: reorderDateInitial,
      shiftEndTime: shiftEndTimeInitial,
      shiftStartTime: shiftStartTimeInitial,
    } = this.initialDates;

    return (
      !this.areDatesEquals(reorderDate, reorderDateInitial) ||
      !this.areTimesEquals(shiftEndTime, shiftEndTimeInitial) ||
      !this.areTimesEquals(shiftStartTime, shiftStartTimeInitial)
    );
  }

  private areDatesEquals(date1: Date, date2: Date): boolean {
    return new Date(date1).toLocaleDateString() === new Date(date2).toLocaleDateString();
  }

  private areTimesEquals(time1: Date, time2: Date): boolean {
    return DateTimeHelper.toUtcFormat(time1) === DateTimeHelper.toUtcFormat(time2);
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
      this.selectAllAgencies();
    } else {
      return jobDistributions?.map(({ agencyId }: JobDistributionModel) => agencyId);
    }
  }

  private selectAllAgencies(): void {
    this.agencies$.pipe(first()).subscribe((agencyIds: AgencyModel[]) => {
      this.reorderForm.patchValue({
        agencies: agencyIds?.map(({ agencyId }: AgencyModel) => agencyId),
      });
    });
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
