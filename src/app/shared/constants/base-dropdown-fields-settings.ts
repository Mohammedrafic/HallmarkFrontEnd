import type { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

export const baseDropdownFieldsSettings: FieldSettingsModel = { text: 'name', value: 'id' };
export const baseDropdownAgencyFieldsSettings: FieldSettingsModel = { text: 'name', value: 'organizationId' };


export enum FieldNames {
  regionIds = 'regionIds',
  locationIds = 'locationIds',
  departmentIds = 'departmentIds',
}
  
export type FiledNamesSettings = { [K in FieldNames]: boolean; };
