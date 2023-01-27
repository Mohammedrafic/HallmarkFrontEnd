import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import {
  GeneralInformationDTO,
  JobDescriptionDTO,
  JobDistributionDTO,
  OrderTypeDTO, SpecialProjectDTO,
} from '@client/order-management/components/order-details-form/interfaces';
import { NUMBER_AND_ONE_DECIMAL,ONLY_NUMBER, ONLY_NUMBER_AND_DOT } from '@shared/constants';
import { greaterThanValidator } from '@shared/validators/greater-than.validator';
import { OrderContactDetails, OrderWorkLocation } from '@shared/models/order-management.model';
import { ValidatorsListForNumberWithDots } from '@client/order-management/components/order-details-form/constants';

@Injectable()
export class OrderDetailsService {
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

  public createOrderTypeForm(): CustomFormGroup<OrderTypeDTO> {
    return this.formBuilder.group({
      orderType: [null, Validators.required],
    }) as CustomFormGroup<OrderTypeDTO>;
  }

  public createGeneralInformationForm(): CustomFormGroup<GeneralInformationDTO> {
    return this.formBuilder.group({
        title: [null, [Validators.required, Validators.maxLength(50)]],
        regionId: [null, Validators.required],
        locationId: [null, Validators.required],
        departmentId: [null, Validators.required],
        skillId: [null, Validators.required],
        hourlyRate: [null, [Validators.required, Validators.maxLength(10), Validators.pattern(ONLY_NUMBER_AND_DOT)]],
        openPositions: [null, [Validators.required, Validators.maxLength(10), Validators.pattern(ONLY_NUMBER)]],
        minYrsRequired: [null, [Validators.maxLength(10), Validators.pattern(NUMBER_AND_ONE_DECIMAL)]],
        joiningBonus: [null, [Validators.maxLength(10), Validators.pattern(ONLY_NUMBER_AND_DOT)]],
        compBonus: [null, [Validators.maxLength(10), Validators.pattern(ONLY_NUMBER_AND_DOT)]],
        duration: [null, Validators.required],
        jobStartDate: [null, Validators.required],
        jobEndDate: [null, Validators.required],
        shift: [null, Validators.required],
        shiftStartTime: [null, Validators.required],
        shiftEndTime: [null, Validators.required],
      },
      { validators: greaterThanValidator('annualSalaryRangeFrom', 'annualSalaryRangeTo') }
    ) as CustomFormGroup<GeneralInformationDTO>;
  }

  public createJobDescriptionFrom(): CustomFormGroup<JobDescriptionDTO> {
    return this.formBuilder.group({
      classifications: [null],
      onCallRequired: [false],
      asapStart: [false],
      criticalOrder: [false],
      jobDescription: ['', Validators.maxLength(4000)],
      unitDescription: ['', Validators.maxLength(500)],
      orderRequisitionReasonId: [null, Validators.required],
      orderRequisitionReasonName: [null],
    }) as CustomFormGroup<JobDescriptionDTO>;
  }

  public createSpecialProjectFrom(isFieldsRequired: boolean): CustomFormGroup<SpecialProjectDTO> {
    return this.formBuilder.group({
      projectTypeId: [null, isFieldsRequired ? Validators.required : ''],
      projectNameId: [null, isFieldsRequired ? Validators.required : ''],
      poNumberId: [null, isFieldsRequired ? Validators.required : ''],
    }) as CustomFormGroup<SpecialProjectDTO>;
  }

  public createContactDetailsForm(
    orderContactDetails?: OrderContactDetails,
    formLength?: number
  ): FormGroup {
    return this.formBuilder.group({
      id: [orderContactDetails?.id || 0],
      name: [orderContactDetails?.name || '', [Validators.required, Validators.maxLength(50)]],
      title: [orderContactDetails?.title || '', Validators.required],
      email: [orderContactDetails?.email || '', [Validators.required, Validators.email]],
      mobilePhone: [orderContactDetails?.mobilePhone || '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]],
      isPrimaryContact: [orderContactDetails ? orderContactDetails.isPrimaryContact : !formLength],
    });
  }

  public createLocationFrom(orderWorkLocation?: OrderWorkLocation): FormGroup {
    return this.formBuilder.group({
      id: new FormControl(orderWorkLocation?.id || 0),
      address: new FormControl(orderWorkLocation?.address || '', [Validators.required, Validators.maxLength(100)]),
      state: new FormControl(orderWorkLocation?.state || '', [Validators.required, Validators.maxLength(100)]),
      city: new FormControl(orderWorkLocation?.city || '', [Validators.required, Validators.maxLength(20)]),
      zipCode: new FormControl(orderWorkLocation?.zipCode || '', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]),
    });
  }

  public createFormArrays(controlName: string, controls: FormGroup): FormGroup {
    return this.formBuilder.group({
      [controlName]: new FormArray([controls]),
    });
  }

  public createPermPlacementControls(): FormControl {
    return this.formBuilder.control(null, [
      Validators.required,
      ...ValidatorsListForNumberWithDots,
    ]);
  }
}
