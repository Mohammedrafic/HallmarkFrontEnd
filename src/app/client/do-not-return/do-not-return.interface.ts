import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { AgencyStatus } from "@shared/enums/status";
import { DonoreturnAddedit, DoNotReturnSearchCandidate, DoNotReturnsPage, GetLocationByOrganization } from "@shared/models/donotreturn.model";
import { UserAgencyOrganizationBusinessUnit } from "@shared/models/user-agency-organization.model";

export interface DoNotReturnForm {
    id?: number;
    isExternal:string;
    businessUnitId:number;
    regionIds:number[];
    locationIds:number[];
    candidateProfileId: number | null;
    dnrComment: string;
    dnrStatus: string;
    ssn:number | null;
    dob:Date | null;
    candidateEmail:string;
    firstName:string;
    middleName:string;
    lastName:string;
  }

  export interface DoNotReturnStateModel {
    donotreturnpage: DoNotReturnsPage | null
    donotloadings: boolean
    masterDoNotReturn: DonoreturnAddedit[];
    isLocationLoading: boolean;
    allOrganizations: UserAgencyOrganizationBusinessUnit[];
    locations: GetLocationByOrganization[];
    searchCandidates: DoNotReturnSearchCandidate[];
  }
  
  export interface IOrganizationAgency {
    id: number;
    name: string;
    type: 'Organization' | 'Agency';
    hasLogo?: boolean;
    lastUpdateTicks?: number;
    status?: AgencyStatus;
  }
  
export interface donotreturnFilterConfigItem<T> {
    type: ControlTypes;
    valueType: ValueType;
    valueField?: string;
    valueId?: string;
    dataSource?: T,
}

export interface FilterConfig {
  candidatename?:donotreturnFilterConfigItem<string>;
  ssn?: donotreturnFilterConfigItem<number>;
}

export interface DoNotReturnFilterForm {
    businessUnitId?:number;
    ssn?:number;
    regionBlocked:number[];
    locationBlocked:number[];
    firstName:string;
    middleName:string;
    lastName:string;
    email:string;
    currentStatus: string;
  }
  
export interface MasterDoNotReturnExportColumn {
  text: string;
  column: string;
}