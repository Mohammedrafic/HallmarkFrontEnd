import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { CredentialSkillGroup } from '@shared/models/skill-group.model';
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
}
