import { FieldSettingsModel } from "@syncfusion/ej2-angular-dropdowns";
import { SelectionSettingsModel } from "@syncfusion/ej2-grids/src/grid/base/grid-model";

import { CredentialStatus } from "@shared/enums/status";

export const orgSideCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Pending,
  CredentialStatus.Reviewed,
  CredentialStatus.Verified,
];

export const agencySideCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Completed,
  CredentialStatus.Pending,
];

export const orgSidePendingCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Pending,
  CredentialStatus.Rejected,
  CredentialStatus.Reviewed,
  CredentialStatus.Verified,
];

export const orgSideCompletedCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Completed,
  CredentialStatus.Pending,
  CredentialStatus.Reviewed,
  CredentialStatus.Verified,
];

export const orgSideReviewedCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Pending,
  CredentialStatus.Rejected,
  CredentialStatus.Reviewed,
  CredentialStatus.Verified,
];

export const AllowedCredentialFileExtensions: string = '.pdf, .jpg, .jpeg, .png';

export const CredentialSelectionSettingsModel: SelectionSettingsModel = {
  type: 'Multiple',
  mode: 'Row',
  persistSelection: true,
};

export const StatusFieldSettingsModel: FieldSettingsModel = {
  text: 'text',
  value: 'id',
}
