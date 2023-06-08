import { PageOfCollections } from '@shared/models/page.model';

export class CredentialSkillGroup {
  id?: number;
  name?: string;
  organizationId?: number;
  skills?: CredentialSkillByOrganization[];
  includeInIRP?: boolean;
  includeInVMS?: boolean;
}

export class CredentialSkillGroupPost {
  id?: number;
  name: string;
  skillIds: number[];
  includeInIRP? : boolean;
  includeInVMS?: boolean;
}

export class CredentialSkillByOrganization {
  id: number;
  masterSkillId: number;
  name: string;
  assignedToVMS: boolean;
  assignedToIRP: boolean;
}

export type CredentialSkillGroupPage = PageOfCollections<CredentialSkillGroup>;
