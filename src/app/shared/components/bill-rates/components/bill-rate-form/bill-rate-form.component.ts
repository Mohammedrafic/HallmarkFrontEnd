import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { takeWhile } from 'rxjs';

import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedTextBoxComponent } from "@syncfusion/ej2-angular-inputs";

import {
  BillRate,
  BillRateCategory,
  BillRateOption,
  BillRateType,
  BillRateTypes,
  BillRateUnit
} from '@shared/models/bill-rate.model';
import { GetBillRateOptions } from '@shared/components/bill-rates/store/bill-rate.actions';
import PriceUtils from '@shared/utils/price.utils';
import { currencyValidator } from '@shared/validators/currency.validator';

@Component({
  selector: 'app-bill-rate-form',
  templateUrl: './bill-rate-form.component.html',
  styleUrls: ['./bill-rate-form.component.scss'],
})
export class BillRateFormComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('billRateOptions')
  public billRateOptionsDropdown: DropDownListComponent;
  @ViewChild('rateHours')
  public rateHoursInput: MaskedTextBoxComponent;
  @Input() billRateForm: FormGroup;
  @Input() billRateOptions: BillRateOption[];
  @Input() billRatesData: BillRate[];
  billRateTypes = BillRateTypes;
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
  @Input() selectedBillRateUnit: BillRateUnit;
  public BillRateUnitList = BillRateUnit;
  public priceUtils = PriceUtils;

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

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(new GetBillRateOptions());

    const intervalMinControl = this.billRateForm.controls['intervalMin'];
    const intervalMaxControl = this.billRateForm.controls['intervalMax'];

    intervalMinControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.isIntervalMinControlRequired = intervalMinControl.hasValidator(Validators.required);
    });

    intervalMaxControl.valueChanges.pipe(takeWhile(() => this.isAlive)).subscribe(() => {
      this.isIntervalMaxControlRequired = intervalMaxControl.hasValidator(Validators.required);
    });
  }

  ngOnChanges(): void {
    if (this.billRateOptions && this.billRatesData) {
      this.billRateOptionsForSelect = this.billRateOptions.filter((rate) => {
        return !!this.billRatesData.find((item) => item.billRateConfigId === rate.id)
      });
    }
  }

  ngAfterViewInit(): void {
    this.onBillRateConfigIdChanged();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  setBillTypesAndUpdateControl(types: Array<BillRateType>): void {
    this.billRateTypes = BillRateTypes.filter(type => types.includes(type.id));
    this.billRateForm.get('billType')?.reset();
  }

  private onBillRateConfigIdChanged(): void {
    this.billRateForm
      .get('billRateConfigId')
      ?.valueChanges.pipe(takeWhile(() => this.isAlive))
      .subscribe((configId) => {
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
