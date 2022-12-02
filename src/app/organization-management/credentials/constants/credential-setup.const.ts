import { CredentialSetupSystemEnum } from '@organization-management/credentials/enums';

export const systemOptions = [
  {
    id: CredentialSetupSystemEnum.All,
    name: 'IRP, VMS'
  },
  {
    id: CredentialSetupSystemEnum.IRP,
    name: 'IRP'
  },
  {
    id: CredentialSetupSystemEnum.VMS,
    name: 'VMS'
  },
];
