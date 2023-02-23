import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { filter, Subject, takeUntil, switchMap, Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { EditDepartmentFields } from '@client/candidates/enums/edit-department.enum';
import { CustomFormGroup } from '@core/interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { EditDepartmentsFormConfig } from '../constants/edit-departments.constant';
import { DepartmentFormFieldConfig, EditAssignedDepartment, EditDepartmentFormState } from '../departments.model';
import { DepartmentFormService } from '../services/department-form.service';
import { DepartmentsService } from '../services/departments.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { EDIT_MULTIPLE_RECORDS_TEXT, WARNING_TITLE } from '@shared/constants';
import { ShowSideDialog } from 'src/app/store/app.actions';

@Component({
  selector: 'app-edit-departments',
  templateUrl: './edit-departments.component.html',
  styleUrls: ['./edit-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartmentsComponent extends DestroyableDirective implements OnInit {
  @Input() public saveForm$: Subject<boolean>;
  @Input() public selectedDepartments: number[] | null;

  @Output() public refreshGrid: EventEmitter<void> = new EventEmitter();

  public filtersFormConfig: ReadonlyArray<DepartmentFormFieldConfig<EditDepartmentFields>> = [];
  public formGroup: CustomFormGroup<EditDepartmentFormState>;
  public controlTypes = ControlTypes;
  public editDepFields = EditDepartmentFields;

  constructor(
    private readonly departmentFormService: DepartmentFormService,
    private readonly cdr: ChangeDetectorRef,
    private readonly departmentService: DepartmentsService,
    private readonly confirmService: ConfirmService,
    private readonly store: Store
  ) {
    super();
    this.initForm();
  }

  public ngOnInit(): void {
    this.initFormConfig(false);
    this.watchForOrientedControl();
    this.saveFormData();
    this.watchForControls();
  }

  public trackByFn = (_: number, item: DepartmentFormFieldConfig<EditDepartmentFields>) => item.field + item.show;

  private initForm(): void {
    this.formGroup = this.departmentFormService.createEditForm();
  }

  private initFormConfig(isOriented: boolean): void {
    this.filtersFormConfig = EditDepartmentsFormConfig(isOriented);
    this.cdr.markForCheck();
  }

  private watchForOrientedControl(): void {
    this.formGroup
      .get(EditDepartmentFields.ORIENTED)
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((isOriented) => {
        this.initFormConfig(isOriented);
      });
  }

  private saveFormData(): void {
    this.saveForm$
      .pipe(
        switchMap(() => this.confirmAction()),
        switchMap(() => this.editDepartments()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.store.dispatch(new ShowSideDialog(false));
        this.refreshGrid.emit();
      });
  }

  private editDepartments(): Observable<EditAssignedDepartment> {
    const formData = this.formGroup.getRawValue();
    return this.departmentService.editAssignedDepartments(formData, this.selectedDepartments);
  }

  private confirmAction(): Observable<boolean> {
    return this.confirmService
      .confirm(EDIT_MULTIPLE_RECORDS_TEXT, {
        title: WARNING_TITLE,
        okButtonLabel: 'Yes',
        okButtonClass: 'ok-button',
      })
      .pipe(filter(Boolean));
  }

  private watchForControls(): void {
    this.formGroup
      .get('startDate')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const endDateControl = this.formGroup.get('endDate');
        if (value) {
          endDateControl?.enable();
        } else {
          endDateControl?.reset();
          endDateControl?.disable();
        }
      });
  }
}
