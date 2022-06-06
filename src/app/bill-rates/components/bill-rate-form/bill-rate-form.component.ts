import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { filter, forkJoin, Observable, takeWhile, tap } from 'rxjs';

import { DropDownListComponent } from '@syncfusion/ej2-angular-dropdowns';
import { MaskedTextBoxComponent } from '@syncfusion/ej2-angular-inputs';

import { BillRateState } from '@bill-rates/store/bill-rate.state';
import { BillRateCategory, BillRateOption, BillRateType, BillRateUnit } from '@shared/models/bill-rate.model';
import { GetBillRateOptions } from '@bill-rates/store/bill-rate.actions';

const RateHourMask = {
  desimal: '00.00',
  hours: '00.[0-5]0',
};

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
  @ViewChild('intervalMin')
  public intervalMinInput: MaskedTextBoxComponent;
  @ViewChild('intervalMax')
  public intervalMaxInput: MaskedTextBoxComponent;

  @Input() billRateForm: FormGroup;

  public billRateConfig: BillRateOption;
  public optionFields = {
    text: 'title',
    value: 'id',
  };
  public rateHourMack = false;

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
  }

  ngAfterViewInit(): void {
    this.onBillRateConfigIdChanged();
    this.getMackedValuesOnInputChange();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
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
        if (billRateConfig) {
          this.rateHoursInput.mask = billRateConfig.unit === BillRateUnit.Hours ? RateHourMask.hours : RateHourMask.desimal;
          this.rateHoursInput.refresh();
          if (!billRateConfig.intervalMin) {
            intervalMinControl?.reset();
            intervalMinControl?.disable();
          }
          if (!billRateConfig.intervalMax) {
            intervalMaxControl?.reset();
            intervalMaxControl?.disable();
          }
        }
      });
  }

  private getMackedValuesOnInputChange(): void {
    const rateHourControl = this.billRateForm.get('rateHour');
    const intervalMinControl = this.billRateForm.get('intervalMin');
    const intervalMaxControl = this.billRateForm.get('intervalMax');
    forkJoin([
      rateHourControl?.valueChanges.pipe(
        filter((value) => !!value),
        tap(() => rateHourControl?.patchValue(this.rateHoursInput.getMaskedValue(), { emitEvent: false }))
      ),
      intervalMinControl?.valueChanges.pipe(
        filter((value) => !!value),
        tap(() => intervalMinControl?.patchValue(this.intervalMinInput.getMaskedValue(), { emitEvent: false }))
      ),
      intervalMaxControl?.valueChanges.pipe(
        filter((value) => !!value),
        tap(() => intervalMaxControl?.patchValue(this.intervalMaxInput.getMaskedValue(), { emitEvent: false }))
      ),
    ])
      .pipe(takeWhile(() => this.isAlive))
      .subscribe();
  }

  static createForm(): FormGroup {
    return new FormGroup({
      id: new FormControl(),
      billRateConfigId: new FormControl(null, [Validators.required]),
      rateHour: new FormControl(null, [Validators.required]),
      intervalMin: new FormControl(null, [Validators.required]),
      intervalMax: new FormControl(null, [Validators.required]),
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
