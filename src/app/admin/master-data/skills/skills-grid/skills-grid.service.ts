import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { MasterSkillsFilterForm, MasterSkillsForm } from './skills-grid.interface';

@Injectable()
export class MasterSkillsService {
  constructor(
    private fb: FormBuilder,
  ) {}

  createMasterSkillsForm(): CustomFormGroup<MasterSkillsForm> {
    return this.fb.group({
      id: [0],
      isDefault: [true],
      skillCategoryId: ['', [Validators.required, Validators.minLength(3)]],
      skillAbbr: ['', [Validators.minLength(3)]],
      skillDescription: ['', [Validators.required, Validators.minLength(3)]],
    }) as CustomFormGroup<MasterSkillsForm>;
  }

  createMasterSkillsFilterForm(): CustomFormGroup<MasterSkillsFilterForm> {
    return this.fb.group({
      searchTerm: [''],
      skillCategoryIds: [[]],
      skillAbbreviations: [[]],
      skillDescriptions: [[]],
    }) as CustomFormGroup<MasterSkillsFilterForm>;
  }
}
