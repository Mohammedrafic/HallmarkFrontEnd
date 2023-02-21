import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, Input } from '@angular/core';

import { Subject, takeUntil } from 'rxjs';

import { EditDepartmentFieldsEnum } from '@client/candidates/enums/edit-department.enum';
import { CustomFormGroup } from '@core/interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { EditDepartmentsFormConfig } from '../constants/edit-departments.constant';
import { DepartmentFormFieldConfig, EditDepartmentFormState } from '../departments.model';
import { DepartmentFormService } from '../services/department-filter.service';
import { DepartmentsService } from '../services/departments.service';

@Component({
  selector: 'app-edit-departments',
  templateUrl: './edit-departments.component.html',
  styleUrls: ['./edit-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartmentsComponent extends DestroyableDirective implements OnInit {
  @Input() public saveForm$: Subject<boolean>;
  @Input() public selectedDepartments: number[];

  public filtersFormConfig: DepartmentFormFieldConfig<EditDepartmentFieldsEnum>[] = [];
  public formGroup: CustomFormGroup<EditDepartmentFormState>;
  public controlTypes = ControlTypes;
  public editDepFields = EditDepartmentFieldsEnum;

  constructor(
    private readonly departmentFormService: DepartmentFormService,
    private readonly cdr: ChangeDetectorRef,
    private readonly departmentService: DepartmentsService
  ) {
    super();
    this.initForm();
  }

  public ngOnInit(): void {
    this.initFormConfig(false);
    this.watchForOrientedControl();
    this.saveFormData();
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

  private saveFormData(): void {
    this.saveForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.formGroup.untouched) {
        return;
      } else {
        const formData = this.formGroup.getRawValue();
        this.departmentService.editAssignedDepartments(formData, this.selectedDepartments);
      }
    });
  }
}

