import {
  EventEmitter,
  Output,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Input,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngxs/store';
import { BehaviorSubject, debounceTime, filter, Subject, takeUntil, distinctUntilChanged } from 'rxjs';

import { ShowSideDialog } from 'src/app/store/app.actions';
import { DepartmentAssigned } from '../departments.model';
import { DepartmentsService } from '../services/departments.service';
import { OrganizationRegion, OrganizationLocation, OrganizationDepartment } from '@shared/models/organization.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFormService } from '../services/department-form.service';
import { change } from '@syncfusion/ej2-angular-grids';

@Component({
  selector: 'app-assign-department',
  templateUrl: './assign-department.component.html',
  styleUrls: ['./assign-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignDepartmentComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public dialogData$: BehaviorSubject<DepartmentAssigned | null>;
  @Input() public saveForm$: Subject<boolean>;
  @Input() public employeeWorkCommitmentId: number;
  @Input() public departmentHierarchy: OrganizationRegion[];

  @Output() public refreshGrid: EventEmitter<void> = new EventEmitter();

  public assignDepartmentForm: FormGroup;
  public regions: OrganizationRegion[] = [];
  public locations: OrganizationLocation[] = [];
  public departments: OrganizationDepartment[] = [];

  public readonly departmentFields = {
    text: 'name',
    value: 'id',
  };

  private departmentId?: number | null = null;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly departmentService: DepartmentsService,
    private readonly departmentFormService: DepartmentFormService,
    private readonly store: Store
  ) {
    super();
  }

  public ngOnInit(): void {
    this.initForm();
    this.subscribeOnDialogData();
    this.saveFormData();
    this.watchForControlsValueChanges();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['departmentHierarchy'].currentValue) {
      this.regions = this.departmentHierarchy;
    }
  }

  public resetAssignDepartmentForm(): void {
    this.assignDepartmentForm.reset();
    this.assignDepartmentForm.enable();
    this.regions = this.departmentHierarchy;
    this.cdr.markForCheck();
  }

  private initForm(): void {
    this.assignDepartmentForm = this.formBuilder.group({
      regionId: [null, [Validators.required]],
      locationId: [null, [Validators.required]],
      departmentId: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null],
      isOriented: [null],
      homeCostCenter: [null],
    });
  }

  private subscribeOnDialogData(): void {
    this.dialogData$.pipe(filter(Boolean), debounceTime(200), takeUntil(this.destroy$)).subscribe((data) => {
      this.departmentId = data.id;
      this.regions = [{ name: data.regionName, id: data.regionId } as OrganizationRegion];
      this.locations = [{ name: data.locationName, id: data.locationId } as OrganizationLocation];
      this.departments = [{ name: data.departmentName, id: data.departmentId } as OrganizationDepartment];

      if (this.departmentId) {
        this.departmentFormService.patchForm(this.assignDepartmentForm, data);
        this.disableControls();
      }
      this.cdr.markForCheck();
    });
  }

  private disableControls(): void {
    const controlNames = ['regionId', 'locationId', 'departmentId'];
    this.departmentFormService.disableControls(this.assignDepartmentForm, controlNames);
  }

  private saveFormData(): void {
    this.saveForm$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.assignDepartmentForm.invalid) {
        this.assignDepartmentForm.markAllAsTouched();
        this.cdr.markForCheck();
      } else {
        const formData = {
          ...this.assignDepartmentForm.getRawValue(),
          employeeWorkCommitmentId: this.employeeWorkCommitmentId,
        };

        if (this.departmentId) {
          this.departmentService
            .editAssignedDepartments(formData, [this.departmentId])
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.resetAssignDepartmentForm();
              this.departmentId = null;
              this.store.dispatch(new ShowSideDialog(false));
              this.refreshGrid.emit();
            });
        } else {
          this.departmentService
            .assignNewDepartment(formData)
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.resetAssignDepartmentForm();
              this.store.dispatch(new ShowSideDialog(false));
              this.refreshGrid.emit();
            });
        }
      }
    });
  }

  private watchForControlsValueChanges(): void {
    this.assignDepartmentForm
      .get('regionId')
      ?.valueChanges.pipe(
        filter(() => !this.departmentId),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.departmentFormService.resetControls(this.assignDepartmentForm, ['locationId', 'departmentId']);
        const selectedRegion = (this.regions as OrganizationRegion[]).find((region) => region.id === value);
        this.locations = selectedRegion?.locations ?? [];
        this.cdr.markForCheck();
      });

    this.assignDepartmentForm
      .get('locationId')
      ?.valueChanges.pipe(
        filter(() => !this.departmentId),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.departmentFormService.resetControls(this.assignDepartmentForm, ['departmentId']);
        const selectedLocation = (this.locations as OrganizationLocation[]).find((location) => location.id === value);
        this.departments = selectedLocation?.departments ?? [];
        this.cdr.markForCheck();
      });

    this.assignDepartmentForm
      .get('departmentId')
      ?.valueChanges.pipe(
        filter(() => !this.departmentId),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.cdr.markForCheck());
  }
}
