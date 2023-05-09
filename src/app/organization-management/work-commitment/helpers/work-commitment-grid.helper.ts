import { ListOfSkills } from '@shared/models/skill.model';
import { formatDate } from '@angular/common';
import { WorkCommitmentOrgHierarchies } from '../interfaces';

export const getCorrectLocationValue = (value: string[] | null) =>
  value === null ? 'All' : getCorrectLongValue(value);

export const getCorrectSkillsValue = (value: string[]) => (value[0] === null ? 'All' : getCorrectLongValue(value));

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

export const getRegionsArray = (orgStructure: WorkCommitmentOrgHierarchies[], key: string): string[] => {
  const regions = new Set();

  orgStructure.forEach((location: any) => {
    regions.add(location[key]);
  });

  return Array.from(regions) as string[];
};
export const getLocationssArray = (orgStructure: WorkCommitmentOrgHierarchies[], key: string): string[] => {
  const regions = new Set();

  orgStructure.forEach((location: any) => {
    regions.add(location[key]);
  });

  return Array.from(regions) as string[];
};
