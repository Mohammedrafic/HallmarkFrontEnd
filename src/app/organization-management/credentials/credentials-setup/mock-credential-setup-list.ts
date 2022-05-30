import { CredentialSetup, CredentialSetupPage } from '@shared/models/credential-setup.model';

export const MockCredentialSetupList: CredentialSetup[] = [
  {
    id: 1,
    masterCredentialId: 37,
    comments: 'test comment message',
    skillGroupId: 1,
    isActive: false,
    inactiveDate: '2022-05-14T21:00:00.000Z',
    description: 'uniq descr',
    reqOnboard: true,
    reqSubmission: true
  }
]

export const MockCredentialSetupPage: CredentialSetupPage = {
  items: MockCredentialSetupList,
  hasNextPage: false,
  hasPreviousPage: false,
  pageNumber: 1,
  totalCount: 1,
  totalPages: 1
}
