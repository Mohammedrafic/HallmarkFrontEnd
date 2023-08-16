import { CredentialsNavigationTabs } from '@shared/enums/credentials-navigation-tabs';
import { ComponentPermissionTitle } from '@organization-management/credentials/interfaces';
import { PermissionTypes } from '@shared/enums/permissions-types.enum';

export const COMPONENT_PERMISSIONS: Record<ComponentPermissionTitle, PermissionTypes> = {
  canAddManual: PermissionTypes.ManuallyAddCredential,
  canManageOrganizationCredential: PermissionTypes.ManageOrganizationCredential,
};

export const CredentialRouterLink: Record<CredentialsNavigationTabs, string> = {
  [CredentialsNavigationTabs.Setup]: 'setup',
  [CredentialsNavigationTabs.GroupSetup]: 'groups-setup',
  [CredentialsNavigationTabs.CredentialsList]: 'list',
};
