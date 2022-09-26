import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { AbstractGridConfigurationComponent } from '@shared/components/abstract-grid-configuration/abstract-grid-configuration.component';
import { GridComponent, ValueAccessor } from '@syncfusion/ej2-angular-grids';
import { GRID_CONFIG } from 'src/app/shared/constants/grid-config';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { filter, Subject, takeWhile } from 'rxjs';
import { SetPaymentDetailsForm } from '@agency/store/agency.actions';
import { Country } from '@shared/enums/states';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';
import { PaymentDetailMode } from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/constant/payment.constant';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, RECORD_DELETE, RECORD_SAVED } from '@shared/constants';
import { MessageTypes } from '@shared/enums/message-types';

@Component({
  selector: 'app-payment-details-grid',
  templateUrl: './payment-details-grid.component.html',
  styleUrls: ['./payment-details-grid.component.scss'],
})
export class PaymentDetailsGridComponent
  extends AbstractGridConfigurationComponent
  implements OnInit, OnDestroy, AfterViewInit
{
  @ViewChild('grid') grid: GridComponent;

  @Input() paymentsFormArray: FormArray;

  public openEvent: Subject<boolean> = new Subject<boolean>();
  public override gridHeight = '250';
  public initialSort = {
    columns: [{ field: 'name', direction: 'Ascending' }],
  };
  public editedPaymentsDetails: ElectronicPaymentDetails | PaymentDetails;
  public countryAccessor: ValueAccessor = (value: string, data: any) => {
    return Country[data[value]];
  };
  public modeAccessor: ValueAccessor = (_, data: any) => PaymentDetailMode[data.mode];

  get data(): ElectronicPaymentDetails[] | PaymentDetails[] {
    return this.paymentsFormArray.value;
  }

  private isEditMode = false;
  private selectedForm: number;
  private isAlive = true;

  constructor(private store: Store, private actions$: Actions, private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnPaymentDetailsForm();
  }

  ngOnDestroy(): void {
    this.isAlive = false;
  }

  ngAfterViewInit(): void {
    this.grid.rowHeight = GRID_CONFIG.initialRowHeight;
  }

  public dataBound(): void {
    this.grid.autoFitColumns();
  }

  public onEdit({ index, ...paymentValue }: { index: number } & (ElectronicPaymentDetails | PaymentDetails)): void {
    this.selectedForm = index;
    this.isEditMode = true;
    this.editedPaymentsDetails = { ...paymentValue };
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onRemove({ index }: { index: string }): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter((confirm) => !!confirm))
      .subscribe(() => {
        this.paymentsFormArray.removeAt(Number(index));
        this.paymentsFormArray.markAsDirty();
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      });
  }

  public onFilter(): void {
    // TBI
  }

  public addNew(): void {
    this.isEditMode = false;
    this.openEvent.next(true);
    this.store.dispatch(new ShowSideDialog(true));
  }

  public onPaymentFormCancel(event: boolean): void {
    this.store.dispatch(new ShowSideDialog(event));
  }

  private subscribeOnPaymentDetailsForm(): void {
    this.actions$
      .pipe(
        ofActionDispatched(SetPaymentDetailsForm),
        takeWhile(() => this.isAlive)
      )
      .subscribe((paymentDetails: { form: FormGroup }) => {
        const hasDuplication = this.hasDuplicationDate(this.paymentsFormArray.value, paymentDetails.form);

        if (hasDuplication) {
          paymentDetails.form.controls['startDate'].setErrors({ duplicateDate: true });
          return;
        }

        if (!this.isEditMode) {
          this.paymentsFormArray.push(paymentDetails.form);
        } else {
          this.paymentsFormArray.controls[this.selectedForm].patchValue({ ...paymentDetails.form.value });
        }
        this.paymentsFormArray.markAsDirty();
        this.store.dispatch(new ShowSideDialog(false));
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_SAVED));
      });
  }

  private hasDuplicationDate(forms: PaymentDetails[] | ElectronicPaymentDetails[], currentForm: FormGroup): boolean {
    return [...forms]
      .map((form: PaymentDetails | ElectronicPaymentDetails) => {
        if (form.mode === currentForm.value.mode) {
          return new Date(form.startDate).toLocaleDateString();
        }
        return;
      })
      .includes(currentForm.value.startDate.toLocaleDateString());
  }
}
