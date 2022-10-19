import isNil from 'lodash/fp/isNil';
import uniq from 'lodash/fp/uniq';

import { catchError, filter, first, map, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Store } from '@ngxs/store';

import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddEditReorderService } from '@client/order-management/add-edit-reorder/add-edit-reorder.service';
import { AgencyModel, CandidateModel } from '@client/order-management/add-edit-reorder/models/candidate.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Order } from '@shared/models/order-management.model';
import { ReorderModel, ReorderRequestModel } from '@client/order-management/add-edit-reorder/models/reorder.model';
import { JobDistributionModel } from '@shared/models/job-distribution.model';
import { shareReplay } from 'rxjs/operators';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { Comment } from '@shared/models/comment.model';
import { CommentsService } from '@shared/services/comments.service';
import { ONBOARDED_STATUS } from '@shared/components/order-candidate-list/order-candidates-list/onboarded-candidate/onboarded-candidates.constanst';
import { DateTimeHelper } from '@core/helpers';
import { getTimeFromDate } from '@shared/utils/date-time.utils';

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
  public readonly currentDate: Date = new Date();

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

  private numberOfAgencies: number;

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private reorderService: AddEditReorderService,
    private commentsService: CommentsService
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
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public onSave(): void {
    if (this.reorderForm.invalid) {
      this.reorderForm.markAllAsTouched();
    } else {
      this.saveReorder();
    }
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
      shiftStartTime: [shiftStartTime ?? '', Validators.required],
      shiftEndTime: [shiftEndTime ?? '', Validators.required],
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
            map(this.getAgenciesBelongToCandidates)
            )
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
    return getTimeFromDate(time1) === getTimeFromDate(time2);
  }

  private saveReorder(): void {
    const reorder: ReorderModel = this.reorderForm.getRawValue();
    reorder.shiftStartTime = DateTimeHelper.convertDateToUtc(reorder.shiftStartTime.toString());
    reorder.shiftEndTime = DateTimeHelper.convertDateToUtc(reorder.shiftEndTime.toString());
    const agencyIds = this.numberOfAgencies === reorder.agencies.length ? null : reorder.agencies;
    const reOrderId = this.isEditMode ? this.order.id : 0;
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
    this.reorderService
      .saveReorder(<ReorderRequestModel>payload, this.comments)
      .pipe(
        takeUntil(this.destroy$),
        tap(() =>
          this.store.dispatch(new ShowToast(MessageTypes.Success, this.isEditMode ? RECORD_MODIFIED : RECORD_ADDED))
        ),
        catchError((error) =>
          this.store.dispatch(new ShowToast(MessageTypes.Error, error?.error?.errors?.RegularBillRate[0]))
        )
      )
      .subscribe(() => {
        this.saveEmitter.emit();
      });
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
}
