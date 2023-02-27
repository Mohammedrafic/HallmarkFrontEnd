import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DepartmentFiltersColumnsEnum } from '@client/candidates/enums';
import { isObjectsEqual } from '@core/helpers';
import { CustomFormGroup } from '@core/interface';
import { FilterColumnConfig } from '../constants/department-filter.constant';
import { AssignDepartmentFormState, DepartmentAssigned, DepartmentFiltersColumns, EditDepartmentFormState } from '../departments.model';

@Injectable()
export class DepartmentFormService {
  constructor(private readonly formBuilder: FormBuilder) {}

  public createAssignDepartmentForm(): CustomFormGroup<AssignDepartmentFormState> {
    return this.formBuilder.group({
      regionId: [null, [Validators.required]],
      locationId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      startDate: [new Date(), [Validators.required]],
      endDate: [null],
      isOriented: [null],
      homeCostCenter: [null],
    }) as CustomFormGroup<AssignDepartmentFormState>;
  }

  public createFilterForm(): CustomFormGroup<DepartmentFiltersColumns> {
    return this.formBuilder.group({
      regionIds: [null],
      locationIds: [null],
      departmentsIds: [null],
      skillIds: [null],
      oriented: [1],
    }) as CustomFormGroup<DepartmentFiltersColumns>;
  }

  public createEditForm(): CustomFormGroup<EditDepartmentFormState> {
    return this.formBuilder.group({
      startDate: [null],
      endDate: [null],
      isOriented: [false],
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

  public compareFormState(prev: unknown, curr: unknown): boolean {
    return isObjectsEqual(prev as Record<string, unknown>, curr as Record<string, unknown>);
  }

  public resetControls(formGroup: FormGroup, controlName: string[]): void {
    controlName.forEach((name) => {
      const control = formGroup.get(name);
      if (control?.value) {
        control.reset();
      }
    });
  }

  public disableControls(formGroup: FormGroup, controlName: string[]): void {
    controlName.forEach((name) => {
      const control = formGroup.get(name);
      if (control) {
        control.disable();
      }
    });
  }

  public patchForm(formGroup: FormGroup, formData: DepartmentAssigned): void {
    const { regionId, locationId, departmentId, startDate, endDate, isOriented } = formData;
    formGroup.patchValue({
      regionId: regionId,
      locationId: locationId,
      departmentId: departmentId,
      startDate: startDate,
      endDate: endDate,
      isOriented: isOriented,
      homeCostCenter: false,
    })
  }
}
