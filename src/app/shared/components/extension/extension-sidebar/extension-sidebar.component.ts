import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  extensionDurationPrimary,
  extensionDurationSecondary,
} from '@shared/components/extension/extension-sidebar/config';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { Duration } from '@shared/enums/durations';
import { combineLatest, distinctUntilChanged, filter } from 'rxjs';
import isEqual from 'lodash/fp/isEqual';
import { ExtensionSidebarService } from '@shared/components/extension/extension-sidebar/extension-sidebar.service';
import isNil from 'lodash/fp/isNil';
import { addDays } from '@shared/utils/date-time.utils';
import { OrderCandidateJob, OrderManagementChild } from '@shared/models/order-management.model';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { Comment } from '@shared/models/comment.model';
import { Store } from '@ngxs/store';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED } from '@shared/constants';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { BillRate } from '@shared/models';
import { BillRatesSyncService } from '@shared/services/bill-rates-sync.service';

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
  public comments: Comment[] = [];

  get billRateControl(): FormControl {
    return this.extensionForm?.get('billRate') as FormControl;
  }

  public constructor(
    public formBuilder: FormBuilder,
    private extensionSidebarService: ExtensionSidebarService,
    private store: Store,
    private billRatesSyncService: BillRatesSyncService
  ) {}

  public ngOnInit(): void {
    this.minDate = addDays(this.candidateJob?.actualEndDate, 1)!;
    this.initExtensionForm();
    this.listenPrimaryDuration();
    this.listenDurationChanges();
    this.subsToBillRateControlChange();
  }

  subsToBillRateControlChange(): void {
    this.billRateControl.valueChanges.subscribe((value) => {
      if (!this.billRatesComponent?.billRatesControl.value) {
        return;
      }

      const billRates = this.billRatesComponent?.billRatesControl.value;
      let billRateToUpdate: BillRate | null = this.billRatesSyncService.getBillRateForSync(billRates);

      if (!billRateToUpdate) {
        return;
      }

      const restBillRates = this.billRatesComponent?.billRatesControl.value.filter(
        (billRate: BillRate) => billRate.id !== billRateToUpdate?.id
      );

      billRateToUpdate.rateHour = value || '0.00';

      this.billRatesComponent.billRatesControl.patchValue([billRateToUpdate, ...restBillRates]);
    });
  }

  hourlyRateToOrderSync(event: { value: string; billRate?: BillRate }): void {
    const { value, billRate } = event;
    if (!value) {
      return;
    }
    const billRates = this.billRatesComponent?.billRatesControl.value;
    let billRateToUpdate: BillRate | null = this.billRatesSyncService.getBillRateForSync(billRates);
    if (billRateToUpdate?.id !== billRate?.id && billRate?.id !== 0) {
      return;
    }

    this.billRateControl.patchValue(value, { emitEvent: false, onlySelf: true });
  }

  public saveExtension(positionDialog: DialogComponent): void {
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
        comments: this.comments,
      })
      .subscribe({
        next: () => {
          this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_ADDED));
          positionDialog.hide();
          return this.saveEmitter.emit();
        },
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
