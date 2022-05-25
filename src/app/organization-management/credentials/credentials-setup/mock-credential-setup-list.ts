import { CredentialSetup } from '@shared/models/credential-setup.model';

export const MockCredentialSetupList: CredentialSetup[] = [
  {
    id: 1,
    optional: false,
    masterCredentialId: 1,
    comments: 'test comment message',
    skillGroupId: 1,
    regionId: 1,
    isActive: false,
    inactiveDate: '2022-05-14T21:00:00.000Z',
    description: 'descr',
    reqOnboard: true,
    reqSubmission: true
  }
]
