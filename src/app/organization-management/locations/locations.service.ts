import { Injectable } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { CustomFormGroup } from '@core/interface';
import { LocationsForm } from './locations.interface';

@Injectable()
export class LocationsService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createForm(): CustomFormGroup<LocationsForm> {
    return this.fb.group({
      invoiceId: [null,Validators.required],
      externalId: [null, [Validators.maxLength(50)]],
      name: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      businessLineId: [null],
      address1: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      address2: [null, [Validators.maxLength(50)]],
      zip: [null, [Validators.required, Validators.minLength(5), Validators.maxLength(6), Validators.pattern('^[0-9]*$')]],
      city: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(20)]],
      state: [null, [Validators.required]],
      glNumber: [null, Validators.maxLength(50)],
      ext: [null, Validators.maxLength(50)],
      contactEmail: [null, [Validators.email]],
      contactPerson: [null, [Validators.minLength(1), Validators.maxLength(50)]],
      inactiveDate: [null],
      reactivateDate: [null],
      phoneNumber: [null, [Validators.minLength(10), Validators.maxLength(10), Validators.pattern('^[0-9]*$')]],
      phoneType: [null],
      timeZone: [null],
      locationType: [null],
      organizationId: 0,
      includeInIRP: [false],
    }) as CustomFormGroup<LocationsForm>;
  }

  createFilterForm(): FormGroup {
    return this.fb.group({
      externalIds: [[]],
      invoiceIds: [[]],
      names: [[]],
      addresses1: [[]],
      cities: [[]],
      states: [[]],
      zipCodes: [[]],
      contactPeople: [[]],
      includeInIRP: [[]],
    });
  }

  createRegionForm(): FormGroup {
    return this.fb.group({
      newRegionName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    });
  }
}
