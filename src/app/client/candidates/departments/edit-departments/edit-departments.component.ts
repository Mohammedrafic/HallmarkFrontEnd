import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { takeUntil } from 'rxjs';

import { EditDepartmentFieldsEnum } from '@client/candidates/enums/edit-department.enum';
import { CustomFormGroup } from '@core/interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { EditDepartmentsFormConfig } from '../constants/edit-departments.constant';
import { DepartmentFormFieldConfig, EditDepartmentFormState } from '../departments.model';
import { DepartmentFormService } from '../services/department-filter.service';

@Component({
  selector: 'app-edit-departments',
  templateUrl: './edit-departments.component.html',
  styleUrls: ['./edit-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartmentsComponent extends DestroyableDirective implements OnInit {
  public filtersFormConfig: DepartmentFormFieldConfig<EditDepartmentFieldsEnum>[] = [];
  public formGroup: CustomFormGroup<EditDepartmentFormState>;
  public controlTypes = ControlTypes;
  public editDepFields = EditDepartmentFieldsEnum;

  constructor(private readonly departmentFormService: DepartmentFormService, private readonly cdr: ChangeDetectorRef) {
    super();
    this.initForm();
  }

  public ngOnInit(): void {
    this.initFormConfig(false);
    this.watchForOrientedControl();
  }

  public trackByFn = (_: number, item: DepartmentFormFieldConfig<EditDepartmentFieldsEnum>) => item.field + item.show;

  private initForm(): void {
    this.formGroup = this.departmentFormService.createEditForm();
  }

  private initFormConfig(isOriented: boolean): void {
    this.filtersFormConfig = EditDepartmentsFormConfig(isOriented);
    this.cdr.markForCheck();
  }

  private watchForOrientedControl(): void {
    this.formGroup
      .get(EditDepartmentFieldsEnum.ORIENTED)
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((isOriented) => {
        this.initFormConfig(isOriented);
      });
  }
}

