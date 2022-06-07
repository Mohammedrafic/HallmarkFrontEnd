import {AfterViewInit, Component, Input, OnInit, ViewChild} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';

import { GridComponent, ValueAccessor } from '@syncfusion/ej2-angular-grids';

import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';
import { valuesOnly } from 'src/app/shared/utils/enum.utils';
import { ShowSideDialog } from 'src/app/store/app.actions';
import { AgencyPaymentDetails } from "@shared/models/agency.model";

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

  constructor(private store: Store) {
    super();
  }

  ngOnInit(): void {
    this.paymentDetailsForm = PaymentDetailsGridComponent.generatePaymentForm();
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
    this.paymentsFormArray.markAsDirty();
  }

  public onFilter(): void {
    // TBI
  }

  public addNew(): void {
    this.isEditMode = false;
    this.paymentDetailsForm = PaymentDetailsGridComponent.generatePaymentForm();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onPaymentFormSave(): void {
    this.paymentDetailsForm.markAllAsTouched();
    if (this.paymentDetailsForm.valid) {
      if (!this.isEditMode) {
        const newPayment = PaymentDetailsGridComponent.generatePaymentForm();
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

  static generatePaymentForm(payment?: AgencyPaymentDetails): FormGroup {
    return new FormGroup({
      mode: new FormControl( payment ? payment.mode : PaymentDetailMode.Electronic, [Validators.required]),
      payee: new FormControl(payment ? payment.payee : '', [Validators.required, Validators.maxLength(50)]),
      address: new FormControl(payment ? payment.address : '', [Validators.maxLength(500)]),
      city: new FormControl(payment ? payment.city : '', [Validators.maxLength(20)]),
      zip: new FormControl(payment ? payment.zip : '', [Validators.minLength(5),]),
      startDate: new FormControl(payment ? payment.startDate : '', [Validators.required]),
    });
  }
}
