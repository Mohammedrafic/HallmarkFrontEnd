import { CredentialSetupDetails, CredentialSetupGet, CredentialsSelectedItem } from '@shared/models/credential-setup.model';
import { Credential } from '@shared/models/credential.model';
import { CredentialType } from '@shared/models/credential-type.model';

export class MapCredentialsAdapter {
  static prepareCredentialsDetails(selectedItems: CredentialsSelectedItem[]): CredentialSetupDetails[] {
    return selectedItems.map((item: CredentialsSelectedItem) => ({
      masterCredentialId: item.masterCredentialId,
      comments: item.comments,
      optional: item.isActive,
      reqSubmission: item.reqSubmission,
      reqOnboard: item.reqOnboard,
      inactiveDate: item.inactiveDate,
    }));
  }

  static prepareCredentialGet(credential: Credential, credentialType: CredentialType | undefined): CredentialSetupGet {
    return {
      masterCredentialId: credential.id as number,
      credentialType: credentialType?.name || '',
      description: credential.name,
      comments: credential.comment,
      includeInIRP: credential.includeInIRP,
      includeInVMS: credential.includeInVMS,
      irpComment: credential.irpComment,
    };
  }
}
