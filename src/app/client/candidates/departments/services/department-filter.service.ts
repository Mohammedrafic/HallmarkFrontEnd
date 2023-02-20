import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { CustomFormGroup } from '@core/interface';
import { DepartmentFiltersColumns } from '../departments.model';

@Injectable()
export class DepartmentFilterService {
  constructor(private readonly formBuilder: FormBuilder) {}

  public createForm(): CustomFormGroup<DepartmentFiltersColumns> {
    return this.formBuilder.group({
      regionIds: [null],
      locationIds: [null],
      departmentIds: [null],
      primarySkillIds: [null],
      secondarySkillIds: [null],
      startDate: [null],
      endDate: [null],
      both: [true],
      oriented: [false],
      notOriented: [false],
    }) as CustomFormGroup<DepartmentFiltersColumns>;
  }
}

