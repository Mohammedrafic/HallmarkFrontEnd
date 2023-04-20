import { DropdownOption } from '@core/interface';
import { OrganizationDepartment, OrganizationLocation, OrganizationRegion } from '@shared/models/organization.model';
import { AssignedSkillsByOrganization, Skill } from '@shared/models/skill.model';

export class ScheduleFilterHelper {
  static adaptRegionToOption(regions: OrganizationRegion[]): DropdownOption[] {
    return regions.map((region) => ({ text: region.name as string, value: region.id as number }));
  }

  static adaptLocationToOption(locations: OrganizationLocation[]): DropdownOption[] {
    return locations.map((location) => ({ text: location.name, value: location.id }));
  }

  static adaptDepartmentToOption(departments: OrganizationDepartment[]): DropdownOption[] {
    return departments.map((department) => ({ text: department.name, value: department.id }));
  }

  static adaptSkillToOption(skills: Skill[]): DropdownOption[] {
    return skills.map((skill) => ({ text: skill.skillDescription, value: skill.id }));
  }

  static adaptMasterSkillToOption(skills: Skill[]): DropdownOption[] {
    return skills.map((skill) => ({ text: skill.name, value: skill.id })) as DropdownOption[];
  }

  static adaptOrganizationSkillToOption(skills: AssignedSkillsByOrganization[]): DropdownOption[] {
    return skills.map((skill) => ({ text: skill.skillDescription, value: skill.masterSkillId })) as DropdownOption[];
  }
}
