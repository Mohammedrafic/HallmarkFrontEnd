import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import {
  ExternalDistributionError,
  InternalDistributionError,
} from '@client/order-management/components/irp-tabs/order-details/constants';
import { isDistributionIncludeExternalOptions } from '@client/order-management/components/irp-tabs/order-details/helpers';

export function jobDistributionValidator(controlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);

    if(control?.value && !control?.value.includes(IrpOrderJobDistribution.AllInternal)) {
      control?.setErrors({errorMessage: InternalDistributionError});
    }

    if(control?.value && isDistributionIncludeExternalOptions(control?.value).length > 1) {
      control?.setErrors({errorMessage: ExternalDistributionError});
    }

    return  null;
  };
}
