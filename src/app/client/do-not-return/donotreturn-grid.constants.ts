import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { FilterConfig, MasterDoNotReturnExportColumn } from "./do-not-return.interface";

export const MasterDNRExportCols: MasterDoNotReturnExportColumn[] = [
  { text: 'first name', column: 'FirstName' },
  { text: 'middle name', column: 'MiddleName' },
  { text: 'last name', column: 'LastName' },
  {text: 'RegionName',column:'RegionBlocked'},
  {text: 'LocationName',column:'LocationBlocked'},
  { text: 'email', column: 'EMAIL' },
  { text: 'ssn', column: 'SSN' },
  { text: 'currentStatus', column: 'CurrentStatus' },
  { text: 'lastUpdatedDate', column: 'LastUpdatedDate' },
  { text: 'lastBlockedDate', column: 'LastBlockedDate' },
  { text: 'lastUnBlockedDate', column: 'LastUnBlockedDate' },
  { text: 'comment', column: 'Comment' },
];

export const doNotReturnFilterConfig: FilterConfig = {
  candidatename: { type: ControlTypes.Text, valueType: ValueType.Text },
  ssn: { type: ControlTypes.Text, valueType: ValueType.Text },
};

export const TITLE = 'Do Not Return';

export const WATERMARK = 'e.g. Andrew Fuller';



