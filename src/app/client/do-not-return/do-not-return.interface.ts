import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
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

export interface donotreturnFilterConfigItem<T> {
    type: ControlTypes;
    valueType: ValueType;
    valueField?: string;
    valueId?: string;
    dataSource?: T,
}

export interface FilterConfig {
  firstNamePattern:donotreturnFilterConfigItem<string>;
  lastNamePattern?:donotreturnFilterConfigItem<string>;
  ssn?: donotreturnFilterConfigItem<number>;
  regionBlocked?:donotreturnFilterConfigItem<any>;
  locationBlocked?:donotreturnFilterConfigItem<any>;
  email?:donotreturnFilterConfigItem<string>;
  currentStatus?:donotreturnFilterConfigItem<string>;
}

export interface DoNotReturnFilterForm {
    businessUnitId?:number;
    ssn?:number;
    regionBlocked:number[];
    locationBlocked:number[];
    firstNamePattern:string;
    lastNamePattern:string;
    email:string;
    currentStatus: string;
  }

export interface MasterDoNotReturnExportColumn {
  text: string;
  column: string;
}
