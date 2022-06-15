import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { filter, forkJoin, Observable, takeWhile, tap } from 'rxjs';

import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';

import { BillRateState } from '@bill-rates/store/bill-rate.state';
import { BillRate, BillRateCategory, BillRateOption, BillRateType, BillRateUnit } from '@shared/models/bill-rate.model';
import { GetBillRateOptions } from '@bill-rates/store/bill-rate.actions';
import PriceUtils from "@shared/utils/price.utils";

@Component({
  selector: 'app-bill-rate-form',
  templateUrl: './bill-rate-form.component.html',
  styleUrls: ['./bill-rate-form.component.scss'],
})
export class BillRateFormComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('billRateOptions')
  public billRateOptionsDropdown: DropDownListComponent;
  @ViewChild('rateHours')
  public rateHoursInput: MaskedTextBoxComponent;

  @Input() billRateForm: FormGroup;

  public billRateConfig: BillRateOption;
  public optionFields = {
    text: 'title',
    value: 'id',
  };
  public rateHourMack = false;
  public priceUtils = PriceUtils;

  public isIntervalMinControlRequired = true;
  public isIntervalMaxControlRequired = true;
  public selectedBillRateUnit: BillRateUnit = BillRateUnit.Multiplier;
  public BillRateUnitList = BillRateUnit;
  public rateHourMask: string;

  @Select(BillRateState.billRateOptions)
  public billRateOptions$: Observable<BillRateOption[]>;

  get billRateConfigControl(): AbstractControl | null {
    return this.billRateForm.get('billRateConfig');
  }

  get categoryValue(): string {
    return BillRateCategory[this.billRateConfigControl?.value.category] || '';
  }

  get typeValue(): string {
    return BillRateType[this.billRateConfigControl?.value?.type] || '';
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

  ngAfterViewInit(): void {
    this.onBillRateConfigIdChanged();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  public onRateHourBlur(event: any): void {
    if (event.value.toString().length <= 7 || (event.value.toString().length <= 7 && event.value.toString().includes('.'))) {
      this.rateHourMask = '#.00';
    } else if (event.value.toString().length === 8 || (event.value.toString().length === 10 && event.value.toString().includes('.'))) {
      this.rateHourMask = '#.0';
    } else {
      this.rateHourMask = '#';
    }
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
      rateHour: new FormControl(null, [Validators.required]),
      intervalMin: new FormControl(null),
      intervalMax: new FormControl(null),
      effectiveDate: new FormControl('', [Validators.required]),
      billRateConfig: new FormGroup({
        id: new FormControl(),
        category: new FormControl(),
        title: new FormControl(),
        type: new FormControl(),
        unit: new FormControl(),
        intervalMin: new FormControl(),
        intervalMax: new FormControl(),
        considerForOT: new FormControl(),
      }),
    });
  }
}
