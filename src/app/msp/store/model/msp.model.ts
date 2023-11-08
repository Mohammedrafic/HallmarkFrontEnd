import { PageOfCollections } from "@shared/models/page.model";
import { MspListDto } from "../../constant/msp.constant";
import { OrganizationStatus } from "@shared/enums/status";

export type MspListPage = PageOfCollections<MspListDto>;

export class MSP {
    mspDetails: GeneralInformation;
    mspBillingDetails: BillingDetails;
    mspContactDetails: ContactDetails[];
    isOrganizationUsed?: boolean;
    businessUnit:businessUnit;
    mspId?: number | null;
    constructor(
      mspDetails: GeneralInformation,
      mspBillingDetails: BillingDetails,
      mspContactDetails: ContactDetails[],
      isSameAsOrg: boolean,
      businessUnit:businessUnit,
      mspId:number,
    ) {
      if (mspId) {
        this.mspId = mspId;
      }
      this.mspDetails = mspDetails;
      if (this.mspDetails.externalId === '') {
        this.mspDetails.externalId = null;
      }
     
      this.businessUnit=businessUnit
      this.mspBillingDetails = mspBillingDetails;
      this.mspBillingDetails.organizationId = businessUnit?.id || 0;
      this.mspBillingDetails.sameAsMsp= isSameAsOrg;
      this.mspContactDetails = mspContactDetails;
    }
  }

  export class businessUnit{
    id: number;
    organizationPrefix: string;
    businessUnitType: number;
    isVMSEnabled: boolean;
    isIRPEnabled: boolean;
    name: string;
    agencyStatus: boolean;
    parentUnitId: number;
    dbConnectionName: string;
    netSuiteId: number
}
export class GeneralInformation {
    id?: number;
    organizationId?: number;
    externalId?: number | string | null;
    taxId: string;
    name: string;
    organizationType: string;
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
    status: OrganizationStatus;
    organizationPrefix: string;
  }
  
  export class BillingDetails {
    id?: number;
    organizationId: number;
    adminUserId: number;
    sameAsMsp: boolean;
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
    id?: number;
    organizationId?: number;
    title: string;
    contactPerson: string;
    email: string;
    phoneNumberExt: string;
  }

export type MSPAssociateOrganizationsAgency = {
  id?: number;
  organizationPrefix: string;
  businessUnitType: number;
  isVMSEnabled: boolean;
  isIRPEnabled: boolean;
  name: string;
  agencyStatus?: string;
  parentUnitId: number;
  dbConnectionName: string;
  netSuiteId: string;
};

export type MSPAssociateOrganizationsAgencyPage = PageOfCollections<MSPAssociateOrganizationsAgency>;
