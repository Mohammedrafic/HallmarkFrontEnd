import { SubmitButton } from '@client/order-management/enums';
import { ButtonModel } from '@shared/models/buttons-group.model';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import { JobClassification } from '@shared/enums/job-classification';
import { Plus } from 'angular-feather/icons';
import { IrpOrderType } from '@shared/enums/order-type';

export const GridIcons = {
  Plus,
};
export const OptionFields: FieldSettingsModel = { text: 'name', value: 'id' };
export const SubmitForLater = { id: SubmitButton.SaveForLater, text: 'Save For Later' };
export const SaveForLate = { id: SubmitButton.Save, text: 'Save' };
export const SubmitAsTemplate = { id: SubmitButton.SaveAsTemplate, text: 'Save as Template' };
export const JobClassifications = [
  { id: JobClassification.Alumni, name: 'Alumni' },
  { id: JobClassification.International, name: 'International' },
  { id: JobClassification.Interns, name: 'Interns' },
  { id: JobClassification.Locums, name: 'Locums' },
  { id: JobClassification.Students, name: 'Students' },
  { id: JobClassification.Volunteers, name: 'Volunteers' },
];
export const OrderSystemConfig: ButtonModel[] = [
  {
    id: 0,
    title: 'IRP',
    active: true,
  },
  {
    id: 1,
    title: 'VMS',
    active: false,
  },
];
export const OrderDetailsValidationMessage = {
  title: 'Error',
  content: 'Please fill in the required fields in Order Details tab:\n',
  position: { X: 'Center', Y: 'Top' },
  cssClass: 'error-toast',
};
