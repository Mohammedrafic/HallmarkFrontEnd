import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { DepartmentFiltersColumnsEnum } from '@client/candidates/enums';
import { DateTimeHelper, isObjectsEqual } from '@core/helpers';
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
      isHomeCostCenter: [null],
      orientationDate: [null],
    }) as CustomFormGroup<AssignDepartmentFormState>;
  }

  public createFilterForm(): CustomFormGroup<DepartmentFiltersColumns> {
    return this.formBuilder.group({
      regionIds: [null],
      locationIds: [null],
      departmentsIds: [null],
      skillIds: [null],
      isOriented: [0],
    }) as CustomFormGroup<DepartmentFiltersColumns>;
  }

  public createEditForm(): CustomFormGroup<EditDepartmentFormState> {
    return this.formBuilder.group({
      startDate: [null, [Validators.required]],
      endDate: [null],
      isOriented: [false],
      isHomeCostCenter: [false],
      orientationDate: [null],
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
          dataSource: filterColumn.dataSource,
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
    const { regionId, locationId, departmentId, startDate, endDate, isOriented, isHomeCostCenter, orientationDate } = formData;
    formGroup.patchValue({
      regionId: regionId,
      locationId: locationId,
      departmentId: departmentId,
      startDate: DateTimeHelper.convertDateToUtc(startDate),
      endDate: endDate && DateTimeHelper.convertDateToUtc(endDate),
      isOriented: isOriented,
      isHomeCostCenter: isHomeCostCenter,
      orientationDate: orientationDate && DateTimeHelper.convertDateToUtc(orientationDate)
    })
  }

  public addRemoveValidator(control: AbstractControl | null, term: boolean): void {
    if(term) {
      control?.setValidators([Validators.required]);
    } else {
      control?.setValidators([]);
      control?.reset();
    }
  }
}
