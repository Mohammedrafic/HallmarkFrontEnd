import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      skillCode: ['', [Validators.required, Validators.minLength(3)]],
      skillCategoryId: ['', [Validators.required, Validators.minLength(3)]],
      skillDescription: ['', [ Validators.required, Validators.minLength(3) ]],
      glNumber: ['', [ Validators.minLength(3) ]],
      allowOnboard: [false],
      inactiveDate: [''],
      includeInIRP: [],
      includeInVMS: [],
    }) as CustomFormGroup<SkillsForm>;
  }

  createFilterForm(): FormGroup {
    return this.fb.group({
      skillCategories: [],
      skillAbbrs: [],
      skillDescriptions: [],
      glNumbers: [],
      allowOnboard: [],
      includeInIRP: [true],
      includeInVMS: [true],
    });
  }
}
