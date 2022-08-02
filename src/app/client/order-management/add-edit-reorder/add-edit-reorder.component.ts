import isNil from 'lodash/fp/isNil';
import uniq from 'lodash/fp/uniq';

import { filter, first, map, Observable, switchMap, takeUntil, tap } from 'rxjs';
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
import { startEndTimeValidator } from '@shared/validators/time.validator';
import { shareReplay } from 'rxjs/operators';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';

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

  private numberOfAgencies: number;

  public constructor(
    private formBuilder: FormBuilder,
    private store: Store,
    private reorderService: AddEditReorderService
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

  private createReorderForm(): void {
    if (this.isEditMode) {
      this.initForm(this.order);
    } else {
      this.initForm();
    }
  }

  private initAgenciesAndCandidates(): void {
    const { id, organizationId, reOrderFromId } = this.order;
    const isReOrder = !isNil(reOrderFromId) && reOrderFromId !== 0;
    const orderId = isReOrder ? reOrderFromId : id;
    this.candidates$ = this.reorderService.getCandidates(orderId, organizationId!).pipe(shareReplay());
    this.agencies$ = this.reorderService.getAgencies(orderId, organizationId!).pipe(
      tap((agencyIds: AgencyModel[]) => (this.numberOfAgencies = agencyIds.length)),
      shareReplay()
    );
  }

  private initForm(reorder?: Order): void {
    const { candidates, jobStartDate, shiftStartTime, shiftEndTime, hourlyRate, openPositions, jobDistributions } =
      reorder || {};
    this.reorderForm = this.formBuilder.group(
      {
        candidates: [this.getCandidateIds(candidates!)],
        agencies: [this.getAgencyIds(jobDistributions!), Validators.required],
        reorderDate: [jobStartDate ?? '', Validators.required],
        shiftStartTime: [shiftStartTime ?? '', Validators.required],
        shiftEndTime: [shiftEndTime ?? '', Validators.required],
        billRate: [hourlyRate ?? '', Validators.required],
        openPosition: [openPositions ?? '', [Validators.required, Validators.min(1)]],
      },
      { validators: startEndTimeValidator('shiftStartTime', 'shiftEndTime') }
    );
  }

  private listenCandidateChanges(): void {
    this.reorderForm
      .get('candidates')
      ?.valueChanges.pipe(
        tap((candidateIds: number[]) => this.reorderForm.patchValue({ openPosition: candidateIds?.length || 1 })),
        filter((candidateIds: number[]) => !isNil(candidateIds)),
        switchMap(() => this.candidates$.pipe(map(this.getAgenciesBelongToCandidates)))
      )
      .subscribe((agencies: number[]) => {
        const selectedAgencies = this.reorderForm.get('agencies')?.value ?? [];
        const uniqueAgencies = uniq([...selectedAgencies, ...agencies]);
        this.reorderForm?.patchValue({ agencies: uniqueAgencies });
      });
  }

  private getAgenciesBelongToCandidates(candidates: CandidateModel[]): number[] {
    const agencyIds = candidates.map(({ agencyId }: CandidateModel) => agencyId);
    return uniq(agencyIds);
  }

  private saveReorder(): void {
    const reorder: ReorderModel = this.reorderForm.getRawValue();
    const agencyIds = this.numberOfAgencies === reorder.agencies.length ? null : reorder.agencies;
    const reOrderId = this.isEditMode ? this.order.id : 0;
    const reOrderFromId = this.isEditMode ? this.order.reOrderFromId! : this.order.id;
    const payload = { reorder, agencyIds, reOrderId, reOrderFromId };

    this.reorderService
      .saveReorder(<ReorderRequestModel>payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(new ShowToast(MessageTypes.Success, this.isEditMode ? RECORD_MODIFIED : RECORD_ADDED));
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
