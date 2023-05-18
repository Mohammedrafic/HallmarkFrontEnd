import { OrganizationRegion } from "./organization.model";
import { PageOfCollections } from "./page.model";
import { DateTimeHelper } from '@core/helpers';


export class DonoreturnFilters {
  businessUnitId?:     number;
  firstName?:          string;
  middleName?:         string;
  lastName?:           string;
  email?:              string;
  ssn?:                number | null;
  currentStatus?:      string;
  locationBlocked?:    string;
  regionBlocked?:      string;
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
    isExternal:boolean;
    businessUnitId:number;
    locationId:string;
    regionId:string;
    regionLocationMappings: { [id: number]: number[]; } | null;
    email: string;
    candidateProfileId: number | null;
    comment: string;
    firstName: string;
    middleName:string;
    lastName:string;
    status: string;
    dob:Date | null;
    ssn:number | null;

  constructor(donotreturn: DonoreturnAddedit) {
      this.id = donotreturn.id||0;
      this.isExternal= donotreturn.isExternal;
      this.businessUnitId = donotreturn.businessUnitId;
      this.locationId=donotreturn.locationId;
      this.regionId=donotreturn.regionId;
      this.regionLocationMappings = donotreturn.regionLocationMappings;
      this.candidateProfileId=donotreturn.candidateProfileId;
      this.status=donotreturn.status;    
      this.ssn=donotreturn.ssn;
      this.comment=donotreturn.comment;
      this.firstName=donotreturn.firstName;
      this.middleName=donotreturn.middleName;
      this.lastName=donotreturn.lastName;
      this.dob=donotreturn.dob;
      this.email=donotreturn.email||""
    }
}

export class Donoreturnedit {
  id?: number;
  businessUnitId:number;
  locations:string;
  candidateProfileId:number | null;
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
    id:                 number;
    businessUnitId:     number;
    regionId:           string;
    locationId:         string;
    regionBlocked:         string;
    locationBlocked:       string;
    candidateProfileId: number;
    firstName:          string;
    middleName:         null;
    lastName:           string;
    fullName:           string;
    email:              string;
    ssn:                number;
    dob:                Date | null;
    currentStatus:      string;
    lastUpdatedDate:    string;
    lastBlockedDate:    string;
    lastUnBlockedDate:  string;
    comment:            string;
    isExternal:         boolean;
  

  constructor(donotreturn: Donotreturn) {
    this.id = donotreturn.id||0;
    this.businessUnitId = donotreturn.businessUnitId;
    this.regionId=donotreturn.regionId;
    this.regionBlocked=donotreturn.regionBlocked;
    this.locationId=donotreturn.locationId;
    this.locationBlocked=donotreturn.locationBlocked;
    this.candidateProfileId=donotreturn.candidateProfileId;
    this.currentStatus=donotreturn.currentStatus;
    this.lastUpdatedDate=donotreturn.lastUpdatedDate;
    this.comment=donotreturn.comment;
    this.lastBlockedDate=donotreturn.lastBlockedDate;
    this.lastUnBlockedDate=donotreturn.lastUnBlockedDate;
    this.ssn=donotreturn.ssn;
    this.dob=donotreturn.dob;
    this.firstName=donotreturn.firstName;
    this.middleName=donotreturn.middleName;
    this.lastName=donotreturn.lastName;
    this.fullName=donotreturn.fullName;
    this.email=donotreturn.email;
    this.isExternal=donotreturn.isExternal;
  }

}
export class DoNotReturnCandidateSearchFilter{
  searchText:string;
  businessUnitId?:number;
}
export class DoNotReturnCandidateListSearchFilter{
  candidateProfileId:number | null;
  businessUnitId?:number;
}

export class DonoreturnFilter  {
  businessUnitId?:     number;
  firstName?:          string;
  middleName?:         string;
  lastName?:           string;
  email?:              string;
  ssn?:                number | null;
  currentStatus?:      string;
  locationBlocked?:    string;
  regionBlocked?:      string;
  pageSize?: number;
  pageNumber?: number;
};

export class DoNotReturnSearchCandidate{
  id:number;
  firstName:string;
  middleName:string|null;
  lastName:string;
  fullName:string;
  email:string|null;
  ssn:string|null;
  dob: Date|null;
}

