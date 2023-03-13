import { OrganizationRegion } from "./organization.model";
import { PageOfCollections } from "./page.model";
import { DateTimeHelper } from '@core/helpers';


export class DonoreturnFilters {
  candidatename?:string;
  ssn?: number;
  pageSize?: number;
  pageNumber?: number;
}

export class DoNotReturnsPage {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  items: Donotreturn[];
  pageNumber: number;
  totalCount: number;
  totalPages: number;
}
export class AllOrganization
{
id:number;
name:string;
}
export class GetLocationByOrganization
{
Id: number;
    OrganizationId: number;
    RegionId: number;
    ExternalId: string | null;
    InvoiceId: string | null;
    Name: string;
    Address1: string;
    Address2: string;
    City: string;
    State: string;
    Zip: string;
    ContactPerson: string | null;
    ContactEmail: string | null;
    PhoneNumber: string | null;
    PhoneType: number | null;
    Ext: string | null;
    GLNumber: string | null;
    /**Date starting from which Location deactivated */
    InactiveDate: Date | string | null;
    /**Date when Location can be active again */
    ReactivateDate: Date | string | null;
    /**Indicates if Location is currently deactivated */
    IsDeactivated:boolean
    LocationTypeId: number | null;
    TimeZone: string | null;
    BusinessLineId: number | null;
    BusinessLine: string | null;
    IncludeInIRP: boolean;
    IncludeInIRPText?:string
}



export class DonoreturnAddedit {
  id?: number;
  businessUnitId:number;
  locationId:string;
  regionId:string;
  regionLocationMappings: { [id: number]: number[]; } | null;
  candidateProfileId:number;
  dnrRequestedBy: string;
  dnrStatus: string;
  ssn:number;
  dnrComment:string;
  status:string;
  candidateEmail?:string;


  constructor(donotreturn: DonoreturnAddedit) {
    this.id = donotreturn.id||0;
    this.businessUnitId = donotreturn.businessUnitId;
    this.locationId=donotreturn.locationId;
    this.regionId=donotreturn.regionId;
    this.candidateProfileId=donotreturn.candidateProfileId;
    this.dnrStatus=donotreturn.dnrStatus;    
    this.regionLocationMappings=donotreturn.regionLocationMappings
    this.ssn=donotreturn.ssn;
    this.dnrComment=donotreturn.dnrComment;
    this.dnrRequestedBy=donotreturn.dnrRequestedBy;
    this.status=donotreturn.status;
    this.candidateEmail=donotreturn.candidateEmail||""
      }
}

export class Donoreturnedit {
  id?: number;
  businessUnitId:number;
  locations:string;
  candidateProfileId:number;
  dnrRequestedBy: string;
  dnrstatus: string;
  ssn:number;
  dnrComment:string;


  constructor(donotreturn: Donoreturnedit) {
    this.id = donotreturn.id||0;
    this.businessUnitId = donotreturn.businessUnitId;
    this.locations=donotreturn.locations;
    this.candidateProfileId=donotreturn.candidateProfileId;
    this.dnrstatus=donotreturn.dnrstatus;
    this.ssn=donotreturn.ssn;
    this.dnrComment=donotreturn.dnrComment;
    this.dnrRequestedBy=donotreturn.dnrRequestedBy;
    this.dnrstatus=donotreturn.dnrstatus;
      }
}

export class ExportDonoreturn {
  id?: number;
  businessUnitId?:number;
  firstname:string;
  lastname:string;
  dnrstatus: string;
  dnrdate:DateTimeHelper;
  ssn:number;
  dnrComment:string;
  email:string;

  constructor(donotreturn: ExportDonoreturn) {
    this.id = donotreturn.id||0;
    this.businessUnitId = donotreturn.businessUnitId || 0;
    this.firstname=donotreturn.firstname;
    this.lastname=donotreturn.lastname;
    this.dnrdate=donotreturn.dnrdate
    this.dnrstatus=donotreturn.dnrstatus;
    this.ssn=donotreturn.ssn;
    this.dnrComment=donotreturn.dnrComment;
    this.email=donotreturn.email;
      }
}


export class Donotreturn {
  id: number;
  businessUnitId?: number;
  locationsid?: string;
  regionsid?:string;
  regionname?:string
  locationname?:string
  candidateProfileId?: number;
  dnrStatus?: string;
  dnrDate?: DateTimeHelper;
  dnrComment?: string;
  dnrRequestedBy?: string;
  isDeleted?: boolean;
  ssn?: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  

  constructor(donotreturn: Donotreturn) {
    this.id = donotreturn.id||0;
    this.businessUnitId = donotreturn.businessUnitId;
    this.regionsid=donotreturn.regionsid;
    this.regionname=donotreturn.regionname;
    this.locationsid=donotreturn.locationsid;
    this.locationname=donotreturn.locationname;
    this.candidateProfileId=donotreturn.candidateProfileId;
    this.dnrStatus=donotreturn.dnrStatus;
    this.dnrDate=donotreturn.dnrDate;
    this.dnrComment=donotreturn.dnrComment;
    this.dnrRequestedBy=donotreturn.dnrRequestedBy;
    this.isDeleted=donotreturn.isDeleted;
    this.ssn=donotreturn.ssn;
    this.firstName=donotreturn.firstName;
    this.middleName=donotreturn.middleName;
    this.lastName=donotreturn.lastName;
    this.email=donotreturn.email;
  }

}
export class DoNotReturnCandidateSearchFilter{
  searchText:string;
  businessUnitId?:number;
}
export class DoNotReturnCandidateListSearchFilter{
  candidateProfileId:number;
}

export class DonoreturnFilter  {
  candidatename?: string;
  ssn?: number;
  pageSize?: number;
  pageNumber?: number;
};

export class DoNotReturnSearchCandidate{
  id:number;
  firstName:string;
  middleName:string|null;
  lastName:string;
  fullName:string;
}

