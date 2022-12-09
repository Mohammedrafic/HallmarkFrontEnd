import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { SkillsForm } from './skills.interface';

@Injectable()
export class SkillsService {
  constructor (
    private fb: FormBuilder,
  ) {}

  createSkillsForm(): CustomFormGroup<SkillsForm> {
    return this.fb.group({
      id: [0],
      isDefault: [false],
      masterSkillId: [null],
      skillCategoryId: ['', [Validators.required, Validators.minLength(3)]],
      skillAbbr: ['', [Validators.minLength(3)]],
      skillDescription: ['', [ Validators.required, Validators.minLength(3) ]],
      glNumber: ['', [ Validators.minLength(3) ]],
      allowOnboard: [false],
      inactiveDate: [''],
    }) as CustomFormGroup<SkillsForm>;
  }

  createFilterForm() {
    return this.fb.group({
      skillCategories: [],
      skillAbbrs: [],
      skillDescriptions: [],
      glNumbers: [],
      allowOnboard: [],
    });
  }
}
