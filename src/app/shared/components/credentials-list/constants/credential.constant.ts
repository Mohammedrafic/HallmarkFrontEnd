import { Edit, Trash2 } from 'angular-feather/icons';

import { SortSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { ExportColumn } from '@shared/models/export.model';
import { CredentialFilter } from '@shared/models/credential.model';
import { GRID_CONFIG } from '@shared/constants';
import { ControlTypes, ValueType } from '@shared/enums/control-types.enum';
import { FilterColumnsModel } from '@shared/models/filter.model';

export const Icons = {
  Edit,
  Trash2,
};
export const DialogHeight = '436px';
export const CredentialTypeId = 'credentialTypeId';
export const IrpCommentField = 'irpComment';
export const OptionFields: FieldSettingsModel = { text: 'name', value: 'id' };
export const ErrorMessageForSystem = 'Please select system for Credential';
export const SelectedSystems = {
  isIRP: false,
  isVMS: true,
};
export const DefaultFilters: CredentialFilter = {
  pageSize: GRID_CONFIG.initialRowsPerPage,
  pageNumber: GRID_CONFIG.initialPage,
};

export const ExportColumns: ExportColumn[] = [
  { text:'Credential Type', column: 'CredentialType'},
  { text:'Credential', column: 'Credential'},
  { text:'Expire Date Applicable', column: 'ExpireDateApplicable'},
  { text:'Comment', column: 'Comment'},
];
export const ExportIRPColumns = [
  { text:'System', column: 'System'},
  { text:'IRP Comment', column: 'irpComment'},
];

export const SortSettings: SortSettingsModel = {
  columns: [
    { field: 'credentialTypeName', direction: 'Ascending' }
  ]
};

export const FiltersColumns: FilterColumnsModel = {
  credentialIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id' ,
  },
  credentialTypeIds: {
    type: ControlTypes.Multiselect,
    valueType: ValueType.Id,
    dataSource: [],
    valueField: 'name',
    valueId: 'id',
  },
  expireDateApplicable: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'Expiry Date Applicable',
  },
  isPublic: {
    type: ControlTypes.Checkbox,
    valueType: ValueType.Text,
    checkBoxTitle: 'Is Public',
  },
};
export const FilterColumnsIncludeIRP: FilterColumnsModel = {
  includeInIRP: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'IRP'},
  includeInVMS: { type: ControlTypes.Checkbox, valueType: ValueType.Text, checkBoxTitle: 'VMS'},
};

