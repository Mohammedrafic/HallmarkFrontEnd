import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { Subject, takeUntil } from "rxjs";

import {
  penaltiesDataSource,
  reOrderReasonsDataSource,
  travelReasonsDataSource
} from "@shared/components/candidate-cancellation-dialog/candidate-cancellation-dialog.constants";
import { DestroyableDirective } from "@shared/directives/destroyable.directive";
import { JobCancellationReason, PenaltyCriteria } from "@shared/enums/candidate-cancellation";
import { OrderType } from "@shared/enums/order-type";
import { JobCancellation } from "@shared/models/candidate-cancellation.model";

interface DataSourceObject<T> {
  text: string;
  value: T;
}

@Component({
  selector: 'app-candidate-cancellation-dialog',
  templateUrl: './candidate-cancellation-dialog.component.html',
  styleUrls: ['./candidate-cancellation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CandidateCancellationDialogComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild('candidateCancellationDialog') candidateCancellationDialog: DialogComponent;

  @Input() openEvent: Subject<void>;

  @Input() set orderType(value: OrderType | undefined) {
    this.reasons = value === OrderType.ReOrder ? reOrderReasonsDataSource : travelReasonsDataSource;
  };

  @Output() submitCandidateCancellation = new EventEmitter<JobCancellation>();
  @Output() cancelCandidateCancellation = new EventEmitter<void>();

  public form: FormGroup;
  public isReasonSelected: boolean = false;
  public isPenaltyCriteriaSelected: boolean = false;
  public showHoursControl: boolean = false;
  public showPercentage: boolean = false;
  public optionFields = {
    text: 'text',
    value: 'value',
  };
  public reasons: DataSourceObject<JobCancellationReason>[];
  public readonly penalties: DataSourceObject<PenaltyCriteria>[] = penaltiesDataSource;

  constructor(private formBuilder: FormBuilder,
              private cd: ChangeDetectorRef) {
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
    this.openEvent.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.candidateCancellationDialog.show();
      this.form.reset();
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
    this.form?.get('jobCancellationReason')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: JobCancellationReason) =>  {
      this.isReasonSelected = !!(value || value === JobCancellationReason.TravelCancellationOnBehalfOfOrganization);
      this.cd.markForCheck();
    });

    this.form?.get('penaltyCriteria')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value: PenaltyCriteria) => {
      this.isPenaltyCriteriaSelected = !!(value || value === PenaltyCriteria.FlatRate);
      this.showHoursControl = value === PenaltyCriteria.RateOfHours || value === PenaltyCriteria.FlatRateOfHours;
      this.showPercentage = value === PenaltyCriteria.RateOfHours;
      if (this.isPenaltyCriteriaSelected) {
        this.setDefaultValues();
      }
      this.cd.markForCheck();
    });
  }

  private setDefaultValues(): void {
    this.form?.get('rate')?.setValue(0);
    this.form?.get('hours')?.setValue(0);
  }
}
