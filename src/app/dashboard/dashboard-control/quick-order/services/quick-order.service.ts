import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import {
  ContactDetailsDTO,
  JobDistributionDescriptionDTO,
  OrderInformationDTO,
  OrderTypeDTO,
  OrganizationDTO,
  SpecialProjectDTO
} from '../interfaces';
import { OrderType } from '@shared/enums/order-type';
import { integerValidator } from '@shared/validators/integer.validator';
import { greaterThanValidator } from '@shared/validators/greater-than.validator';

@Injectable()
export class QuickOrderService {
  constructor(
    private formBuilder: FormBuilder,
  ) {}

  public createOrganizationForm(): CustomFormGroup<OrganizationDTO> {
    return this.formBuilder.group({
      organization: [null, Validators.required],
      title: [null, [Validators.required, Validators.maxLength(50)]],
    }) as CustomFormGroup<OrganizationDTO>;
  }

  public createOrderTypeForm(): CustomFormGroup<OrderTypeDTO> {
    return this.formBuilder.group({
      orderType: [OrderType.Traveler, Validators.required],
    }) as CustomFormGroup<OrderTypeDTO>;
  }

  public createOrderInformationForm(): CustomFormGroup<OrderInformationDTO> {
    return this.formBuilder.group(
      {
        regionId: [null, Validators.required],
        locationId: [null, Validators.required],
        departmentId: [null, Validators.required],
        skillId: [null, Validators.required],
        hourlyRate: [null, [Validators.required, Validators.maxLength(10)]],
        openPositions: [null, [Validators.required, Validators.maxLength(10), integerValidator(1)]],
        duration: [null, Validators.required],
        jobStartDate: [null, Validators.required],
        jobEndDate: [null, Validators.required],
        shift: [null, Validators.required],
        shiftStartTime: [null, Validators.required],
        shiftEndTime: [null, Validators.required],
        orderPlacementFee: [null, Validators.required],
        annualSalaryRangeFrom: [null, Validators.required],
        annualSalaryRangeTo: [null, Validators.required],
        linkedId: [null, Validators.maxLength(20)],
      },
      { validators: greaterThanValidator('annualSalaryRangeFrom', 'annualSalaryRangeTo') }
    ) as CustomFormGroup<OrderInformationDTO>;
  }

  public createJobDistributionForm(): CustomFormGroup<JobDistributionDescriptionDTO> {
    return this.formBuilder.group({
      jobDistribution: [null, Validators.required],
      agency: [null],
      jobDistributions: [[]],
      jobDescription: ['', Validators.maxLength(4000)],
      orderRequisitionReasonId: [null, Validators.required],
      orderRequisitionReasonName: [null],
    }) as CustomFormGroup<JobDistributionDescriptionDTO>;
  }

  public createContactDetailsForm(): CustomFormGroup<ContactDetailsDTO> {
    return this.formBuilder.group({
      title: [[], Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isPrimaryContact: true,
    }) as CustomFormGroup<ContactDetailsDTO>;
  }

  public createSpecialProjectForm(): CustomFormGroup<SpecialProjectDTO> {
    return this.formBuilder.group({
      projectTypeId: [null, Validators.required],
      projectNameId: [null, Validators.required],
      poNumberId: [null, Validators.required],
    }) as CustomFormGroup<SpecialProjectDTO>;
  }
}
