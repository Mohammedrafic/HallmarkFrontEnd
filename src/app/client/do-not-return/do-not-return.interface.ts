import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { AgencyStatus } from "@shared/enums/status";
import { DonoreturnAddedit, DoNotReturnSearchCandidate, DoNotReturnsPage, GetLocationByOrganization } from "@shared/models/donotreturn.model";
import { UserAgencyOrganizationBusinessUnit } from "@shared/models/user-agency-organization.model";

export interface DoNotReturnForm {
  id?: number;
  businessUnitId:number;
  locations:string;
  locationIds:number[];
  candidateProfileId: number;
  dnrComment: string;
  dnrRequestedBy: string;
  dnrStatus: string;
  ssn:number;
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
    candidatename?:String;
    ssn?:number;
  }
  
export interface MasterDoNotReturnExportColumn {
  text: string;
  column: string;
}