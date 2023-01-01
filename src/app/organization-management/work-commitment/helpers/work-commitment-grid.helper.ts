import { ListOfSkills } from '@shared/models/skill.model';
import { formatDate } from '@angular/common';
import { WorkCommitmentOrgHierarchies } from '../interfaces';

export const getCorrectLocationValue = (value: string[] | null) =>
  value === null ? 'All' : getCorrectLongValue(value);

export const getCorrectSkillsValue = (value: ListOfSkills[]) => {
  const skillsName = value.map((item): string => item.name);
  return getCorrectLongValue(skillsName);
};

export const getCorrectLongValue = (value: string[]) => {
  if (value.length <= 3) {
    return value.join(', ');
  } else {
    let correctValue = value.slice(-3);
    correctValue.push('...');
    return correctValue.join(', ');
  }
};

export const getCorrectDateValue = (value: string) => formatDate(value, 'EEEE, h:mm', 'en-US');

export const getRegionsArray = (orgStructure: WorkCommitmentOrgHierarchies[]): string[] => {
  const regions = new Set();

  orgStructure.forEach((location: WorkCommitmentOrgHierarchies) => {
    regions.add(location.regionName);
  });

  return Array.from(regions) as string[];
};
