import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
  PaymentDetailsInterface,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { SetPaymentDetailsForm } from '@agency/store/agency.actions';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Store } from '@ngxs/store';
import {
  FORMAT_INPUT,
  PLACEHOLDER,
  ZIP_CODE_MASK,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/constant/payment.constant';
import { startDateDuplicationValidator } from '@shared/validators/start-date-duplication.validator';

@Component({
  selector: 'app-manual-form',
  templateUrl: './manual-form.component.html',
  styleUrls: ['./manual-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManualFormComponent extends DestroyableDirective implements PaymentDetailsInterface, OnInit {
  @Input() public saveEvent: Subject<number> = new Subject<number>();
  @Input() public formValue: PaymentDetails | ElectronicPaymentDetails;
  @Input() public paymentsList: PaymentDetails[] | ElectronicPaymentDetails[];
  @Input() public mode: number;
  @Input() editAgencyNetsuitePaymentId: boolean;

  public paymentDetailsForm: FormGroup;
  public readonly formatInput = FORMAT_INPUT;
  public readonly placeholderInput = PLACEHOLDER;
  public readonly zipCodeMask = ZIP_CODE_MASK;

  get startDateControl(): AbstractControl | null {
    return this.paymentDetailsForm?.get('startDate');
  }

  constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private store: Store) {
    super();
  }

  public ngOnInit(): void {
    this.createPaymentDetailsForm();
    this.subscribeOnSaveEvent();
    this.setFormValue();
  }

  public createPaymentDetailsForm(): void {
    this.paymentDetailsForm = this.formBuilder.group(
      {
        mode: [''],
        payee: ['', [Validators.required, Validators.maxLength(50)]],
        bankAddress1: ['', [Validators.maxLength(500), Validators.required]],
        bankCity: ['', [Validators.maxLength(20)]],
        bankZipCode: ['', [Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]],
        startDate: ['', [Validators.required]],
      },
      {
        validators: startDateDuplicationValidator('startDate', this.paymentsList, this.formValue?.startDate, this.mode),
      }
    );
  }

  private subscribeOnSaveEvent(): void {
    this.saveEvent.pipe(takeUntil(this.destroy$)).subscribe((event: number) => {
      this.paymentDetailsForm.patchValue({ mode: event });
      this.paymentDetailsForm.markAllAsTouched();
      this.changeDetectorRef.markForCheck();

      if (this.paymentDetailsForm.valid) {
        this.store.dispatch(new SetPaymentDetailsForm(this.paymentDetailsForm));
      }
    });
  }

  private setFormValue(): void {
    if (this.formValue) {
      this.paymentDetailsForm.patchValue({ ...this.formValue });
    }
  }
}
