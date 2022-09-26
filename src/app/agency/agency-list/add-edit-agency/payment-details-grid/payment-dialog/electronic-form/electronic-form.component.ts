import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
  PaymentDetailsInterface,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';
import {
  BANK_COUNTRY,
  COUNTRIES,
  FORMAT_INPUT,
  OPTION_FIELDS,
  PHONE_MASK,
  PLACEHOLDER,
  ZIP_CODE_MASK,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/constant/payment.constant';
import { CanadaStates, Country, UsaStates } from '@shared/enums/states';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { Subject, takeUntil } from 'rxjs';
import { Store } from '@ngxs/store';
import { SetPaymentDetailsForm } from '@agency/store/agency.actions';

@Component({
  selector: 'app-electronic-form',
  templateUrl: './electronic-form.component.html',
  styleUrls: ['./electronic-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElectronicFormComponent extends DestroyableDirective implements PaymentDetailsInterface, OnInit {
  @Input() public saveEvent: Subject<number> = new Subject<number>();
  @Input() public formValue: PaymentDetails | ElectronicPaymentDetails;

  public paymentDetailsForm: FormGroup;
  public bankCountryStates: string[];
  public accountHolderCountryStates: string[];
  public readonly optionFields = OPTION_FIELDS;
  public readonly countries = COUNTRIES;
  public readonly formatInput = FORMAT_INPUT;
  public readonly placeholderInput = PLACEHOLDER;
  public readonly zipCodeMask = ZIP_CODE_MASK;
  public readonly holderPhoneMask = PHONE_MASK;

  constructor(private formBuilder: FormBuilder, private changeDetectorRef: ChangeDetectorRef, private store: Store) {
    super();
  }

  public ngOnInit(): void {
    this.createPaymentDetailsForm();
    this.onCountryChange('bankCountry');
    this.onCountryChange('accountHolderCountry');
    this.subscribeOnSaveEvent();
    this.setFormValue();
  }

  public createPaymentDetailsForm(): void {
    this.paymentDetailsForm = this.formBuilder.group({
      mode: [''],
      startDate: [null, [Validators.required]],
      endDate: [null],
      bankName: ['', [Validators.required]],
      routingNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      bankAddress1: ['', [Validators.required]],
      bankAddress2: [''],
      bankCountry: ['', [Validators.required]],
      bankState: [''],
      bankCity: [''],
      bankZipCode: ['', [Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]],
      accountHolderName: ['', [Validators.required]],
      accountHolderNumber: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      accountHolderPhone: ['', [Validators.minLength(10), Validators.pattern(/^[0-9]+$/)]],
      accountHolderAddress1: [''],
      accountHolderAddress2: [''],
      accountHolderCountry: ['', [Validators.required]],
      accountHolderState: [''],
      accountHolderCity: [''],
      accountHolderZipCode: ['', [Validators.minLength(5), Validators.pattern(/^[0-9]+$/)]],
      fee: ['', [Validators.pattern(/^[0-9]+$/)]],
      swiftCode: ['', [Validators.pattern(/^[0-9]+$/)]],
    });
  }

  private onCountryChange(controlName: string): void {
    this.paymentDetailsForm
      ?.get(controlName)
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        controlName === BANK_COUNTRY
          ? (this.bankCountryStates = this.getStatesValue(value))
          : (this.accountHolderCountryStates = this.getStatesValue(value));
        this.changeDetectorRef.markForCheck();
      });
  }

  private getStatesValue(value: number): string[] {
    return value === Country.USA ? UsaStates : CanadaStates;
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
