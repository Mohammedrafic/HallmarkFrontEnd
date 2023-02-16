import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";

export interface DoNotReturnForm {
  id?: number;
  businessUnitId:number;
  locations:string;
  locationIds:number[];
  candidateProfileId: number;
  dnrComment: string;
  dnrRequestedBy: string;
  dnrstatus: string;
  ssn:number;
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