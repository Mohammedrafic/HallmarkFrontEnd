import { ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { takeWhile } from 'rxjs';

import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';

import {
  BillRate,
  BillRateCategory,
  BillRateOption,
  BillRateType,
  BillRateTypes,
  BillRateUnit,
} from '@shared/models/bill-rate.model';
import PriceUtils from '@shared/utils/price.utils';
import { currencyValidator } from '@shared/validators/currency.validator';
import { OtBillRatesConfiguration } from '@shared/constants';
import { OrderManagementContentState } from '@client/store/order-managment-content.state';
import { DateTimeHelper } from '@core/helpers';

@Component({
  selector: 'app-bill-rate-form',
  templateUrl: './bill-rate-form.component.html',
  styleUrls: ['./bill-rate-form.component.scss'],
})
export class BillRateFormComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('billRateOptions')
  public billRateOptionsDropdown: DropDownListComponent;

  @ViewChild('rateHours')
  public rateHoursInput: MaskedTextBoxComponent;

  @Input() billRateForm: FormGroup;
  @Input() billRateOptions: BillRateOption[];
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

  public billRateOptionsForSelect: BillRateOption[];

  public isIntervalMinControlRequired = true;
  public isIntervalMaxControlRequired = true;
  public BillRateUnitList = BillRateUnit;
  public priceUtils = PriceUtils;
  public configOT: { title: string; formKey: string }[] = OtBillRatesConfiguration;

  get billRateConfigControl(): AbstractControl | null {
    return this.billRateForm.get('billRateConfig');
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
    const intervalMinControl = this.billRateForm.controls['intervalMin'];
    const intervalMaxControl = this.billRateForm.controls['intervalMax'];

    intervalMinControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.isIntervalMinControlRequired = intervalMinControl.hasValidator(Validators.required);
    });

    intervalMaxControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.isIntervalMaxControlRequired = intervalMaxControl.hasValidator(Validators.required);
    });

    this.startEffectiveDateWatching();

    this.onBillRateConfigIdChanged();
  }

  ngOnChanges(): void {
    if (this.billRateOptions) {
      this.predefinedBillRates = this.store.selectSnapshot(OrderManagementContentState.predefinedBillRates);
      this.billRateOptionsForSelect = this.billRateOptions;
    }
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  setBillTypesAndUpdateControl(types: Array<BillRateType>): void {
    this.billRateTypes = BillRateTypes.filter((type) => types.includes(type.id));
    this.billRateForm.get('billType')?.reset();
  }

  private startEffectiveDateWatching(): void {
    this.billRateForm.controls['effectiveDate']?.valueChanges.pipe(
      takeWhile(() => this.isAlive),
    ).subscribe(() => {
      this.setOTValue();
    });
  }

  private setOTValue(): void {
    const configId = this.billRateForm.get('billRateConfigId')?.value;
    const billRates = this.predefinedBillRates.filter(el => el.billRateConfigId === configId);
    const billRatesDates = billRates.map(el => el.effectiveDate);
    const date = this.billRateForm.get('effectiveDate')?.value;

    const idx = DateTimeHelper.findPreviousNearestDate(billRatesDates, date);

    if (idx !== null && billRates[idx]) {
      const { seventhDayOtEnabled, weeklyOtEnabled, dailyOtEnabled } = billRates[idx];

      this.billRateForm?.get('seventhDayOtEnabled')?.setValue(seventhDayOtEnabled);
      this.billRateForm?.get('weeklyOtEnabled')?.setValue(weeklyOtEnabled);
      this.billRateForm?.get('dailyOtEnabled')?.setValue(dailyOtEnabled);
    }

    this.cdr.detectChanges();
  }

  private onBillRateConfigIdChanged(): void {
    this.billRateForm
      .get('billRateConfigId')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe(() => {
        const configId = this.billRateForm.get('billRateConfigId')?.value;
        const billRateConfig = this.billRateOptionsDropdown.getDataByValue(configId) as BillRateOption;
        this.billRateConfigControl?.patchValue({
          ...billRateConfig,
        });
        const intervalMinControl = this.billRateForm.get('intervalMin');
        const intervalMaxControl = this.billRateForm.get('intervalMax');
        intervalMaxControl?.enable();
        intervalMinControl?.enable();
        intervalMaxControl?.addValidators(Validators.required);
        intervalMinControl?.addValidators(Validators.required);
        this.isIntervalMinControlRequired = true;
        this.isIntervalMaxControlRequired = true;
        if (billRateConfig) {
          this.setBillTypesAndUpdateControl(billRateConfig.billTypes);
          this.selectedBillRateUnit = billRateConfig.unit;
          this.billRateForm.get('rateHour')?.setValue('');
          if (!billRateConfig.intervalMin) {
            intervalMinControl?.reset();
            intervalMinControl?.disable();
            intervalMinControl?.removeValidators(Validators.required);
            this.isIntervalMinControlRequired = false;
          }
          if (!billRateConfig.intervalMax) {
            intervalMaxControl?.reset();
            intervalMaxControl?.disable();
            intervalMaxControl?.removeValidators(Validators.required);
            this.isIntervalMaxControlRequired = false;
          }
        }
        intervalMaxControl?.updateValueAndValidity();
        intervalMinControl?.updateValueAndValidity();

        this.setOTValue();
      });
  }

  static createForm(billRates?: BillRate[]): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      billRateConfigId: new FormControl(null, [Validators.required]),
      rateHour: new FormControl(null, [Validators.required, currencyValidator(1)]),
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
    });
  }
}
