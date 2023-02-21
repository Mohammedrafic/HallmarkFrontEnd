import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DepartmentFiltersColumnsEnum } from '@client/candidates/enums';
import { CustomFormGroup } from '@core/interface';
import { FilterColumnConfig } from '../constants/department-filter.constant';
import { DepartmentFiltersColumns, EditDepartmentFormState } from '../departments.model';

@Injectable()
export class DepartmentFormService {
  constructor(private readonly formBuilder: FormBuilder) {}

  public createFilterForm(): CustomFormGroup<DepartmentFiltersColumns> {
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

  public createEditForm(): CustomFormGroup<EditDepartmentFormState> {
    return this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      oriented: [false],
      homeCostCenter: [false],
      orientedStartDate: [null],
    }) as CustomFormGroup<EditDepartmentFormState>;
  }

  public initFilterColumns(): DepartmentFiltersColumns {
    const filterColumnsEntries = Object.values(DepartmentFiltersColumnsEnum).map((key) => {
      const filterColumn = FilterColumnConfig[key as DepartmentFiltersColumnsEnum];
      return [
        key,
        {
          type: filterColumn.type,
          valueType: filterColumn.valueType,
          dataSource: [],
          valueField: filterColumn.valueField,
          valueId: filterColumn.valueId,
        },
      ];
    });

    return Object.fromEntries(filterColumnsEntries);
  }
}
