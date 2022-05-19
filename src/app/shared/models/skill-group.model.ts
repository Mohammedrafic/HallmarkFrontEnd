import { Skill } from './skill.model';

export class SkillGroup {
  id?: number;
  name?: string;
  organizationId?: number;
  skills?: any; // TODO: add object model
  skillIds: number[];
  skillNames?: string[];

  constructor(skillGroup: SkillGroup) {
    if (skillGroup.id) {
      this.id = skillGroup.id;
    }

    if (skillGroup.name) {
      this.name = skillGroup.name;
    }

    if (skillGroup.organizationId) {
      this.organizationId = skillGroup.organizationId;
    }

    if (skillGroup.skills) {
      this.skills = skillGroup.skills;
    }

    if (skillGroup.skillIds) {
      this.skillIds = skillGroup.skillIds;
    }
  }
}
