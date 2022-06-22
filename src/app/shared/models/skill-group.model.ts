import { PageOfCollections } from '@shared/models/page.model';
import { MasterSkillByOrganization } from '@shared/models/skill.model';

export class CredentialSkillGroup {
  id?: number;
  name?: string;
  organizationId?: number;
  skills?: MasterSkillByOrganization[];
}

export class CredentialSkillGroupPost {
  id?: number;
  name: string;
  skillIds: number[];
}

export type CredentialSkillGroupPage = PageOfCollections<CredentialSkillGroup>;
