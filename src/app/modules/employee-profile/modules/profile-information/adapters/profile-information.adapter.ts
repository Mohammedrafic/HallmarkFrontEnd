import { DropdownOption } from '@core/interface';

import { COUNTRIES } from '@shared/constants/countries-list';

import { AssignedSkillDTO } from '../interfaces';

export class ProfileInformationAdapter {
  static adaptAssignedSkills(skills: AssignedSkillDTO[]): DropdownOption[] {
    return skills.map((skill: AssignedSkillDTO) => {
      return {
        text: skill.skillDescription,
        value: skill.masterSkillId,
      };
    });
  }

  static adaptCountries(counties: typeof COUNTRIES): DropdownOption[] {
    return counties.map((country) => {
      return {
        text: country.text,
        value: country.id,
      };
    });
  }
}
