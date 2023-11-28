import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input,
  OnInit, Output, ViewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Select, Store } from '@ngxs/store';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import isNil from 'lodash/fp/isNil';
import {
  Observable, catchError, combineLatest, distinctUntilChanged, filter, startWith, switchMap,
  takeUntil, tap,
} from 'rxjs';

import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { DateTimeHelper, Destroyable } from '@core/helpers';
import { BillRatesComponent } from '@shared/components/bill-rates/bill-rates.component';
import { extensionDurationPrimary, extensionDurationSecondary } from '@shared/components/extension/extension-sidebar/config';
import { ExtensionSidebarService } from '@shared/components/extension/extension-sidebar/extension-sidebar.service';
import { ExtensionStartDateValidation } from '@shared/constants';
import { Duration } from '@shared/enums/durations';
import { MessageTypes } from '@shared/enums/message-types';
import { BillRate } from '@shared/models';
import { Comment } from '@shared/models/comment.model';
import { MergedOrder, OrderCandidateJob, OrderManagementChild } from '@shared/models/order-management.model';
import { BillRatesSyncService } from '@shared/services/bill-rates-sync.service';
import { BillRatesService } from '@shared/services/bill-rates.service';
import { addDays } from '@shared/utils/date-time.utils';
import { getAllErrors } from '@shared/utils/error.utils';
import { PermissionService } from 'src/app/security/services/permission.service';
import { ShowToast } from 'src/app/store/app.actions';
import { ExtenstionResponseModel } from './models/extension.model';
import { OrderManagementService } from '@client/order-management/components/order-management-content/order-management.service';
import { OrderManagementIRPSystemId } from '@shared/enums/order-management-tabs.enum';

@Component({
  selector: 'app-extension-sidebar',
  templateUrl: './extension-sidebar.component.html',
  styleUrls: ['./extension-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExtensionSidebarComponent extends Destroyable implements OnInit {
  @Input() public orderPosition: OrderManagementChild;
  @Input() public order: MergedOrder;
  
  @Output() public saveEmitter: EventEmitter<void> = new EventEmitter<void>();
  @ViewChild('billRates') billRatesComponent: BillRatesComponent;

  @Select(OrderManagementContentState.candidatesJob)
  candidateJobState$: Observable<OrderCandidateJob>;

  public readonly extensionDurationPrimary = extensionDurationPrimary;
  public readonly extensionDurationSecondary = extensionDurationSecondary;
  public readonly durationFieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
  public readonly datepickerMask = { month: 'MM', day: 'DD', year: 'YYYY' };
  public readonly numericInputAttributes = { maxLength: '2' };
  public readonly billRateAttributes = { maxLength: '10' };
  public canCreateOrder: boolean;
  public minDate: Date;
  public extensionForm: FormGroup;
  public comments: Comment[] = [];
  public startDate: Date;
  public maxEndDate: Date;
  public extensionStartDateValidation = false;
  public candidateJob: OrderCandidateJob;
  public candidateRates: BillRate[];
  @Input() public system: string;
  public extensionFormIRP: FormGroup;
  public CanOrganizationEditOrdersIRP: boolean;
  public CanOrganizationViewOrdersIRP: boolean;
  public commentContainerId: number;
  public activeSystems: OrderManagementIRPSystemId | null;
  public OrderManagementIRPSystemId = OrderManagementIRPSystemId;

  private get billRateControl(): FormControl {
    return this.extensionForm?.get('billRate') as FormControl;
  }

  public constructor(
    private formBuilder: FormBuilder,
    private extensionSidebarService: ExtensionSidebarService,
    private store: Store,
    private billRatesSyncService: BillRatesSyncService,
    private permissionService: PermissionService,
    private billRatesApiService: BillRatesService,
    private cd: ChangeDetectorRef,
    private orderManagementService : OrderManagementService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getJobData();
    this.activeSystems = this.orderManagementService.getOrderManagementSystem();
    this.subscribeOnPermissions();
    const minDate = addDays(this.candidateJob?.actualEndDate, 1)!;
    this.minDate = DateTimeHelper.setCurrentTimeZone(minDate.toString());
    this.initExtensionForm();
    this.listenPrimaryDuration();
    this.listenPrimaryDurationIRP();
    this.listenDurationChanges();
    this.listenDurationChangesIRP();
    this.listenStartEndDatesChanges();
    this.listenStartEndDatesChangesIRP();
    if(this.activeSystems !== OrderManagementIRPSystemId.IRP){
      this.subsToBillRateControlChange();
    }
  }

  public hourlyRateToOrderSync(event: { value: string; billRate?: BillRate }): void {
    const { value, billRate } = event;
    if (!value) {
      return;
    }
    const billRates = this.billRatesComponent?.billRatesControl.value;
    const billRateToUpdate: BillRate | null = this.getBillRate(billRates, this.extensionForm.get('startDate')?.value);
    if (billRateToUpdate?.id !== billRate?.id && billRate?.id !== 0) {
      return;
    }

    this.billRateControl.patchValue(value, { emitEvent: false, onlySelf: true });
    this.cd.markForCheck();
  }

  public saveExtension(positionDialog: DialogComponent, ignoreMissingCredentials: boolean): void  {
    if(this.system === "IRP"){
      if (this.extensionFormIRP.invalid) {
        this.extensionFormIRP.markAllAsTouched();
        return;
      }
      if (this.extensionStartDateValidation) {
        this.store.dispatch(new ShowToast(MessageTypes.Error, ExtensionStartDateValidation));
        return;
      }
      const extension = this.extensionFormIRP.getRawValue();
      this.extensionSidebarService
        .saveExtension({
          ...extension,
          jobId: this.orderPosition.jobId,
          orderId: this.candidateJob.orderId,
          comments: this.comments,
          ignoreMissingCredentials,
        })
        .pipe(
          tap((data : ExtenstionResponseModel) => {
            this.store.dispatch(
              new ShowToast(
                MessageTypes.Success,
                'Extension Order ' + data.organizationPrefix + '-' + data.publicId + ' has been added'
              )
            );
            positionDialog.hide();
            this.saveEmitter.emit();
          }),
          catchError((error) =>
            this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error)))
          ),
          takeUntil(this.componentDestroy())
        ).subscribe();
    } else {

    if (this.extensionForm.invalid) {
      this.extensionForm.markAllAsTouched();
      return;
    }
    if (this.extensionStartDateValidation) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, ExtensionStartDateValidation));
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
        ignoreMissingCredentials,
      })
      .pipe(
        tap((data : ExtenstionResponseModel) => {
          this.store.dispatch(
            new ShowToast(
              MessageTypes.Success,
              'Extension Order ' + data.organizationPrefix + '-' + data.publicId + ' has been added'
            )
          );
          positionDialog.hide();
          this.saveEmitter.emit();
        }),
        catchError((error) =>
          this.store.dispatch(new ShowToast(MessageTypes.Error, getAllErrors(error?.error)))
        ),
        takeUntil(this.componentDestroy())
      ).subscribe();
    }
  }

  private getBillRate(billRates: BillRate[], startDate?: Date): BillRate | null {
    const regularRate: BillRate | null = this.billRatesSyncService.getBillRateForSync(
      billRates, startDate, false
    );
    const regularLocalRate = this.billRatesSyncService.getBillRateForSync(
      billRates, startDate, true
    );
    return regularRate ?? regularLocalRate;
  }

  private subsToBillRateControlChange(): void {
    this.billRateControl.valueChanges
      .pipe(
        distinctUntilChanged(),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((value) => {
        if (!this.billRatesComponent?.billRatesControl.value) {
          return;
        }

        const billRates = this.billRatesComponent?.billRatesControl.value;
        const billRateToUpdate: BillRate | null = this.getBillRate(billRates, this.extensionForm.get('startDate')?.value);

        if (!billRateToUpdate) {
          return;
        }

        const restBillRates = this.billRatesComponent?.billRatesControl.value.filter(
          (billRate: BillRate) => billRate.id !== billRateToUpdate?.id
        );

        billRateToUpdate.rateHour = value || '0.00';
        this.billRatesComponent.billRatesControl.patchValue([billRateToUpdate, ...restBillRates]);
        this.cd.markForCheck();
      });
  }

  private initExtensionForm(): void {
    const { actualEndDate } = this.candidateJob || {};
    const startDate = addDays(actualEndDate, 1);
    const startDateValue = startDate ? DateTimeHelper.setCurrentTimeZone(startDate.toString()) : undefined;

    this.extensionFormIRP = this.formBuilder.group({
      durationPrimary: [Duration.Other],
      durationSecondary: [],
      durationTertiary: [],
      startDate: [startDateValue, [Validators.required]],
      endDate: ['', [Validators.required]],
      comments: [null],
      linkedId: [this.order.linkedId, Validators.maxLength(20)],

    })
    if(this.activeSystems !== OrderManagementIRPSystemId.IRP){
      this.extensionForm = this.formBuilder.group({
        durationPrimary: [Duration.Other],
        durationSecondary: [],
        durationTertiary: [],
        startDate: [startDateValue, [Validators.required]],
        endDate: ['', [Validators.required]],
        billRate: [null, [Validators.required]],
        comments: [null],
        linkedId: [this.order.linkedId, Validators.maxLength(20)],
      });  
    } else {
      this.extensionForm = this.formBuilder.group({
        durationPrimary: [Duration.Other],
        durationSecondary: [],
        durationTertiary: [],
        startDate: [startDateValue, [Validators.required]],
        endDate: ['', [Validators.required]],
        comments: [null],
        linkedId: [this.order.linkedId, Validators.maxLength(20)],
      });  

    }
    this.maxEndDate = addDays(startDate as Date, 14) as Date;

  }

  private listenPrimaryDuration(): void {
    this.extensionForm.get('durationPrimary')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((duration: Duration) => {
      const durationSecondary = this.extensionForm.get('durationSecondary');
      const durationTertiary = this.extensionForm.get('durationTertiary');

      if (duration === Duration.Other) {
        durationSecondary?.enable({emitEvent: false});
        durationTertiary?.enable({emitEvent: false});
        durationSecondary?.reset();
        durationTertiary?.reset();
        this.extensionForm.get('startDate')?.markAsPristine();
        this.extensionForm.get('endDate')?.markAsPristine();
      } else {
        durationSecondary?.disable();
        durationTertiary?.disable();
        durationSecondary?.setValue(this.extensionSidebarService.getSecondaryDuration(duration));
        durationTertiary?.setValue(this.extensionSidebarService.getTertiaryDuration(duration));
      }
      this.cd.markForCheck();
    });
  }

  private listenDurationChanges(): void {
    const durationSecondary$ = this.extensionForm.get('durationSecondary')?.valueChanges!;
    const durationTertiary$ = this.extensionForm.get('durationTertiary')?.valueChanges!;

    combineLatest([durationSecondary$, durationTertiary$])
      .pipe(
        filter(([durationSecondary$, durationTertiary$]) => !isNil(durationSecondary$) && !isNil(durationTertiary$)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(([durationSecondary, durationTertiary]: number[]) => {
        const { value: startDate } = this.extensionForm.get('startDate')!;
        const endDate = this.extensionSidebarService.getEndDate(startDate, durationSecondary, durationTertiary);
        this.extensionForm.patchValue({ endDate });
        this.cd.markForCheck();
      });
  }

  private listenPrimaryDurationIRP(): void {
    this.extensionFormIRP.get('durationPrimary')?.valueChanges.pipe(
      takeUntil(this.componentDestroy())
    ).subscribe((duration: Duration) => {
      const durationSecondary = this.extensionFormIRP.get('durationSecondary');
      const durationTertiary = this.extensionFormIRP.get('durationTertiary');

      if (duration === Duration.Other) {
        durationSecondary?.enable({emitEvent: false});
        durationTertiary?.enable({emitEvent: false});
        durationSecondary?.reset();
        durationTertiary?.reset();
        this.extensionFormIRP.get('startDate')?.markAsPristine();
        this.extensionFormIRP.get('endDate')?.setValue('');
      } else {
        durationSecondary?.disable();
        durationTertiary?.disable();
        durationSecondary?.setValue(this.extensionSidebarService.getSecondaryDuration(duration));
        durationTertiary?.setValue(this.extensionSidebarService.getTertiaryDuration(duration));
      }
      this.cd.markForCheck();
    });
  }

  private listenDurationChangesIRP(): void {
    const durationSecondary$ = this.extensionFormIRP.get('durationSecondary')?.valueChanges!;
    const durationTertiary$ = this.extensionFormIRP.get('durationTertiary')?.valueChanges!;

    combineLatest([durationSecondary$, durationTertiary$])
      .pipe(
        filter(([durationSecondary$, durationTertiary$]) => !isNil(durationSecondary$) && !isNil(durationTertiary$)),
        takeUntil(this.componentDestroy())
      )
      .subscribe(([durationSecondary, durationTertiary]: number[]) => {
        const { value: startDate } = this.extensionFormIRP.get('startDate')!;
        const endDate = this.extensionSidebarService.getEndDate(startDate, durationSecondary, durationTertiary);
        this.extensionFormIRP.patchValue({ endDate });
        this.cd.markForCheck();
      });
  }

  private listenStartEndDatesChangesIRP(): void {
    const startDateControl = this.extensionFormIRP.get('startDate') as AbstractControl;
    const endDateControl = this.extensionFormIRP.get('endDate') as AbstractControl;

    combineLatest([
      startDateControl.valueChanges.pipe(startWith(null)),
      endDateControl.valueChanges.pipe(startWith(null)),
    ])
      .pipe(
        filter(() => startDateControl.dirty || endDateControl.dirty),
        takeUntil(this.componentDestroy())
      )
      .subscribe(([startDate, endDate]) => {
        this.startDate = startDate;
        this.extensionStartDateValidation = false;
        let actualEndDate = new Date(this.candidateJob?.actualEndDate); 
        let twoWeekDate = new Date(actualEndDate.setDate(actualEndDate.getDate() + 14));
        if(startDate && startDate > twoWeekDate){
           this.extensionStartDateValidation = true;
        }
        if (startDate > endDate) {
          this.extensionFormIRP.get('endDate')?.setErrors({incorrect: true});
        }
        this.extensionFormIRP.get('durationPrimary')?.setValue(Duration.Other);
        this.cd.markForCheck();
      });
  }

  private listenStartEndDatesChanges(): void {
    const startDateControl = this.extensionForm.get('startDate') as AbstractControl;
    const endDateControl = this.extensionForm.get('endDate') as AbstractControl;

    combineLatest([
      startDateControl.valueChanges.pipe(startWith(null)),
      endDateControl.valueChanges.pipe(startWith(null)),
    ])
      .pipe(
        filter(() => startDateControl.dirty || endDateControl.dirty),
        takeUntil(this.componentDestroy())
      )
      .subscribe(([startDate, endDate]) => {
        this.startDate = startDate;
        this.extensionStartDateValidation = false;
        let actualEndDate = new Date(this.candidateJob?.actualEndDate);
        let twoWeekDate = new Date(actualEndDate.setDate(actualEndDate.getDate() + 14));
        if(startDate && startDate > twoWeekDate){
           this.extensionStartDateValidation = true;
        }
        if (startDate > endDate) {
          this.extensionForm.get('endDate')?.setErrors({incorrect: true});
        }
        this.extensionForm.get('durationPrimary')?.setValue(Duration.Other);
        this.cd.markForCheck();
      });
  }

  private subscribeOnPermissions(): void {
    this.permissionService.getPermissions()
    .pipe(
      takeUntil(this.componentDestroy()),
    )
    .subscribe(({ canCreateOrder, CanOrganizationEditOrdersIRP, CanOrganizationViewOrdersIRP}) => {
      this.canCreateOrder = canCreateOrder;
      this.CanOrganizationEditOrdersIRP = CanOrganizationEditOrdersIRP;
      this.CanOrganizationViewOrdersIRP = CanOrganizationViewOrdersIRP;
      this.cd.markForCheck();
    });
  }

  private getJobData(): void {
    this.candidateJobState$
    .pipe(
      tap((job) => {
        this.candidateJob = job;
        if(this.candidateJob?.commentContainerId && this.candidateJob.commentContainerId != null){
          this.commentContainerId = this.candidateJob.commentContainerId;
        }
      }),
      switchMap((job) => this.billRatesApiService.getCalculatedRates(job.jobId)),
      takeUntil(this.componentDestroy()),
    )
    .subscribe((rates) => {
      const { actualEndDate } = this.candidateJob || {};
      const startDate = addDays(actualEndDate, 1);
      const startDateValue = startDate ? DateTimeHelper.setCurrentTimeZone(startDate.toString()) : undefined;

      const rate = this.billRatesSyncService.getBillRateForSync(
        rates, startDateValue, this.candidateJob.isLocal
      );
      this.extensionForm.get('billRate')?.patchValue(rate?.rateHour, { emitEvent: false, onlySelf: true });
      this.candidateRates = rates;
      this.cd.markForCheck();
    });
  }
}
