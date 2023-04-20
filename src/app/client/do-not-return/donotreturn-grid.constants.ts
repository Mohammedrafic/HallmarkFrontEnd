import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { FilterConfig, MasterDoNotReturnExportColumn } from "./do-not-return.interface";

export const MasterDNRExportCols: MasterDoNotReturnExportColumn[] = [
  { text: 'first name', column: 'FirstName' },
  { text: 'middle name', column: 'MiddleName' },
  { text: 'last name', column: 'LastName' },
  {text: 'RegionName',column:'Region'},
  {text: 'LocationName',column:'Locations'},
  { text: 'email', column: 'EMAIL' },
  { text: 'ssn', column: 'SSN' },
  { text: 'dnrStatus', column: 'CurrentStatus' },
  { text: 'dnrDate', column: 'DateBlocked' },
  { text: 'dnrComment', column: 'ReasonForBlocking' },
];

export const doNotReturnFilterConfig: FilterConfig = {
  candidatename: { type: ControlTypes.Text, valueType: ValueType.Text },
  ssn: { type: ControlTypes.Text, valueType: ValueType.Text },
};

export const TITLE = 'Do Not Return';

export const WATERMARK = 'e.g. Andrew Fuller';



