import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ONLY_NUMBER } from '@shared/constants';
import { Duration } from '@shared/enums/durations';
import { IrpOrderType } from '@client/order-management/components/irp-tabs/order-details/order-details-irp.enum';

@Injectable()
export class OrderDetailsIrpService {
  constructor(private formBuilder: FormBuilder) {}

  public createOrderTypeForm(): FormGroup {
    return this.formBuilder.group({
      orderType: [IrpOrderType.LongTermAssignment, Validators.required],
    });
  }

  public createGeneralInformationForm(): FormGroup {
    return this.formBuilder.group({
      regionId: [null , Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      skillId: [null ,Validators.required],
      openPositions: [null, [Validators.required, Validators.maxLength(10), Validators.pattern(ONLY_NUMBER)]],
      duration: [Duration.ThirteenWeeks, Validators.required],
      jobStartDate: [null, Validators.required],
      jobEndDate: [null, Validators.required],
      shift: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
    });
  }

  public createGeneralInformationPOForm(): FormGroup {
    return this.formBuilder.group({
      regionId: [null , Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      skillId: [null ,Validators.required],
      openPositions: [null, [Validators.required, Validators.maxLength(10), Validators.pattern(ONLY_NUMBER)]],
      jobDates: [null, Validators.required],
      shift: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
    });
  }

  public createJobDistributionForm(): FormGroup {
    return this.formBuilder.group({
      jobDistribution: [null, Validators.required],
      agencyId: [null],
      hourlyRate: [null],
    });
  }

  public createJobDistributionPOForm(): FormGroup {
    return this.formBuilder.group({
      jobDistribution: [null, Validators.required],
      agencyId: [null],
      billRate: [null],
    });
  }

  public createJobDescriptionForm(): FormGroup {
    return this.formBuilder.group({
      orderRequisitionReasonId: [null, Validators.required],
      classifications: [null],
      onCallRequired: [false],
      asapStart: [false],
      criticalOrder: [false],
      weekend: [false],
      holiday: [false],
      jobDescription: ['', Validators.maxLength(4000)],
      unitDescription: ['', Validators.maxLength(500)],
    });
  }

  public createWorkLocationForm(): FormGroup {
    return this.formBuilder.group({
      id: [0],
      address: ['', [Validators.required, Validators.maxLength(100)]],
      state: ['', [Validators.required, Validators.maxLength(100)]],
      city: [ '', [Validators.required, Validators.maxLength(20)]],
      zipCode: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]],
    });
  }

  public createSpecialProject(): FormGroup {
    return this.formBuilder.group({
      projectTypeId: [null],
      projectNameId: [null],
      poNumberId: [null],
    });
  }

  public createContactDetailsForm(listLength?: number): FormGroup {
    return this.formBuilder.group({
      id: [0],
      name: ['', [Validators.required, Validators.maxLength(50)]],
      title: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      mobilePhone: ['', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]],
      isPrimaryContact: [!listLength ?? true],
    });
  }
}
