import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import {
  ElectronicPaymentDetails,
  PaymentDetails,
} from '@agency/agency-list/add-edit-agency/payment-details-grid/payment-dialog/model/payment-details.model';

export function startDateDuplicationValidator(
  control: string,
  paymentsList: PaymentDetails[] | ElectronicPaymentDetails[],
  initialValue: Date,
  mode: number
): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const invalidDate = { duplicateDate: true };
    const startDateControl = formGroup.get(control)!;
    const mappedPaymentsList = paymentsList.map((payment: PaymentDetails | ElectronicPaymentDetails) => {
      if (payment.mode === mode) {
        return transformDate(payment.startDate);
      }

      return;
    });

    if (
      initialValue &&
      transformDate(initialValue) !== transformDate(startDateControl.value) &&
      mappedPaymentsList.includes(transformDate(startDateControl.value))
    ) {
      startDateControl.setErrors(invalidDate);
    }

    if (!initialValue && mappedPaymentsList.includes(transformDate(startDateControl.value))) {
      startDateControl.setErrors(invalidDate);
    }

    return null;
  };
}

function transformDate(date: Date): string {
  return new Date(date).toLocaleDateString();
}
