import { CredentialStatus } from "@shared/enums/status";

export const orgSideCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Pending,
  CredentialStatus.Verified,
  CredentialStatus.Rejected,
  CredentialStatus.Reviewed
];

export const agencySideCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Pending,
  CredentialStatus.Completed
];

export const orgSidePendingCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Pending,
  CredentialStatus.Reviewed,
  CredentialStatus.Verified
];

export const orgSideCompletedCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Completed,
  CredentialStatus.Reviewed,
  CredentialStatus.Verified,
  CredentialStatus.Pending,
];

export const orgSideReviewedCredentialStatuses: CredentialStatus[] = [
  CredentialStatus.Reviewed,
  CredentialStatus.Verified,
  CredentialStatus.Pending
];

