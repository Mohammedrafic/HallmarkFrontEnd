import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { IrpOrderJobDistribution } from '@shared/enums/job-distibution';
import {
  DistributionvalueError,
  ExternalDistributionError,
  InternalDistributionError,
  InternalNotSelectedError,
} from '@client/order-management/components/irp-tabs/order-details/constants';
import { isDistributionIncludeExternalOptions } from '@client/order-management/components/irp-tabs/order-details/helpers';

export function jobDistributionValidator(controlName: string,distributeToVMS:string,distributionDelay: string,isTemplate? : boolean): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const control = formGroup.get(controlName);
    const value = control?.value;
console.log(value);
    const allInternalSelected = value && value?.includes(IrpOrderJobDistribution.AllInternal)
    && value?.includes(IrpOrderJobDistribution.TieringLogicInternal);

    const internalNotSelected = value && (!value?.includes(IrpOrderJobDistribution.AllInternal) &&
    !value?.includes(IrpOrderJobDistribution.TieringLogicInternal));

    if (internalNotSelected && !isTemplate) {
      control?.setErrors({ errorMessage: InternalNotSelectedError });
    }

    if(allInternalSelected && !isTemplate) {
      control?.setErrors({ errorMessage: InternalDistributionError });
    }

    if(value && isDistributionIncludeExternalOptions(value).length > 1 && !isTemplate) {
      control?.setErrors({ errorMessage: ExternalDistributionError });
    }
    const distributiondelaycontrol = formGroup.get(distributionDelay);
    const distributiondelayvalue = distributiondelaycontrol?.value;
    const distributionvaluecontrol = formGroup.get(distributeToVMS);
    const distributionvalue = distributionvaluecontrol?.value !=null ? distributionvaluecontrol?.value.length===0 ? null : distributionvaluecontrol?.value : null;

    if (distributiondelayvalue && distributionvalue==null && !isTemplate) {
      distributionvaluecontrol?.setErrors({ errorMessage: DistributionvalueError });
    }

    return  null;
  };
}
