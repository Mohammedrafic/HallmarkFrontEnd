import { X } from 'angular-feather/icons';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { FieldType } from '@core/enums';
import { CandidateField } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';

export const Icon = {
  X,
};

export const OptionField: FieldSettingsModel = { text: 'statusText', value: 'applicantStatus' };
export const CandidateTitle = 'Edit Candidate';
export const StatusField = 'status';

export const CandidateDialogConfig = (): ReadonlyArray<CandidateField> => [
  {
    field: 'status',
    title: 'Select Status',
    disabled: false,
    required: true,
    type: FieldType.Dropdown,
    cssClass: 'status',
    dataSource: [],
  },
  {
    field: 'actualStartDate',
    title: 'Actual Start Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    cssClass: 'date-field',
  },
  {
    field: 'actualEndDate',
    title: 'Actual End Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    cssClass: 'date-field',
  },
];
