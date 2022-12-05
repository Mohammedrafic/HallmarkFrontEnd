import { CredentialsDialogTitle } from '@shared/components/credentials-list/enums';
import { CredentialConfig, SystemConfig } from '@shared/components/credentials-list/constants';
import { CredentialListConfig, SelectedSystemsFlag } from '@shared/components/credentials-list/interfaces';
import { Credential } from '@shared/models/credential.model';

export const systemColumnMapper = (credentials: Credential[]) => {
  return credentials.map((credential: Credential ) => {
    credential.system = `${credential.includeInIRP ? 'IRP': ''} ${credential.includeInVMS ? 'VMS': ''}`.trim();
    return credential;
  });
};

export const DialogTitle = (isEdit: boolean) => {
  return isEdit ?
    CredentialsDialogTitle[CredentialsDialogTitle.Edit] :
    CredentialsDialogTitle[CredentialsDialogTitle.Add];
};

export const CredentialsDialogConfig = (
  selectedSystem: SelectedSystemsFlag,
  isCredentialSettings: boolean
): CredentialListConfig[] => {
  if(selectedSystem.isIRP && selectedSystem.isVMS && isCredentialSettings) {
    return [...SystemConfig, ...CredentialConfig];
  }
  return CredentialConfig;
};
