import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CredentialSkillByOrganization, CredentialSkillGroup } from '@shared/models/skill-group.model';
import { Skill } from '@shared/models/skill.model';

@Injectable()
export class GroupSetupService {
  constructor(private fb: FormBuilder) {
  }

  createForm(useIRPAndVms = false): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      skillIds: [''],
      ...(useIRPAndVms && {
        includeInIRP: [false],
        includeInVMS: [false],
      }),
    });
  }

  populateFormGroup(
    form: FormGroup,
    group: CredentialSkillGroup,
    skillIds: number[],
    useIRPAndVms = false
  ): void {
    form.patchValue({
      name: group.name,
      skillIds,
      ...(useIRPAndVms && {
        includeInIRP: group.includeInIRP,
        includeInVMS: group.includeInVMS,
      }),
    });
  }

  getSearchDataSources(
    includeInIRP: boolean,
    includeInVMS: boolean,
    allAssignedSkills: Skill[],
    filteredAssignedSkills: Skill[],
  ): Skill[] {
    if (includeInIRP && includeInVMS) {
      return allAssignedSkills.filter((skill: Skill) => {
        return !skill.assignedToVMS && !skill.assignedToIRP;
      });
    }

    if (includeInIRP) {
      return allAssignedSkills.filter((skill: Skill) => {
        return !skill.assignedToIRP;
      });
    }

    if (includeInVMS) {
      return  allAssignedSkills.filter((skill: Skill) => {
        return !skill.assignedToVMS;
      });
    }

    return filteredAssignedSkills;
  }

  createAllAssignedSkills(skillGroups: CredentialSkillGroup[], organizationSkills: Skill[]): Skill[] {
    const assignedSkillGroup = new Map<number, CredentialSkillByOrganization>();

    skillGroups?.forEach((group: CredentialSkillGroup) => {
      group.skills?.forEach((skill: CredentialSkillByOrganization) => {
        assignedSkillGroup.set(skill.id, {
          ...skill,
          assignedToVMS: group.includeInVMS ?? false,
          assignedToIRP: group.includeInIRP ?? false,
        });
      });
    });

    return organizationSkills.map((skill: Skill) => {
      if(assignedSkillGroup.has(skill.id)) {
        const assignedSkill = assignedSkillGroup.get(skill.id);
        return {
          ...skill,
          ...assignedSkill,
        };
      }

      skill.assignedToVMS = false;
      skill.assignedToIRP = false;

      return skill;
    });
  }
}
