import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import { filter, Subject, takeUntil, switchMap, Observable, of } from 'rxjs';
import { Store } from '@ngxs/store';

import { EditDepartmentFields } from '@client/candidates/enums/edit-department.enum';
import { CustomFormGroup } from '@core/interface';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ControlTypes } from '@shared/enums/control-types.enum';
import { EditDepartmentsFormConfig } from '../constants/edit-departments.constant';
import {
  DateRanges,
  DepartmentFilterState,
  DepartmentFormFieldConfig,
  DepartmentPayload,
  EditDepartmentFormState,
} from '../departments.model';
import { DepartmentFormService } from '../services/department-form.service';
import { DepartmentsService } from '../services/departments.service';
import { ConfirmService } from '@shared/services/confirm.service';
import { EDIT_MULTIPLE_RECORDS_TEXT, RECORD_MODIFIED, WARNING_TITLE } from '@shared/constants';
import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';

@Component({
  selector: 'app-edit-departments',
  templateUrl: './edit-departments.component.html',
  styleUrls: ['./edit-departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartmentsComponent extends DestroyableDirective implements OnInit {
  @Input() public saveForm$: Subject<boolean>;
  @Input() public selectedDepartments: number[] | null;
  @Input() public dateRanges: DateRanges;
  @Input() public filters: DepartmentFilterState | null;

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
    this.saveFormData();
    this.setValidators();
  }

  public resetEditDepartmentForm(): void {
    this.formGroup.reset();
    this.resetOrientationDateControl(false);
    this.initFormConfig(false);
    this.cdr.markForCheck();
  }

  public trackByFn = (_: number, item: DepartmentFormFieldConfig<EditDepartmentFields>) => item.field + item.show;

  private initForm(): void {
    this.formGroup = this.departmentFormService.createEditForm();
  }

  private initFormConfig(isOriented: boolean): void {
    this.filtersFormConfig = EditDepartmentsFormConfig(isOriented);
  }

  public toggleHandler(event: boolean, field: EditDepartmentFields): void {
    if (field === EditDepartmentFields.IS_ORIENTED) {
      this.initFormConfig(event);
      this.formGroup.markAsDirty();
      this.resetOrientationDateControl(event);
    }
  }

  private saveFormData(): void {
    this.saveForm$
      .pipe(
        switchMap(() => {
          const formValid = this.formGroup.valid;
          if (!formValid) {
            this.formGroup.markAllAsTouched();
            this.cdr.markForCheck();
          }
          return formValid ? this.confirmAction() : of(formValid);
        }),
        filter(Boolean),
        switchMap(() => this.editDepartments()),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.store.dispatch([new ShowSideDialog(false), new ShowToast(MessageTypes.Success, RECORD_MODIFIED)]);
        this.refreshGrid.emit();
      });
  }

  private editDepartments(): Observable<DepartmentPayload> {
    const formData = this.formGroup.getRawValue();
    return this.departmentService.editAssignedDepartments(formData, this.selectedDepartments, this.filters);
  }

  private confirmAction(): Observable<boolean> {
    return this.confirmService.confirm(EDIT_MULTIPLE_RECORDS_TEXT, {
      title: WARNING_TITLE,
      okButtonLabel: 'Yes',
      okButtonClass: 'ok-button',
    });
  }

  private resetOrientationDateControl(isOriented: boolean): void {
    const orientationDateControl = this.formGroup.get(EditDepartmentFields.ORIENTATION_DATE);
    this.departmentFormService.addRemoveValidator(orientationDateControl, isOriented);
  }

  private setValidators(): void {
    this.departmentFormService.addStartEndDateValidators(this.formGroup);
  }
}
