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
  firstName: { type: ControlTypes.Text, valueType: ValueType.Text },
  middleName: { type: ControlTypes.Text, valueType: ValueType.Text },
  lastName: { type: ControlTypes.Text, valueType: ValueType.Text },
  ssn: { type: ControlTypes.Text, valueType: ValueType.Text },
  regionBlocked: { type: ControlTypes.Multiselect, 
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id', },
  locationBlocked: { type: ControlTypes.Multiselect,  
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id', },
  email: { type: ControlTypes.Text, valueType: ValueType.Text },
  currentStatus: { type: ControlTypes.Text, valueType: ValueType.Text },
};

export const TITLE = 'Do Not Return';

export const WATERMARK = 'e.g. Andrew Fuller';



