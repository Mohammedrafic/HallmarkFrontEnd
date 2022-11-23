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

