import { OrganizationRegion } from "./organization.model";
import { PageOfCollections } from "./page.model";
import { DateTimeHelper } from '@core/helpers';


export class DonoreturnFilters {
  // firstname?: string;
  // lastname?: string;
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
id:number;
name:string;
}
export class DonoreturnAddedit {
  id?: number;
  businessUnitId:number;
  locations:string;
  candidateProfileId:number;
  dnrRequestedBy: string;
  dnrstatus: string;
  // lastname: string;
  ssn:number;
  dnrComment:string;
  status:string;

  constructor(donotreturn: DonoreturnAddedit) {
    this.id = donotreturn.id||0;
    this.businessUnitId = donotreturn.businessUnitId;
    this.locations=donotreturn.locations;
    this.candidateProfileId=donotreturn.candidateProfileId;
    this.dnrstatus=donotreturn.dnrstatus;
    // this.lastname=donotreturn.lastname;
    this.ssn=donotreturn.ssn;
    this.dnrComment=donotreturn.dnrComment;
    this.dnrRequestedBy=donotreturn.dnrRequestedBy;
    this.status=donotreturn.status;
      }
}

// public int Id { get; set; }
// public int? BusinessUnitId { get; set; }
// public string Locations { get; set; }
// public int CandidateProfileId { get; set; }
// public string DNRComment { get; set; }
// public string DNRRequestedBy { get; set; }
// public int? SSN { get; set; }

 //export type DonotReturnsPage = PageOfCollections<Donotreturn>;

export class Donotreturn {
  id: number;
  businessUnitId?: number;
  locations?: string;
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

export class DoNotReturnSearchCandidate{
  id:number;
  firstName:string;
  middleName:string|null;
  lastName:string;
  fullName:string;
}
// export interface DoNotReturn {
//     Id: number;
//     BusinessUnitId: number | null;
//     BusinessUnit: BusinessUnit | null;
//     Locations: string;

//     CandidateProfileId: number;

//     DNRStatus: string;

//     DNRDate: Date | string;

//     DNRComment: string;

//     DNRRequestedBy: string;

//     IsDeleted: boolean;
   
// }
