import { PageOfCollections } from '@shared/models/page.model';

export class CredentialSkillGroup {
  id?: number;
  name?: string;
  skills?: any; // TODO: add object model
  skillIds: number[];
  skillNames?: string[];

  constructor(skillGroup: CredentialSkillGroup) {
    if (skillGroup.id) {
      this.id = skillGroup.id;
    }

    if (skillGroup.name) {
      this.name = skillGroup.name;
    }

    if (skillGroup.skills) {
      this.skills = skillGroup.skills;
    }

    if (skillGroup.skillIds) {
      this.skillIds = skillGroup.skillIds;
    }
  }
}

export type CredentialSkillGroupPage = PageOfCollections<CredentialSkillGroup>;
