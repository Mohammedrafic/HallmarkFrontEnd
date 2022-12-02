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
}

export class CredentialSkillByOrganization {
  id: number;
  masterSkillId: number;
  name: string;
}

export type CredentialSkillGroupPage = PageOfCollections<CredentialSkillGroup>;
