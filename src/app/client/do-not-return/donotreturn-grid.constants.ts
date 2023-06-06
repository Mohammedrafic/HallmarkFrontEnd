import { ControlTypes, ValueType } from "@shared/enums/control-types.enum";
import { FilterConfig, MasterDoNotReturnExportColumn } from "./do-not-return.interface";

export const MasterDNRExportCols: MasterDoNotReturnExportColumn[] = [
  { text: 'First Name', column: 'FirstName' },
  { text: 'Middle Name', column: 'MiddleName' },
  { text: 'Last Name', column: 'LastName' },
  { text: 'Region Blocked', column: 'RegionBlocked' },
  { text: 'Location Blocked', column: 'LocationBlocked' },
  { text: 'Email', column: 'EMAIL' },
  { text: 'SSN', column: 'SSN' },
  { text: 'Current Status', column: 'CurrentStatus' },
  { text: 'Last Updated Date', column: 'LastUpdatedDate' },
  { text: 'Last Blocked Date', column: 'LastBlockedDate' },
  { text: 'Last Unblocked Date', column: 'LastUnBlockedDate' },
  { text: 'Comment', column: 'Comment' },
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



