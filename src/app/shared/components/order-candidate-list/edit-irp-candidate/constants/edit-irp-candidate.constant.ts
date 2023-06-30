import { X } from 'angular-feather/icons';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { FieldType } from '@core/enums';
import { CandidateField } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';

export const Icon = {
  X,
};

export const OptionField: FieldSettingsModel = { text: 'text', value: 'value' };
export const CandidateTitle = 'Edit Employee';
export const StatusField = 'status';
export const CloseReasonField = 'reason';

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
  {
    field: 'isClosed',
    title: 'Close Position',
    disabled: false,
    required: false,
    type: FieldType.Toggle,
    cssClass: 'close-switch',
  },
  {
    field: 'reason',
    title: 'Reason',
    disabled: false,
    required: true,
    type: FieldType.Dropdown,
    cssClass: 'reason',
    dataSource: [],
  },
  {
    field: 'closeDate',
    title: 'Closing Date',
    disabled: false,
    required: true,
    type: FieldType.Date,
    cssClass: 'close-date',
  },
];
