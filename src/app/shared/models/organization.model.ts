export class Organization {
  createUnder?: {
    id: number,
    businessUnitType: number,
    name: string,
    parentUnitId?: number
  };
  businessUnitId?: number;
  generalInformation: GeneralInformation;
  billingDetails: BillingDetails;
  contactDetails: ContactDetails[];
  preferences: Preferences;

  constructor(businessUnitId: number, generalInformation: GeneralInformation, billingDetails: BillingDetails, contactDetails: ContactDetails[], preferences: any) {
    this.businessUnitId = businessUnitId;
    this.generalInformation = generalInformation;
    this.generalInformation.organizationId = 0;
    if (this.generalInformation.externalId === '') {
      this.generalInformation.externalId = null;
    }
    this.billingDetails = billingDetails;
    this.billingDetails.organizationId = 0;
    this.contactDetails = contactDetails;
    this.contactDetails.forEach((contact: ContactDetails) => contact.organizationId = 0);
    this.preferences = preferences;
    if (this.preferences.timePeriodInMins === '') {
      this.preferences.timePeriodInMins = null;
    }
    this.preferences.organizationId = 0;
  }
}

export class GeneralInformation {
  organizationId?: number;
  externalId?: number | string | null;
  taxId: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  state: string;
  country: number;
  city: string;
  zipCode: string;
  phone1Ext: string;
  phone2Ext: string;
  fax: string;
  website: string;
  status: number;
}

export class BillingDetails {
  organizationId: number;
  adminUserId: number;
  sameAsOrganization: boolean;
  name: string;
  address: string;
  country: number;
  state: string;
  city: string;
  zipCode: string;
  phone1: string;
  phone2: string;
  ext: string;
  fax: string;
}

export class ContactDetails {
  organizationId?: number;
  title: string;
  contactPerson: string;
  email: string;
  phoneNumberExt: string;
}

export class Preferences {
  organizationId?: number;
  paymentOptions: number;
  paymentDescription: string;
  timesheetSubmittedBy: number;
  weekStartsOn: number;
  considerLunch: boolean;
  purchaseOrderBy: number;
  timePeriodInMins: number | string | null;
}
