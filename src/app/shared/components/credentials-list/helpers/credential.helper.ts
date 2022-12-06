import { CredentialsDialogTitle } from '@shared/components/credentials-list/enums';
import { CredentialConfig, SystemConfig } from '@shared/components/credentials-list/constants';
import { CredentialListConfig } from '@shared/components/credentials-list/interfaces';
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
  isIncludeIrp: boolean,
  isCredentialSettings: boolean
): CredentialListConfig[] => {
  if(isIncludeIrp && isCredentialSettings) {
    return [...SystemConfig, ...CredentialConfig];
  }
  return CredentialConfig;
};
