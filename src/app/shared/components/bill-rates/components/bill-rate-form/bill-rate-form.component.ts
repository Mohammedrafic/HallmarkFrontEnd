/* eslint-disable max-lines-per-function */
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { takeWhile } from 'rxjs';

import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';

import {
  BillRate,
  BillRateCalculationType,
  BillRateCategory,
  BillRateOption,
  BillRateType,
  BillRateTypes,
  BillRateUnit,
} from '@shared/models/bill-rate.model';
import PriceUtils from '@shared/utils/price.utils';
import { OtBillRatesConfiguration } from '@shared/constants';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { DateTimeHelper } from '@core/helpers';
import { BillRateTitleId } from '@shared/enums/bill-rate-title-id.enum';

@Component({
  selector: 'app-bill-rate-form',
  templateUrl: './bill-rate-form.component.html',
  styleUrls: ['./bill-rate-form.component.scss'],
})
export class BillRateFormComponent implements OnInit, OnDestroy {
  @ViewChild('rateHours')
  public rateHoursInput: MaskedTextBoxComponent;

  @Input() billRateForm: FormGroup;
  @Input() billRatesData: BillRate[];
  @Input() selectedBillRateUnit: BillRateUnit;

  public billRateTypes = BillRateTypes;
  public billRateConfig: BillRateOption;
  public optionFields = {
    text: 'title',
    value: 'id',
  };

  public billRateFields = {
    text: 'name',
    value: 'id',
  };

  public billRateOptions: BillRateOption[] = [];
  public isIntervalMinEnabled = true;
  public isIntervalMaxEnabled = true;
  public isIntervalMinRequired = true;
  public isIntervalMaxRequired = true;
  public BillRateUnitList = BillRateUnit;
  public priceUtils = PriceUtils;
  public configOT: { title: string; formKey: string }[] = OtBillRatesConfiguration;
  public additionalLableForMinMax: string | null = null;
  public hideFilds = new Set<string>();
  public isWeeklyOT = false;
  public static calculateOTSFlags = true;
  public isMileageTitleType: boolean;
  public format = '#';
  public decimals = 2;

  get billRateConfigControl(): AbstractControl | null {
    return this.billRateForm.get('billRateConfig');
  }

  get isInternalsEnabled(): boolean {
    return this.billRateForm.get('billRateConfigId')?.value !== BillRateTitleId.Mileage;;
  }

  get categoryValue(): string {
    return BillRateCategory[this.billRateConfigControl?.value.category] || '';
  }

  get typeValue(): string {
    return BillRateType[this.billRateConfigControl?.value?.type] || '';
  }

  get rateHourControl(): AbstractControl | null {
    return this.billRateForm.get('rateHour');
  }

  private isAlive = true;
  private predefinedBillRates: BillRate[] = [];

  constructor(private store: Store, private cdr: ChangeDetectorRef) {}

  public trackByFn(_: number, otItem: { formKey: string }): string {
    return otItem.formKey;
  }

  ngOnInit(): void {
    this.startBillRatesOptionsWatching();

    const intervalMinControl = this.billRateForm.controls['intervalMin'];
    const intervalMaxControl = this.billRateForm.controls['intervalMax'];

    intervalMinControl.valueChanges
    .pipe(takeWhile(() => this.isAlive))
    .subscribe(() => {
      this.isIntervalMinEnabled = intervalMinControl.hasValidator(Validators.required);
    });

    intervalMaxControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.isIntervalMaxEnabled = intervalMaxControl.hasValidator(Validators.required);
    });

    this.startEffectiveDateWatching();
    this.onBillRateConfigIdChanged();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  setBillTypesAndUpdateControl(types: Array<BillRateType>): void {
    this.billRateTypes = BillRateTypes.filter((type) => types.includes(type.id));
    this.billRateForm.get('billType')?.reset();
  }

  private startBillRatesOptionsWatching(): void {
    this.store.select(OrderManagementContentState.predefinedBillRatesOptions)
    .pipe(
      takeWhile(() => this.isAlive),
    ).subscribe((options: BillRateOption[]) => {
      this.predefinedBillRates = this.store.selectSnapshot(OrderManagementContentState.predefinedBillRates);
      this.billRateOptions = options;
      this.cdr.detectChanges();
    });
  }

  private startEffectiveDateWatching(): void {
    this.billRateForm.controls['effectiveDate']?.valueChanges
    .pipe(
      takeWhile(() => this.isAlive),
    ).subscribe(() => {
      this.setOTValue();
    });
  }

  private setOTValue(): void {
    if (BillRateFormComponent.calculateOTSFlags) {
      const configId = this.billRateForm.get('billRateConfigId')?.value;
      const billRates = this.predefinedBillRates.filter(el => el.billRateConfigId === configId);
      const billRatesDates = billRates.map(el => el.effectiveDate);
      const date = this.billRateForm.get('effectiveDate')?.value;

      const idx = DateTimeHelper.findPreviousNearestDateIndex(billRatesDates, date);

      if (idx !== null && billRates[idx]) {
        const { seventhDayOtEnabled, weeklyOtEnabled, dailyOtEnabled } = billRates[idx];

        this.billRateForm?.get('seventhDayOtEnabled')?.setValue(seventhDayOtEnabled);
        this.billRateForm?.get('weeklyOtEnabled')?.setValue(weeklyOtEnabled);
        this.billRateForm?.get('dailyOtEnabled')?.setValue(dailyOtEnabled);
      }
    } else {
      BillRateFormComponent.calculateOTSFlags = true;
    }

    this.cdr.detectChanges();
  }


  private onBillRateConfigIdChanged(): void {
    this.billRateForm.get('billRateConfigId')?.valueChanges
    .pipe(takeWhile(() => this.isAlive))
      .subscribe((rateId) => {
        const configId = this.billRateForm.get('billRateConfigId')?.value;
        const billRateConfig = this.billRateOptions.find((option) => configId === option.id) as BillRateOption;
        this.billRateConfigControl?.patchValue({
          ...billRateConfig,
        });
        const intervalMinControl = this.billRateForm.get('intervalMin');
        const intervalMaxControl = this.billRateForm.get('intervalMax');
        const VALIDATORS = [Validators.required, Validators.minLength(1), Validators.maxLength(10)];

        this.isMileageTitleType = configId !== BillRateTitleId.Mileage;

        if (billRateConfig) {
          this.setBillTypesAndUpdateControl(billRateConfig.billTypes);
          this.selectedBillRateUnit = billRateConfig.unit;
          this.billRateForm.get('rateHour')?.setValue('0');
          this.isIntervalMinEnabled = billRateConfig.intervalMin;
          this.isIntervalMaxEnabled = billRateConfig.intervalMax;
          this.isIntervalMinRequired = billRateConfig.intervalMinRequired;
          this.isIntervalMaxRequired = billRateConfig.intervalMaxRequired;
        }

        if (this.isIntervalMinRequired) {
          intervalMinControl?.addValidators(VALIDATORS);
        } else {
          intervalMinControl?.clearValidators();
        }

        if (this.isIntervalMaxRequired) {
          intervalMaxControl?.addValidators(VALIDATORS);
        } else {
          intervalMaxControl?.clearValidators();
        }

        if (this.isIntervalMinEnabled) {
          intervalMinControl?.reset();
          intervalMinControl?.enable();
        } else {
          intervalMinControl?.reset();
          intervalMinControl?.disable();
        }

        if (this.isIntervalMaxEnabled) {
          intervalMaxControl?.reset();
          intervalMaxControl?.enable();
        } else {
          intervalMaxControl?.reset();
          intervalMaxControl?.disable();
        }

        if (
          billRateConfig?.id === BillRateCalculationType.Regular ||
          billRateConfig?.id === BillRateCalculationType.RegularLocal
        ) {
          intervalMinControl?.setValue(0);
        }

        if (rateId === BillRateTitleId.MissedMeal) {
          this.billRateForm.get('rateHour')?.patchValue(1);
        }

        if (rateId === BillRateTitleId.FacilityCalledOff || rateId === BillRateTitleId.ResourceCalledOff) {
          this.billRateForm.get('rateHour')?.disable();
          this.billRateForm.get('rateHour')?.patchValue(0);
          this.billRateForm.get('rateHour')?.removeValidators(Validators.required);
        } else {
          this.billRateForm.get('rateHour')?.addValidators(Validators.required);
          this.billRateForm.get('rateHour')?.enable();
        }

        if (billRateConfig) {
          this.changeFieldsSettingByType(billRateConfig.id);
        }

        intervalMaxControl?.updateValueAndValidity();
        intervalMinControl?.updateValueAndValidity();

        this.setOTValue();

        this.setFormatdecimalsValues();
      });
  }

  private changeFieldsSettingByType(billRateType: BillRateCalculationType): void {
    this.hideFilds.clear();
    switch (billRateType) {
      case BillRateCalculationType.RegularLocal:
        this.additionalLableForMinMax = 'Mileage';
        break;
      case BillRateCalculationType.GuaranteedHours:
        this.additionalLableForMinMax = 'Work Week';
        this.hideFilds.add('intervalMax');
        this.hideFilds.add('rateHour');
        this.billRateForm.get('rateHour')?.clearValidators();
        this.billRateForm.get('rateHour')?.updateValueAndValidity();
        break;
      case BillRateCalculationType.WeeklyOT:
        this.isWeeklyOT = true;
        break;
      default:
        this.isWeeklyOT = false;
        this.additionalLableForMinMax = null;
        break;
    }
  }

  static createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      billRateConfigId: new FormControl(null, [Validators.required]),
      rateHour: new FormControl(null, [Validators.required]),
      intervalMin: new FormControl(null),
      intervalMax: new FormControl(null),
      editAllowed: new FormControl(false),
      billType: new FormControl(false, [Validators.required]),
      effectiveDate: new FormControl('', [Validators.required]),
      isPredefined: new FormControl(false),
      seventhDayOtEnabled: new FormControl(false),
      weeklyOtEnabled: new FormControl(false),
      dailyOtEnabled: new FormControl(false),
      billRateConfig: new FormGroup({
        id: new FormControl(),
        category: new FormControl(),
        title: new FormControl(),
        billTypes: new FormControl(),
        unit: new FormControl(),
        intervalMin: new FormControl(),
        intervalMax: new FormControl(),
        considerForOT: new FormControl(),
      }),
      isUpdated: new FormControl(false),
    });
  }

  private setFormatdecimalsValues(): void {
    const isBillRateUnitHours = this.selectedBillRateUnit === this.BillRateUnitList.Hours;
    this.format = isBillRateUnitHours ? '#' : this.isMileageTitleType ? '###.00' : '###.000';
    this.decimals = isBillRateUnitHours ? 0 : this.isMileageTitleType ? 2 : 3;
    this.cdr.markForCheck();
  }
}

