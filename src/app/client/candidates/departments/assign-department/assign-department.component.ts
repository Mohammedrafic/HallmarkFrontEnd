import { ChangeDetectionStrategy, Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { debounceTime, Subject, takeUntil } from 'rxjs';

import { ShowSideDialog } from 'src/app/store/app.actions';
import { DepartmentAssigned } from '../departments.model';
import { DepartmentsService } from '../services/departments.service';
import { Destroyable } from '@core/helpers';

@Component({
  selector: 'app-assign-department',
  templateUrl: './assign-department.component.html',
  styleUrls: ['./assign-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignDepartmentComponent extends Destroyable implements OnInit {
  @Input() public dialogData$: Subject<DepartmentAssigned>;
  @Input() public saveForm$: Subject<boolean>;

  public assignDepartmentForm: FormGroup;
  public regions: { name: string; id: number }[] = [];
  public locations: { name: string; id: number }[] = [];
  public departments: { name: string; id: number }[] = [];

  public readonly departmentFields = {
    text: 'name',
    value: 'id',
  };

  private departmentId?: number | null = null;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly departmentService: DepartmentsService,
    private readonly store: Store
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
    this.subscribeOnDialogData();
    this.saveFormData();
  }

  public resetAssignDepartmentForm(): void {
    if (this.assignDepartmentForm.valid) {
      this.assignDepartmentForm.reset();
      this.assignDepartmentForm.enable();
    }
  }

  private initForm(): void {
    this.assignDepartmentForm = this.formBuilder.group({
      region: [null, [Validators.required]],
      location: [null, [Validators.required]],
      department: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null],
      oriented: [null],
      homeCostCenter: [null],
    });
  }

  private subscribeOnDialogData(): void {
    this.dialogData$.pipe(debounceTime(200), takeUntil(this.componentDestroy())).subscribe((data) => {
      this.departmentId = data.departmentId;

      this.regions = [{ name: data.regionName, id: data.regionId }];
      this.locations = [{ name: data.locationName, id: data.locationId }];
      this.departments = [{ name: data.departmentName, id: data.departmentId }];

      if (this.departmentId) {
        this.populateForm(data);
        this.disableControls();
      }
    });
  }

  private populateForm(formData: DepartmentAssigned): void {
    const { regionId, locationId, departmentId, startDate } = formData;

    this.assignDepartmentForm.patchValue({
      region: regionId,
      location: locationId,
      department: departmentId,
      startDate: startDate,
      endDate: null,
      oriented: true,
      homeCostCenter: false,
    });

    this.cdr.markForCheck();
  }

  private disableControls(): void {
    this.assignDepartmentForm.get('region')?.disable();
    this.assignDepartmentForm.get('location')?.disable();
    this.assignDepartmentForm.get('department')?.disable();
  }

  private saveFormData(): void {
    this.saveForm$.pipe(takeUntil(this.componentDestroy())).subscribe(() => {
      if (this.assignDepartmentForm.invalid) {
        this.assignDepartmentForm.markAllAsTouched();
        this.cdr.markForCheck();
      } else {
        const formData = this.assignDepartmentForm.getRawValue();

        if (this.departmentId) {
          this.departmentService
            .editAssignedDepartments(formData, [this.departmentId])
            .pipe(takeUntil(this.componentDestroy()))
            .subscribe(() => {
              this.resetAssignDepartmentForm();
              this.departmentId = null;
              this.store.dispatch(new ShowSideDialog(false));
            });
        } else {
          this.departmentService
            .assignNewDepartment(formData)
            .pipe(takeUntil(this.componentDestroy()))
            .subscribe(() => {
              this.resetAssignDepartmentForm();
              this.store.dispatch(new ShowSideDialog(false));
            });
        }
      }
    });
  }
}
