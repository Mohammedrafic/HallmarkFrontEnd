import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  extensionDurationPrimary,
  extensionDurationSecondary,
} from '@shared/components/extension/extension-sidebar/config';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Duration } from '@shared/enums/durations';
import { combineLatest, distinctUntilChanged, filter } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';
import { ExtensionSidebarService } from '@shared/components/extension/extension-sidebar/extension-sidebar.service';
import isNil from 'lodash/fp/isNil';
import { addDays } from '@shared/utils/date-time.utils';
import { OrderCandidateJob, OrderManagementChild } from '@shared/models/order-management.model';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';

@Component({
  selector: 'app-extension-sidebar',
  templateUrl: './extension-sidebar.component.html',
  styleUrls: ['./extension-sidebar.component.scss'],
})
export class ExtensionSidebarComponent implements OnInit {
  @Input() public candidateJob: OrderCandidateJob;
  @Input() public orderPosition: OrderManagementChild;
  @Output() public saveEmitter: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('billRates') billRatesComponent: BillRatesComponent;

  public readonly extensionDurationPrimary = extensionDurationPrimary;
  public readonly extensionDurationSecondary = extensionDurationSecondary;
  public readonly durationFieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public readonly numericInputAttributes = { maxLength: '2' };
  public readonly billRateAttributes = { maxLength: '10' };

  public minDate: Date;
  public extensionForm: FormGroup;

  public constructor(
    public formBuilder: FormBuilder,
    private extensionSidebarService: ExtensionSidebarService,
  ) {}

  public ngOnInit(): void {
    this.minDate = new Date(this.candidateJob?.actualEndDate);
    this.initExtensionForm();
    this.listenPrimaryDuration();
    this.listenDurationChanges();
  }

  public saveExtension(): void {
    if (this.extensionForm.invalid) {
      this.extensionForm.markAllAsTouched();
      return;
    }
    const { value: billRate } = this.billRatesComponent.billRatesControl;
    const extension = this.extensionForm.getRawValue();
    this.extensionSidebarService
      .saveExtension({
        billRates: billRate,
        ...extension,
        jobId: this.orderPosition.jobId,
        orderId: this.candidateJob.orderId,
      })
      .subscribe({
        next: () => this.saveEmitter.emit(),
      });
  }

  private initExtensionForm(): void {
    const { actualEndDate, candidateBillRate } = this.candidateJob || {};
    this.extensionForm = this.formBuilder.group({
      durationPrimary: [Duration.Other],
      durationSecondary: [],
      durationTertiary: [],
      startDate: [addDays(actualEndDate, 1)],
      endDate: ['', [Validators.required]],
      billRate: [candidateBillRate, [Validators.required]],
      comments: [null],
    });
  }

  private listenPrimaryDuration(): void {
    this.extensionForm.get('durationPrimary')?.valueChanges.subscribe((duration: Duration) => {
      const durationSecondary = this.extensionForm.get('durationSecondary');
      const durationTertiary = this.extensionForm.get('durationTertiary');

      if (duration === Duration.Other) {
        durationSecondary?.enable();
        durationTertiary?.enable();
        durationSecondary?.reset();
        durationTertiary?.reset();
      } else {
        durationSecondary?.disable();
        durationTertiary?.disable();
        durationSecondary?.setValue(this.extensionSidebarService.getSecondaryDuration(duration));
        durationTertiary?.setValue(this.extensionSidebarService.getTertiaryDuration(duration));
      }
    });
  }

  private listenDurationChanges(): void {
    const durationSecondary$ = this.extensionForm.get('durationSecondary')?.valueChanges!;
    const durationTertiary$ = this.extensionForm.get('durationTertiary')?.valueChanges!;

    combineLatest([durationSecondary$, durationTertiary$])
      .pipe(
        filter(([durationSecondary$, durationTertiary$]) => !isNil(durationSecondary$) && !isNil(durationTertiary$)),
        distinctUntilChanged((previous: number[], current: number[]) => isEqual(previous, current))
      )
      .subscribe(([durationSecondary, durationTertiary]: number[]) => {
        const { value: startDate } = this.extensionForm.get('startDate')!;
        const endDate = this.extensionSidebarService.getEndDate(startDate, durationSecondary, durationTertiary);
        this.extensionForm.patchValue({ endDate });
      });
  }
}
