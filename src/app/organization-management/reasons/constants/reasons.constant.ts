import { ColDef } from '@ag-grid-community/core';

import { FieldType } from '@core/enums';
import * as ReasonActions from '@organization-management/store/reject-reason.actions';
import { ToggleIconRendererComponent } from '@shared/components/cell-renderers/toggle-icon-renderer';
import { UnavaliabilityActionsComponent } from '../components/unavailability-reasons/unavaliability-actions';
import { ReasonFormType, ReasonsNavigationTabs } from '../enums';
import { ReasonFormConfig, ReasonFormConfigMap, ReasonsFormTypesMap } from '../interfaces';

const commonCell: ColDef = {
  resizable: true,
  sortable: true,
};

export const UnavaliabilityGridConfig: ColDef[] = [
  {
    field: 'id',
    headerName: '',
    type: 'leftAligned',
    resizable: false,
    sortable: false,
    maxWidth: 140,
    cellRenderer: UnavaliabilityActionsComponent,
  },
  {
    field: 'reason',
    headerName: 'Reason',
    width: 150,
    type: 'leftAligned',
    ...commonCell,
  },
  {
    field: 'description',
    headerName: 'Description',
    width: 500,
    type: 'leftAligned',
    ...commonCell,
  },
  {
    field: 'calculateTowardsWeeklyHours',
    headerName: 'Calculate Towards Weekly Hours',
    width: 280,
    type: 'leftAligned',
    cellRenderer: ToggleIconRendererComponent,
    ...commonCell,
  },
  {
    field: 'eligibleToBeScheduled',
    headerName: 'Eligible For scheduling',
    width: 280,
    type: 'leftAligned',
    cellRenderer: ToggleIconRendererComponent,
    ...commonCell,
  },
  {
    field: 'visibleForIRPCandidates',
    headerName: 'Visible For irp candidate',
    width: 280,
    type: 'leftAligned',
    cellRenderer: ToggleIconRendererComponent,
    ...commonCell,
  },
];

export const ReasonFormsTypeMap: ReasonsFormTypesMap = {
  0: ReasonFormType.DefaultReason,
  1: ReasonFormType.PenaltyReason,
  2: ReasonFormType.RequisitionReason,
  3: ReasonFormType.ClosureReason,
  4: ReasonFormType.ManualInvoiceReason,
  5: ReasonFormType.Unavailability,
  6: ReasonFormType.TerminatedReason,
  7: ReasonFormType.InternalTransferReason,
  8: ReasonFormType.CategoryNoteReason
};

export const NewReasonsActionsMap = {
  [ReasonsNavigationTabs.Closure]: ReasonActions.SaveClosureReasons,
  [ReasonsNavigationTabs.ManualInvoice]: ReasonActions.CreateManualInvoiceRejectReason,
  [ReasonsNavigationTabs.Rejection]: ReasonActions.SaveRejectReasons,
  [ReasonsNavigationTabs.Requisition]: ReasonActions.SaveOrderRequisition,
  [ReasonsNavigationTabs.InternalTransfer]: ReasonActions.SaveInternalTransferReasons,
  [ReasonsNavigationTabs.Termination]: ReasonActions.SaveTerminationReasons,
  [ReasonsNavigationTabs.CategoryNote]: ReasonActions.SaveCategoryNoteReasons,
};

export const UpdateReasonsActionsMap = {
  [ReasonsNavigationTabs.Closure]: ReasonActions.SaveClosureReasons,
  [ReasonsNavigationTabs.ManualInvoice]: ReasonActions.UpdateManualInvoiceRejectReason,
  [ReasonsNavigationTabs.Rejection]: ReasonActions.UpdateRejectReasons,
  [ReasonsNavigationTabs.Requisition]: ReasonActions.SaveOrderRequisition,
  [ReasonsNavigationTabs.InternalTransfer]: ReasonActions.UpdateInternalTransferReasons,
  [ReasonsNavigationTabs.Termination]: ReasonActions.UpdateTerminationReasons,
  [ReasonsNavigationTabs.CategoryNote]: ReasonActions.UpdateCategoryNoteReasons,
};

export const UnavailabilityDialogConfig: ReasonFormConfig[] = [
  {
    field: 'reason',
    title: 'Reason',
    required: true,
    fieldType: FieldType.Input,
  },
  {
    field: 'description',
    title: 'Description',
    required: false,
    fieldType: FieldType.TextArea,
  },
  {
    field: 'calculateTowardsWeeklyHours',
    title: 'Calculate Towards Weekly Hours',
    required: false,
    fieldType: FieldType.Toggle,
  },
  {
    field: 'eligibleToBeScheduled',
    title: 'Eligible For scheduling',
    required: false,
    fieldType: FieldType.Toggle,
  },
  {
    field: 'visibleForIRPCandidates',
    title: 'Visible For IRP Candidate',
    required: false,
    fieldType: FieldType.Toggle,
  },
];

export const defaultDialogConfig: ReasonFormConfig[]  = [
  {
    field: 'reason',
    title: 'Reason',
    required: true,
    fieldType: FieldType.Input,
  },
];

export const categoryNoteDialogConfig: ReasonFormConfig[]  = [
  {
    field: 'reason',
    title: 'Reason',
    required: true,
    fieldType: FieldType.Input,
  },
  {
    field: 'isRedFlagCategory',
    title: 'Red Flag Category',
    required: false,
    fieldType: FieldType.Toggle,
  },
];

export const requisitionDialogConfig: ReasonFormConfig[]  = [
  {
    field: '',
    title: 'Select System',
    fieldType: FieldType.CheckBoxGroup,
    required: true,
    checkBoxes: [
      {
        field: 'includeInIRP',
        title: 'IRP',
      },
      {
        field: 'includeInVMS',
        title: 'VMS',
      },
    ],
  },
  {
    field: 'reason',
    title: 'Reason',
    required: true,
    fieldType: FieldType.Input,
  }
];

export const closureDialogConfig: ReasonFormConfig[]  = [
  {
    field: '',
    title: 'Select System',
    fieldType: FieldType.CheckBoxGroup,
    required: true,
    checkBoxes: [
      {
        field: 'includeInIRP',
        title: 'IRP',
      },
      {
        field: 'includeInVMS',
        title: 'VMS',
      },
    ],
  },
  {
    field: 'reason',
    title: 'Reason',
    required: true,
    fieldType: FieldType.Input,
  }
];

export const ReasonDialogConfig: ReasonFormConfigMap = {
  [ReasonFormType.DefaultReason]: defaultDialogConfig,
  [ReasonFormType.Unavailability]: UnavailabilityDialogConfig,
  [ReasonFormType.PenaltyReason]: null,
  [ReasonFormType.RequisitionReason]: requisitionDialogConfig,
  [ReasonFormType.ClosureReason]: closureDialogConfig,
  [ReasonFormType.CategoryNoteReason]: categoryNoteDialogConfig,
  [ReasonFormType.ManualInvoiceReason] : defaultDialogConfig,
  [ReasonFormType.TerminatedReason] : defaultDialogConfig,
  [ReasonFormType.InternalTransferReason] : defaultDialogConfig
};
