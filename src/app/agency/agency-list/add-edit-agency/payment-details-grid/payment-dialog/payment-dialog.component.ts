import {
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { ElectronicFormComponent } from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/electronic-form/electronic-form.component';
import { ManualFormComponent } from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/manual-form/manual-form.component';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
  PaymentDetailsInterface,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';
import { FormControl } from '@angular/forms';
import {
  PAYMENT_MODE,
  PaymentDetailMode,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/constant/payment.constant';
import { filter, Subject, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { ConfirmService } from '@shared/services/confirm.service';

@Component({
  selector: 'app-payment-dialog',
  templateUrl: './payment-dialog.component.html',
  styleUrls: ['./payment-dialog.component.scss'],
})
export class PaymentDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('paymentFormContainer', { read: ViewContainerRef, static: true }) paymentContainer!: ViewContainerRef;

  @Output() modalClose = new EventEmitter<boolean>();
  @Input() dialogEvent: Subject<boolean>;
  @Input() set onEdit(value: PaymentDetails | ElectronicPaymentDetails) {
    if (value) {
      this.editPaymentForm(value);
    }
  }

  public paymentModeControl = new FormControl();
  public paymentModeList = PAYMENT_MODE;

  private components = new Map<number, ComponentRef<PaymentDetailsInterface>>();

  constructor(private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
  }

  public onCancel(): void {
    const currentFormComponent = this.getFormInstance(this.paymentModeControl.value);

    if (currentFormComponent?.paymentDetailsForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter((confirm: boolean) => !!confirm))
        .subscribe(() => {
          this.modalClose.emit(false);
          this.clearPaymentContainer();
        });
    } else {
      this.modalClose.emit(false);
      this.clearPaymentContainer();
    }
  }

  public onSave(): void {
    const currentFormComponent = this.getFormInstance(this.paymentModeControl.value);
    currentFormComponent?.saveEvent.next(this.paymentModeControl.value);

    if (currentFormComponent?.paymentDetailsForm.valid) {
      this.clearPaymentContainer();
    }
  }

  public onChangePaymentMode(mode: { value: number }): void {
    this.createComponent(mode.value);
  }

  private createComponent(mode: number): void {
    this.paymentContainer.detach();

    if (this.components.has(mode)) {
      const viewElement = this.components.get(mode) as ComponentRef<PaymentDetailsInterface>;
      this.paymentContainer.insert(viewElement.hostView);
      return;
    }

    const componentType = this.getComponentType(mode);
    const component = this.paymentContainer.createComponent(componentType);
    this.components.set(mode, component);
  }

  private getComponentType(mode: number): Type<PaymentDetailsInterface> {
    switch (mode) {
      case PaymentDetailMode.Manual:
        return ManualFormComponent;
      case PaymentDetailMode.Electronic:
        return ElectronicFormComponent;
      default:
        return ElectronicFormComponent;
    }
  }

  private subscribeOnOpenEvent(): void {
    this.dialogEvent
      .pipe(
        filter((event: boolean) => event!!),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.paymentModeControl.enable();
        this.paymentModeControl.patchValue(PaymentDetailMode.Electronic);
        this.createComponent(PaymentDetailMode.Electronic);
      });
  }

  private clearPaymentContainer(): void {
    this.paymentContainer.clear();
    this.components.clear();
  }

  private editPaymentForm(value: PaymentDetails | ElectronicPaymentDetails): void {
    this.paymentModeControl.patchValue(value.mode);
    this.paymentModeControl.disable();
    this.createComponent(value.mode);
    const currentComponent = this.getFormInstance(value.mode);
    if (currentComponent) {
      currentComponent.formValue = value;
    }
  }

  private getFormInstance(mode: number): PaymentDetailsInterface {
    return this.components.get(mode)!.instance;
  }
}
