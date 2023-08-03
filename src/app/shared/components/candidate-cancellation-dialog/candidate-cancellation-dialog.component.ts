import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { Subject, takeUntil, tap, switchMap, Observable } from "rxjs";
import { Select, Store } from '@ngxs/store';

import {
  penaltiesDataSource,
} from "@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants";
import { DestroyableDirective } from "@shared/directives/destroyable.directive";
import { JobCancellationReason, PenaltyCriteria } from "@shared/enums/candidate-cancellation";
import { JobCancellation } from "@shared/models/candidate-cancellation.model";
import {
  CandidateCancellationReason,
  OrderCandidateJob,
} from '@shared/models/order-management.model';
import { OrderManagementContentService } from '@shared/services/order-management-content.service';
import { Penalty } from '@shared/models/penalty.model';
import { GetCandidateCancellationReason } from '@client/store/order-managment-content.actions';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';

interface DataSourceObject<T> {
  text: string;
  value: T;
}

@Component({
  selector: 'app-candidate-cancellation-dialog',
  templateUrl: './candidate-cancellation-dialog.component.html',
  styleUrls: ['./candidate-cancellation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateCancellationDialogComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild('candidateCancellationDialog') candidateCancellationDialog: DialogComponent;

  @Input() openEvent: Subject<void>;

  @Input() candidateJob: OrderCandidateJob | null;

  @Output() submitCandidateCancellation = new EventEmitter<JobCancellation>();
  @Output() cancelCandidateCancellation = new EventEmitter<void>();

  @Select(OrderManagementContentState.getCandidateCancellationReasons)
  private candidateCancellationReasons$: Observable<CandidateCancellationReason[] | null>;

  public form: FormGroup;
  public isReasonSelected = false;
  public isPenaltyCriteriaSelected = false;
  public showHoursControl = false;
  public showPercentage = false;
  public optionFields = {
    text: 'text',
    value: 'value',
  };

  public ReasonOptionFields = {
    text: 'name',
    value: 'id',
  };

  public reasons: CandidateCancellationReason[] | null;
  public readonly penalties: DataSourceObject<PenaltyCriteria>[] = penaltiesDataSource;

  private predefinedPenalties: Penalty | null;

  constructor(
    private formBuilder: FormBuilder,
    private cd: ChangeDetectorRef,
    private orderService: OrderManagementContentService,
    private store: Store
  ) {
    super();
  }

  public ngOnInit(): void {
    this.createForm();
    this.onOpenEvent();
    this.onControlChanges();
  }

  public onCancel(): void {
    this.cancelCandidateCancellation.emit();
    this.candidateCancellationDialog.hide();
    this.isReasonSelected = false;
    this.isPenaltyCriteriaSelected = false;
    this.showHoursControl = false;
    this.showPercentage = false;
  }

  public onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid) {
      this.submitCandidateCancellation.emit(this.form.getRawValue());
      this.form.reset();
      this.candidateCancellationDialog.hide();
    }
  }

  private onOpenEvent(): void {
    this.openEvent
      .pipe(
        tap(() => {
          const orderId = this.candidateJob?.order.id as number;
          this.store.dispatch(new GetCandidateCancellationReason(orderId));
          this.candidateCancellationDialog.show();
          this.form.reset();
        }),
        switchMap(() => this.candidateCancellationReasons$),
        takeUntil(this.destroy$)
      ).subscribe((cancellationReasons) => {
        this.reasons = cancellationReasons;
      });
  }

  private createForm(): void {
    this.form = this.formBuilder.group({
      jobCancellationReason: [null, Validators.required],
      penaltyCriteria: [null, Validators.required],
      rate: [null, Validators.required],
      hours: [null, Validators.required],
    });
  }

  private onControlChanges(): void {
    this.form?.get('jobCancellationReason')?.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value: JobCancellationReason) => {
      this.isReasonSelected = !!(value || value === JobCancellationReason.LTACancellationOnBehalfOfOrganization);
      if (this.isReasonSelected && this.candidateJob) {
        this.form?.get('penaltyCriteria')?.setValue(null);
        this.predefinedPenalties = null;
        this.orderService.getPredefinedPenalties(this.candidateJob, value).pipe(
          takeUntil(this.destroy$)
        ).subscribe((data) => {
          this.predefinedPenalties = data;
          this.form?.get('penaltyCriteria')?.setValue(data.penaltyCriteria);
        });
      }
      this.cd.markForCheck();
    });

    this.form?.get('penaltyCriteria')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: PenaltyCriteria) => {
      if (value != PenaltyCriteria.NoPenalty) {
        this.isPenaltyCriteriaSelected = !!(value || value === PenaltyCriteria.FlatRate);
        this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
        this.showPercentage = value === PenaltyCriteria.RateOfHours;
        if (this.isPenaltyCriteriaSelected) {
          setTimeout(() => this.setDefaultValues(value));
        }
      }
      else {
        this.isPenaltyCriteriaSelected = false;
      }
      this.cd.markForCheck();
    });
  }

  private setDefaultValues(value: PenaltyCriteria): void {
    switch (value) {
      case PenaltyCriteria.FlatRate:
        this.form?.get('rate')?.setValue(this.predefinedPenalties?.flatRate || 0);
        this.form?.get('hours')?.setValue(0);
        break;
      case PenaltyCriteria.RateOfHours:
        this.form?.get('rate')?.setValue(this.predefinedPenalties?.flatRateOfHoursPercentage || 0);
        this.form?.get('hours')?.setValue(this.predefinedPenalties?.flatRateOfHours || 0);
        break;
      case PenaltyCriteria.FlatRateOfHours:
        this.form?.get('rate')?.setValue(this.predefinedPenalties?.billRate || 0);
        this.form?.get('hours')?.setValue(this.predefinedPenalties?.rateOfHours || 0);
        break;
    }
  }
}
