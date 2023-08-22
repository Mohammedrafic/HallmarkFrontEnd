import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ContactDetails, Organization } from '@shared/models/organization.model';
import { ALPHANUMERIC, ONLY_LETTERS } from '@shared/constants';
import { BusinessUnitType } from '@shared/enums/business-unit-type';
import { User } from '@shared/models/user-managment-page.model';

@Injectable()
export class AddEditOrganizationService {
  constructor(private fb: FormBuilder) {
  }

  createPreferencesForm(organization?: Organization): FormGroup {
    return this.fb.group({
      id: new FormControl(organization?.preferences.id || 0),
      weekStartsOn: new FormControl(isNaN(organization?.preferences.weekStartsOn as number)
      ? '' : organization?.preferences.weekStartsOn , [Validators.required]),
      paymentOptions: new FormControl(organization?.preferences.paymentOptions.toString() || '0', [
        Validators.required,
      ]),
      paymentDescription: new FormControl(organization?.preferences.paymentDescription || '', [
        Validators.required,
      ]),
      isIRPEnabled: new FormControl(!!organization?.preferences.isIRPEnabled),
      isVMCEnabled: new FormControl(!!organization?.preferences.isVMCEnabled),
      shouldUpdateIRPInHierarchy: new FormControl(!!organization?.preferences.shouldUpdateIRPInHierarchy),
    });
  }

  createBillingDetailForm(organization?: Organization): FormGroup {
    return this.fb.group({
      id: new FormControl(organization ? organization.billingDetails.id : 0),
      name: new FormControl(organization ? organization.billingDetails.name : '', [Validators.required]),
      address: new FormControl(organization ? organization.billingDetails.address : ''),
      country: new FormControl(organization ? organization.billingDetails.country : 0, [Validators.required]),
      state: new FormControl(organization ? organization.billingDetails.state : '', [Validators.required]),
      city: new FormControl(organization ? organization.billingDetails.city : '', [Validators.required]),
      zipCode: new FormControl(organization ? organization.billingDetails.zipCode : '', [
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone1: new FormControl(organization ? organization.billingDetails.phone1 : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone2: new FormControl(organization ? organization.billingDetails.phone2 : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      fax: new FormControl(organization ? organization.billingDetails.fax : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      ext: new FormControl(organization ? organization.billingDetails.ext : ''),
    });
  }

  createGeneralInfoGroup(organization?: Organization, user?: User | null): FormGroup {
    return this.fb.group({
      id: new FormControl(organization ? organization.generalInformation.id : 0),
      name: new FormControl(organization ? organization.generalInformation.name : '', [Validators.required]),
      organizationType: new FormControl(organization ? organization.generalInformation.organizationType : ''),
      externalId: new FormControl(organization ? organization.generalInformation.externalId : ''),
      taxId: new FormControl(organization ? organization.generalInformation.taxId : '', [
        Validators.required,
        Validators.minLength(9),
        Validators.pattern(ALPHANUMERIC),
      ]),
      organizationPrefix: new FormControl(
        {
          value: organization ? organization.generalInformation.organizationPrefix : '',
          disabled: user?.businessUnitType === BusinessUnitType.Organization || organization?.isOrganizationUsed,
        },
        [Validators.required, Validators.maxLength(3), Validators.minLength(3), Validators.pattern(ONLY_LETTERS)]
      ),
      addressLine1: new FormControl(organization ? organization.generalInformation.addressLine1 : '', [
        Validators.required,
      ]),
      addressLine2: new FormControl(organization ? organization.generalInformation.addressLine2 : ''),
      country: new FormControl(organization ? organization.generalInformation.country : 0, [Validators.required]),
      state: new FormControl(organization ? organization.generalInformation.state : '', [Validators.required]),
      city: new FormControl(organization ? organization.generalInformation.city : '', [Validators.required]),
      zipCode: new FormControl(organization ? organization.generalInformation.zipCode : '', [
        Validators.minLength(5),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone1Ext: new FormControl(organization ? organization.generalInformation.phone1Ext : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      phone2Ext: new FormControl(organization ? organization.generalInformation.phone2Ext : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      fax: new FormControl(organization ? organization.generalInformation.fax : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      status: new FormControl(organization ? organization.generalInformation.status : 0, [Validators.required]),
      website: new FormControl(organization ? organization.generalInformation.website : ''),
    });
  }

  createContactForm(contact?: ContactDetails): FormGroup {
    return this.fb.group({
      id: new FormControl(contact ? contact.id : 0),
      title: new FormControl(contact ? contact.title : ''),
      contactPerson: new FormControl(contact ? contact.contactPerson : '', [
        Validators.required,
        Validators.maxLength(100),
      ]),
      phoneNumberExt: new FormControl(contact ? contact.phoneNumberExt : '', [
        Validators.minLength(10),
        Validators.pattern(/^[0-9]+$/),
      ]),
      email: new FormControl(contact ? contact.email : '', [
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
