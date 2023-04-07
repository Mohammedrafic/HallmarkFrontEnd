import { MasterSkillByOrganization } from "@shared/models/skill.model";

export class CandidateDetailsService {
  public assignSkillDataSource(skills: MasterSkillByOrganization[]): MasterSkillByOrganization[] {
    return skills.filter(
      (value, index, array) => array.findIndex((skill) => skill.masterSkillId === value.masterSkillId) === index
    );
  }
}
