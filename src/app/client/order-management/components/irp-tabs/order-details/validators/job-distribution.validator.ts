import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import {
  ExternalDistributionError,
  InternalDistributionError,
  InternalNotSelectedError,
} from '@client/order-management/components/irp-tabs/order-details/constants';
import { isDistributionIncludeExternalOptions } from '@client/order-management/components/irp-tabs/order-details/helpers';

export function jobDistributionValidator(controlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const value = control?.value;
    const allInternalSelected = value && value?.includes(IrpOrderJobDistribution.AllInternal)
    && value?.includes(IrpOrderJobDistribution.TieringLogicInternal);
    const internalNotSelected = !value?.includes(IrpOrderJobDistribution.AllInternal) && 
    !value?.includes(IrpOrderJobDistribution.TieringLogicInternal);

    if (internalNotSelected) {
      control?.setErrors({ errorMessage: InternalNotSelectedError });
    }

    if(allInternalSelected) {
      control?.setErrors({ errorMessage: InternalDistributionError });
    }

    if(value && isDistributionIncludeExternalOptions(value).length > 1) {
      control?.setErrors({ errorMessage: ExternalDistributionError });
    }

    return  null;
  };
}
