import { CredentialGroupMapping } from '@shared/models/credential-group-mapping.model';

export const MockGroupMapping: CredentialGroupMapping[] = [
  {
    id: 1,
    region: {
      id: 10,
      name: 'Re g1'
    },
    location: {
      id: 20,
      name: 'locaTION',
    },
    department: {
      departmentId: 21,
      departmentName: 'name'
    },
    skillGroup: {
      id: 1,
      name: 'Test Skill'
    }
  }
]

