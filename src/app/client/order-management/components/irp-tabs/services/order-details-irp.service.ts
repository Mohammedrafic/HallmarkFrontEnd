import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ONLY_NUMBER } from '@shared/constants';
import { Duration } from '@shared/enums/durations';
import { jobDistributionValidator } from '@client/order-management/components/irp-tabs/order-details/validators';
import { IrpOrderType, OrderType } from '@shared/enums/order-type';
import { Order } from '@shared/models/order-management.model';
import { EditablePerDiemFields } from '@client/order-management/components/irp-tabs/order-details/constants';

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
      openPositions: [null, [Validators.required, Validators.min(1), Validators.max(9999999999), Validators.min(1),
        Validators.pattern(ONLY_NUMBER)]],
      duration: [Duration.ThirteenWeeks, Validators.required],
      jobStartDate: [null, Validators.required],
      jobEndDate: [null, Validators.required],
      shift: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
      linkedId: [null],
    });
  }

  public createGeneralInformationPOForm(): FormGroup {
    return this.formBuilder.group({
      regionId: [null , Validators.required],
      locationId: [null, Validators.required],
      departmentId: [null, Validators.required],
      skillId: [null ,Validators.required],
      openPositions: [null, [Validators.required, Validators.min(1), Validators.maxLength(10),
        Validators.pattern(ONLY_NUMBER)]],
      jobDates: [null, Validators.required],
      shift: [null, Validators.required],
      shiftStartTime: [null, Validators.required],
      shiftEndTime: [null, Validators.required],
      linkedId: [null],
    });
  }

  public createJobDistributionForm(): FormGroup {
    return this.formBuilder.group({
      jobDistribution: [null, Validators.required],
      agencyId: [null],
      hourlyRate: [null],
    },{
      validators: jobDistributionValidator('jobDistribution'),
    });
  }

  public createJobDistributionPOForm(): FormGroup {
    return this.formBuilder.group({
      jobDistribution: [null, Validators.required ],
      agencyId: [null],
      billRate: [null],
    }, {
        validators: jobDistributionValidator('jobDistribution'),
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
        Validators.maxLength(6),
      ]],
    });
  }

  public createJobDescriptionPOForm(): FormGroup {
    return this.formBuilder.group({
      orderRequisitionReasonId: [null, Validators.required],
      classifications: [null],
      onCallRequired: [false],
      asapStart: [false],
      criticalOrder: [false],
      weekend: [false],
      holiday: [false],
      contract: [false],
      jobDescription: ['', Validators.maxLength(4000)],
      unitDescription: ['', Validators.maxLength(500)],
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

  public hasEditablePerDiemOrder(selectedOrder: Order): boolean | undefined {
    return selectedOrder?.isIrpPerDiemOrderEditable && selectedOrder?.orderType === OrderType.ReOrder;
  }

  public disableFieldsForNotEditableOrder(selectedOrder: Order, form: FormGroup): void {
    const isPerDiemOrderEditable = this.hasEditablePerDiemOrder(selectedOrder);

    if(isPerDiemOrderEditable && form) {
      EditablePerDiemFields.forEach((field: string) => {
        form.controls[field].disable();
      });
    }
  }
}
