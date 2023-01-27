import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { SelectionSettingsModel } from '@syncfusion/ej2-grids/src/grid/base/grid-model';

export const AllowedCredentialFileExtensions: string = '.pdf, .jpg, .jpeg, .png';

export const DisableEditMessage = 'Credential in this status cannot be edited';

export const CredentialSelectionSettingsModel: SelectionSettingsModel = {
  type: 'Multiple',
  mode: 'Row',
  persistSelection: true,
};

export const StatusFieldSettingsModel: FieldSettingsModel = {
  text: 'text',
  value: 'id',
}
