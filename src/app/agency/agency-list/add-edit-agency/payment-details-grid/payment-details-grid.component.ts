import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

import { GridComponent, PageSettingsModel, ValueAccessor } from '@syncfusion/ej2-angular-grids';

import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';
import { valuesOnly } from 'src/app/shared/utils/enum.utils';
import { ShowSideDialog } from 'src/app/store/app.actions';

enum PaymentDetailMode {
  Manual,
  Electronic,
}

type PaymentDetail = {
  mode: string;
  payee: string;
  address: string;
  city: string;
  zip: number;
  startDate: string;
};

@Component({
  selector: 'app-payment-details-grid',
  templateUrl: './payment-details-grid.component.html',
  styleUrls: ['./payment-details-grid.component.scss'],
})
export class PaymentDetailsGridComponent extends AbstractGridConfigurationComponent implements OnInit, AfterViewInit {
  @Input() paymentsFormArray: FormArray;
  @ViewChild('grid') grid: GridComponent;

  public override gridHeight = '250';

  public initialSort = {
    columns: [{ field: 'name', direction: 'Ascending' }],
  };
  public paymentDetailsForm: FormGroup;
  public paymentMode = Object.values(PaymentDetailMode)
    .filter(valuesOnly)
    .map((text, id) => ({ text, id }));
  public optionFields = {
    text: 'text',
    value: 'id',
  };
  public modeAccessor: ValueAccessor = (_, data: any) => PaymentDetailMode[data['mode']];

  get data(): PaymentDetail[] {
    return this.paymentsFormArray.value;
  }

  private isEditMode = false;

  constructor(private store: Store, private fb: FormBuilder) {
    super();
  }

  ngOnInit(): void {
    this.paymentDetailsForm = this.generatePaymentForm();
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onEdit({ index, ...paymentValue }: { index: string } & PaymentDetail): void {
    this.isEditMode = true;
    this.paymentDetailsForm = this.paymentsFormArray.controls[Number(index)] as FormGroup;
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove({ index }: { index: string }): void {
    this.paymentsFormArray.removeAt(Number(index));
  }

  public onFilter(): void {
    // TBI
  }

  public addNew(): void {
    this.isEditMode = false;
    this.paymentDetailsForm = this.generatePaymentForm();
    this.paymentDetailsForm.patchValue({ mode: PaymentDetailMode.Manual });
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onPaymentFormSave(): void {
    this.paymentDetailsForm.markAllAsTouched();
    if (this.paymentDetailsForm.valid) {
      if (!this.isEditMode) {
        const newPayment = this.generatePaymentForm();
        newPayment.patchValue(this.paymentDetailsForm.value);

        this.paymentsFormArray.push(newPayment);
      }
      this.paymentsFormArray.markAsDirty();
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public onPaymentFormCancel(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  private generatePaymentForm(): FormGroup {
    return this.fb.group({
      mode: new FormControl({ value: PaymentDetailMode.Manual }, [Validators.required]),
      payee: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      address: new FormControl('', [Validators.maxLength(500)]),
      city: new FormControl('', [Validators.maxLength(20)]),
      zip: new FormControl('', [Validators.minLength(5),]),
      startDate: new FormControl('', [Validators.required]),
    });
  }
}
