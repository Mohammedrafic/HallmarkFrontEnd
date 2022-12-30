import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { SkillFilters } from '@shared/models/skill.model';
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
      skillAbbr: ['', [Validators.minLength(3)]],
      skillCode: ['', [Validators.maxLength(200)]],
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
      skillCode: [],
    });
  }

  adaptFilters(filters: SkillFilters, filterForm: FormGroup): SkillFilters {
    const filterValues = filterForm.getRawValue();
    /**
     * IRP flags have to be converted to bool as BE does not work with null values.
     */
    filterValues.includeInIRP = !!filterValues.includeInIRP;
    filterValues.includeInVMS = !!filterValues.includeInVMS;

    return ({
      ...filters,
      ...filterValues,
      ...filterValues.skillCode ? { skillCodes: [filterValues.skillCode] } : { skillCodes: null },
    }) as SkillFilters;
  } 
}
