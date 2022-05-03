import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';

import { GridComponent, PageSettingsModel } from '@syncfusion/ej2-angular-grids';

import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';
import { ShowSideDialog } from 'src/app/store/app.actions';

enum PaymentDetailMode {
  Electronic = 'Electronic',
  Manual = 'Manual',
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
export class PaymentDetailsGridComponent implements OnInit, AfterViewInit {
  @Input() paymentsFormArray: FormArray;
  @ViewChild('grid') grid: GridComponent;

  public pageSettings: PageSettingsModel = { pageSizes: true, pageSize: 3 };
  public resizeSettings = GRID_CONFIG.resizeSettings;
  public allowPaging = GRID_CONFIG.isPagingEnabled;
  public gridHeight = '250';
  public rowsPerPageDropDown = GRID_CONFIG.rowsPerPageDropDown;
  public activeRowsPerPageDropDown = GRID_CONFIG.rowsPerPageDropDown[0];
  public initialSort = {
    columns: [{ field: 'name', direction: 'Ascending' }],
  };
  public paymentDetailsForm: FormGroup;
  public paymentMode = Object.values(PaymentDetailMode);

  get data(): PaymentDetail[] {
    return this.paymentsFormArray.value;
  }

  constructor(private store: Store, private fb: FormBuilder) {}

  ngOnInit(): void {
   this.paymentDetailsForm = this.generatePaymentForm();
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onEdit(item: unknown): void {
    console.log(item);
  }

  public onRemove(item: unknown): void {
    console.log(item);
  }

  public onFilter(): void {
    // TBI
  }

  public addNew(): void {
    this.paymentDetailsForm.reset();
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onPaymentFormSave(): void {
    this.paymentDetailsForm.markAllAsTouched();
    if (this.paymentDetailsForm.valid) {
      const newPayment = this.generatePaymentForm();
      newPayment.patchValue(this.paymentDetailsForm.value);

      this.paymentsFormArray.push(newPayment);
      this.store.dispatch(new ShowSideDialog(false));
    }
  }

  public onPaymentFormCancel(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  private generatePaymentForm(): FormGroup {
    return this.fb.group({
      mode: new FormControl(PaymentDetailMode.Manual, [Validators.required]),
      payee: new FormControl('', [Validators.required, Validators.maxLength(50)]),
      address: new FormControl('', [Validators.maxLength(500)]),
      city: new FormControl('', [Validators.maxLength(20)]),
      zip: new FormControl(''),
      startDate: new FormControl(undefined, [Validators.required]),
    });
  }
}
