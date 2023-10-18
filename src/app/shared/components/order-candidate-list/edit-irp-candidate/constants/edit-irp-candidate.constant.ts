import { X } from 'angular-feather/icons';
import { FieldSettingsModel } from '@syncfusion/ej2-angular-dropdowns';

import { FieldType } from '@core/enums';
import { CandidateField } from '@shared/components/order-candidate-list/edit-irp-candidate/interfaces';
import { CandidatStatus } from '@shared/enums/applicant-status.enum';

export const Icon = {
  X,
};

export const OptionField: FieldSettingsModel = { text: 'text', value: 'value' };
export const CandidateTitle = 'Edit Employee';
export const StatusField = 'status';
export const CloseReasonField = 'reason';
export const RejectedReasonField = 'rejectedReason';
export const CancelReasonField = 'cancellationReasonId';
export const OfferedDates = ['offeredStartDate', 'offeredEndDate'];
export const DefaultConfigFieldsToShow: string[] = [
  'status',
  'actualStartDate',
  'actualEndDate',
  'availableStartDate',
  'isClosed',
  'reason',
  'closeDate',
];
export const OfferedConfigFieldsToShow: string[] = ['status','offeredStartDate', 'offeredEndDate'];
export const OnboardConfigFieldsToShow: string[] = [
  'status',
  'actualStartDate',
  'actualEndDate',
  'offeredStartDate',
  'offeredEndDate',
  'availableStartDate',
  'isClosed',
  'reason',
  'closeDate',
];
export const AcceptConfigFieldsToShow = ['status', 'actualStartDate', 'actualEndDate', 'offeredStartDate', 'offeredEndDate'];

export const SwitcherValue : string[] = [
  'All',
  'Benefits',
  'Non-Benefits'
]

export enum SwitcherValueEnum {
  All = 'All',
  Benefits = 'Benefits',
  NonBenefits = 'Non-Benefits'
}

export const RejectedConfigFieldsToShow: string[] = ['availableStartDate','actualEndDate','actualStartDate','offeredStartDate', 'offeredEndDate'];

export const OfferedStatusFlow = [
  CandidatStatus.Offered,
  CandidatStatus.Offboard,
  CandidatStatus.Cancelled,
];

export const CandidateDialogConfig = (): ReadonlyArray<CandidateField> => [
  {
    field: 'status',
    title: 'Select Status',
    disabled: false,
    required: true,
    type: FieldType.Dropdown,
    showField: true,
    cssClass: 'status',
    dataSource: [],
  },
  {
    field: 'offeredStartDate',
    title: 'Offered Start Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    showField: false,
    cssClass: 'date-field',
  },
  {
    field: 'offeredEndDate',
    title: 'Offered End Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    showField: false,
    cssClass: 'date-field',
  },
  {
    field: 'actualStartDate',
    title: 'Actual Start Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    showField: true,
    cssClass: 'date-field',
  },
  {
    field: 'actualEndDate',
    title: 'Actual End Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    showField: true,
    cssClass: 'date-field',
  },
  {
    field: 'cancellationReasonId',
    title: 'Reason',
    disabled: false,
    required: true,
    type: FieldType.Dropdown,
    showField: false,
    cssClass: 'reason',
  },
  {
    field: 'rejectedReason',
    title: 'Rejection Reason',
    disabled: false,
    required: true,
    type: FieldType.Dropdown,
    showField: false,
    cssClass: 'reject-reason',
  },
  {
    field: 'isClosed',
    title: 'Close Position',
    disabled: false,
    required: false,
    type: FieldType.Toggle,
    showField: true,
    cssClass: 'close-switch',
  },
  {
    field: 'reason',
    title: 'Reason',
    disabled: false,
    required: true,
    type: FieldType.Dropdown,
    showField: true,
    cssClass: 'reason',
    dataSource: [],
  },
  {
    field: 'closeDate',
    title: 'Closing Date',
    disabled: false,
    required: true,
    type: FieldType.Date,
    showField: true,
    cssClass: 'close-date',
  },
  {
    field: 'availableStartDate',
    title: 'Available Start Date',
    disabled: false,
    required: false,
    type: FieldType.Date,
    showField: true,
    cssClass: 'date-field',
  },
];
