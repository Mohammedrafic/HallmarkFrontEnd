export type ComponentPermissionTitle = 'canAddManual' | 'canManageOrganizationCredential';
export type CredentialPermissions = Record<ComponentPermissionTitle, boolean>;

export interface CredentialTypeSource {
  name: string;
  id: number;
}

export interface ConfirmOverrideComments {
  isConfirmed: boolean;
  credentialMappring: boolean;
  openInProgressOrders: boolean;
}
