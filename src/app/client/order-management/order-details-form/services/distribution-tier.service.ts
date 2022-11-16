import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { JobDistributionDTO } from '@client/order-management/order-details-form/interfaces';

@Injectable()
export class DistributionTierService {
  constructor(
    private formBuilder: FormBuilder,
  ) {}

  public createJobDistributionForm(): CustomFormGroup<JobDistributionDTO> {
    return this.formBuilder.group({
      jobDistribution: [null, Validators.required],
      agency: [null],
      jobDistributions: [[]],
    }) as CustomFormGroup<JobDistributionDTO>;
  }
}
