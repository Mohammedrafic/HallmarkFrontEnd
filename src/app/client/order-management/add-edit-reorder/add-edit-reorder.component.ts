import isNil from 'lodash/fp/isNil';
import uniq from 'lodash/fp/uniq';

import { filter, first, map, Observable, switchMap, takeUntil, tap } from 'rxjs';
import { FieldSettingsModel, ISelectAllEventArgs } from '@syncfusion/ej2-angular-dropdowns';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddEditReorderService } from '@client/order-management/add-edit-reorder/add-edit-reorder.service';
import { CandidateModel } from '@client/order-management/add-edit-reorder/models/candidate.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { endTimeValidator, startTimeValidator } from '@shared/validators/date.validator';
import { Order } from '@shared/models/order-management.model';
import { ReorderModel, ReorderRequestModel } from '@client/order-management/add-edit-reorder/models/reorder.model';
import { ShowSideDialog } from '../../../store/app.actions';
import { JobDistributionModel } from '@shared/models/job-distribution.model';

@Component({
  selector: 'app-add-edit-reorder',
  templateUrl: './add-edit-reorder.component.html',
  styleUrls: ['./add-edit-reorder.component.scss'],
})
export class AddEditReorderComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public order: Order;
  @Output() saveEmitter: EventEmitter<void> = new EventEmitter<void>();

  public readonly agenciesOptionFields: FieldSettingsModel = { text: 'agencyName', value: 'agencyId' };
  public readonly candidatesOptionFields: FieldSettingsModel = { text: 'candidateName', value: 'candidateId' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public readonly timepickerMask = { hour: 'HH', minute: 'MM' };
  public readonly numericInputAttributes = { maxLength: '10' };
  public readonly currentDate: Date = new Date();

  public reorderForm: FormGroup;
  public dialogTitle: string = 'Add Re-Order';
  public candidates$: Observable<CandidateModel[]>;
  public agencies$: Observable<any[]>;

  private isSelectedAllAgencies: boolean;
  private numberOfAgencies: number;

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private actions: Actions,
    private reorderService: AddEditReorderService
  ) {
    super();
  }

  public get isEditMode(): boolean {
    return this.order?.reOrderFromId !== 0;
  }

  public ngOnChanges(changes: SimpleChanges): void {
    const { order } = changes;

    if (order && !order?.isFirstChange()) {
      const { id, organizationId, reOrderFromId } = order.currentValue;
      const isReOrder = !isNil(reOrderFromId) && reOrderFromId !== 0;
      this.candidates$ = this.reorderService.getCandidates(isReOrder ? reOrderFromId : id, organizationId);
      this.agencies$ = this.reorderService.getAgencies(isReOrder ? reOrderFromId : id, organizationId);
      this.handleEditMode(order.currentValue);
    }
  }

  public ngOnInit(): void {
    this.initForm();
  }

  public onCancel(): void {
    this.closeDialog();
  }

  public onSave(): void {
    if (this.reorderForm.invalid) {
      this.reorderForm.markAllAsTouched();
    } else {
      this.saveReorder();
    }
  }

  public onSelectAllAgencies(event: ISelectAllEventArgs): void {
    this.isSelectedAllAgencies = event.isChecked!;
  }

  private initForm(reorder?: Order): void {
    const { candidates, jobStartDate, shiftStartTime, shiftEndTime, hourlyRate, openPositions, jobDistributions } =
      reorder || {};
    this.reorderForm = this.formBuilder.group({
      candidates: [this.getCandidateIds(candidates!) ?? []],
      agencies: [this.getAgencyIds(jobDistributions!), Validators.required],
      reorderDate: [jobStartDate ?? '', Validators.required],
      shiftStartTime: [shiftStartTime ?? '', Validators.required],
      shiftEndTime: [shiftEndTime ?? '', Validators.required],
      billRate: [hourlyRate ?? '', Validators.required],
      openPosition: [openPositions ?? '', [Validators.required, Validators.min(1)]],
    });
    this.reorderForm.get('shiftStartTime')?.addValidators(startTimeValidator(this.reorderForm, 'shiftEndTime'));
    this.reorderForm.get('shiftEndTime')?.addValidators(endTimeValidator(this.reorderForm, 'shiftStartTime'));
    this.subscribeOnChangesCandidateName();
    this.subscribeOnCloseSideBar();
  }

  private closeDialog(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  private subscribeOnChangesCandidateName(): void {
    this.reorderForm
      .get('candidates')
      ?.valueChanges.pipe(
        tap((candidateIds: number[]) => this.reorderForm.patchValue({ openPosition: candidateIds?.length || 1 })),
        filter((candidateIds: number[]) => !isNil(candidateIds)),
        switchMap(() => this.candidates$.pipe(map(this.getUniqueAgencies)))
      )
      .subscribe((agencies: number[]) => {
        const selectedAgencies = this.reorderForm.get('agencies')?.value ?? [];
        const uniqueAgencies = uniq([...selectedAgencies, ...agencies]);
        this.reorderForm?.patchValue({ agencies: uniqueAgencies });
      });
  }

  private getUniqueAgencies(candidates: CandidateModel[]): number[] {
    const agencyIds = candidates.map(({ agencyId }: CandidateModel) => agencyId);
    return uniq(agencyIds);
  }

  private saveReorder(): void {
    const reorder: ReorderModel = this.reorderForm.getRawValue();
    const agencyIds =
      this.isSelectedAllAgencies || this.numberOfAgencies === reorder.agencies.length ? null : reorder.agencies;
    const orderForRequest: ReorderRequestModel = {
      reOrderId: this.isEditMode ? this.order.id : 0,
      reOrderFromId: this.isEditMode ? this.order.reOrderFromId! : this.order.id,
      candidateProfileIds: reorder.candidates,
      agencyIds: agencyIds,
      reorderDate: reorder.reorderDate,
      shiftEndTime: reorder.shiftEndTime,
      shiftStartTime: reorder.shiftStartTime,
      billRate: reorder.billRate,
      openPositions: reorder.openPosition,
    };
    this.reorderService
      .addReorder(orderForRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.onCancel();
        this.saveEmitter.emit();
      });
  }

  private handleEditMode(order: Order): void {
    if (this.isEditMode) {
      this.initForm(order);
      this.dialogTitle = 'Edit Re-Order';
      this.agencies$.pipe(first()).subscribe((agencyIds: JobDistributionModel[]) => {
        this.numberOfAgencies = agencyIds.length;
      });
    } else {
      this.dialogTitle = 'Add Re-Order';
    }
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
    this.agencies$.pipe(first()).subscribe((agencyIds: JobDistributionModel[]) => {
      this.numberOfAgencies = agencyIds.length;
      this.reorderForm.patchValue({
        agencies: agencyIds?.map(({ agencyId }: JobDistributionModel) => agencyId),
      });
    });
  }

  private subscribeOnCloseSideBar(): void {
    this.actions.pipe(ofActionSuccessful(ShowSideDialog), takeUntil(this.destroy$)).subscribe(() => {
      this.reorderForm.reset();
    });
  }

  private getCandidateIds(candidate: CandidateModel[]): number[] {
    return candidate?.map(({ id }: CandidateModel) => id);
  }
}
