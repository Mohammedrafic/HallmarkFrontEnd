import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactDetails, Organization } from '@shared/models/organization.model';
import { ALPHANUMERIC, ONLY_LETTERS } from '@shared/constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { User } from '@shared/models/user-managment-page.model';
import { MSP } from '../store/model/msp.model';

@Injectable()
export class AddEditMSPService {
  constructor(private fb: FormBuilder) {
  }


  createBillingDetailForm(organization?: MSP): FormGroup {
    return this.fb.group({
      id: new FormControl(organization ? organization?.mspBillingDetails?.id : 0),
      name: new FormControl(organization ? organization?.mspBillingDetails?.name : '', [Validators.required]),
      address: new FormControl(organization ? organization?.mspBillingDetails?.address : ''),
      country: new FormControl(organization ? organization?.mspBillingDetails?.country : 0, [Validators.required]),
      state: new FormControl(organization ? organization?.mspBillingDetails?.state : '', [Validators.required]),
      city: new FormControl(organization ? organization?.mspBillingDetails?.city : '', [Validators.required]),
      zipCode: new FormControl(organization ? organization?.mspBillingDetails?.zipCode : '', [
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone1: new FormControl(organization ? organization.mspBillingDetails?.phone1 : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone2: new FormControl(organization ? organization.mspBillingDetails?.phone2 : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      fax: new FormControl(organization ? organization.mspBillingDetails?.fax : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      ext: new FormControl(organization ? organization.mspBillingDetails?.ext : ''),
    });
  }

  createGeneralInfoGroup(organization?: MSP, user?: User | null): FormGroup {
    return this.fb.group({
      id: new FormControl(organization ? organization.mspDetails?.id : 0),
      name: new FormControl(organization ? organization.mspDetails?.name : '', [Validators.required]),
      externalId: new FormControl(organization ? organization.mspDetails?.externalId : ''),
      taxId: new FormControl(organization ? organization.mspDetails?.taxId : '', [
        Validators.required,
        Validators.minLength(9),
        Validators.pattern(ALPHANUMERIC),
      ]),
  
      addressLine1: new FormControl(organization ? organization.mspDetails?.addressLine1 : '', [
        Validators.required,
      ]),
      addressLine2: new FormControl(organization ? organization.mspDetails?.addressLine2 : ''),
      country: new FormControl(organization ? organization.mspDetails?.country : 0, [Validators.required]),
      state: new FormControl(organization ? organization.mspDetails?.state : '', [Validators.required]),
      city: new FormControl(organization ? organization.mspDetails?.city : '', [Validators.required]),
      zipCode: new FormControl(organization ? organization.mspDetails?.zipCode : '', [
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone1Ext: new FormControl(organization ? organization.mspDetails?.phone1Ext : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone2Ext: new FormControl(organization ? organization.mspDetails?.phone2Ext : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      fax: new FormControl(organization ? organization.mspDetails?.fax : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      status: new FormControl(organization ? organization.mspDetails?.status : 0, [Validators.required]),
      website: new FormControl(organization ? organization.mspDetails?.website : ''),
    });
  }

  createContactForm(contact?: ContactDetails): FormGroup {
    return this.fb.group({
      id: new FormControl(contact ? contact?.id : 0),
      title: new FormControl(contact ? contact?.title : ''),
      contactPerson: new FormControl(contact ? contact?.contactPerson : '', [
        Validators.required,
        Validators.maxLength(100),
      ]),
      phoneNumberExt: new FormControl(contact ? contact?.phoneNumberExt : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      email: new FormControl(contact ? contact?.email : '', [
        Validators.email,
        Validators.maxLength(100),
        Validators.pattern(/^\S+@\S+\.\S+$/),
      ]),
    });
  }

  populateBillingForm(billingForm: FormGroup, providedForm: FormGroup): void {
    const { id } = billingForm.getRawValue();
    const { name, addressLine1, country, state, city, zipCode, phone1Ext, phone2Ext, fax } = providedForm.getRawValue();

    billingForm.setValue({
      id,
      name,
      address: addressLine1,
      country,
      state,
      city,
      zipCode,
      phone1: phone1Ext,
      phone2: phone2Ext,
      fax,
      ext: '',
    });
  }
}
