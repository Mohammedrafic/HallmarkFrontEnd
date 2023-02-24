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
import {
  BehaviorSubject,
  debounceTime,
  filter,
  Subject,
  takeUntil,
  distinctUntilChanged,
  switchMap,
  Observable,
  of,
} from 'rxjs';

import { ShowSideDialog } from 'src/app/store/app.actions';
import {
  AssignDepartmentHierarchy,
  AssignNewDepartment,
  DepartmentAssigned,
  EditAssignedDepartment,
} from '../departments.model';
import { DepartmentsService } from '../services/departments.service';
import { OrganizationRegion, OrganizationLocation, OrganizationDepartment } from '@shared/models/organization.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFormService } from '../services/department-form.service';
import { OptionFields } from '@client/order-management/constants';
import { ConfirmService } from '@shared/services/confirm.service';
import { ASSIGN_HOME_COST_CENTER, WARNING_TITLE } from '@shared/constants';

@Component({
  selector: 'app-assign-department',
  templateUrl: './assign-department.component.html',
  styleUrls: ['./assign-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignDepartmentComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public dialogData$: BehaviorSubject<DepartmentAssigned | null>;
  @Input() public saveForm$: Subject<boolean>;
  @Input() public departmentHierarchy: OrganizationRegion[];

  @Output() public refreshGrid: EventEmitter<void> = new EventEmitter();

  public assignDepartmentForm: FormGroup;
  public dataSource: AssignDepartmentHierarchy = {
    regions: [],
    locations: [],
    departments: [],
  };

  public readonly departmentFields = OptionFields;

  private departmentId?: number | null = null;

  public constructor(
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly departmentService: DepartmentsService,
    private readonly departmentFormService: DepartmentFormService,
    private readonly confirmService: ConfirmService,
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
      this.dataSource.regions = this.departmentHierarchy;
    }
  }

  public resetAssignDepartmentForm(): void {
    this.assignDepartmentForm.reset();
    this.assignDepartmentForm.enable();
    this.dataSource.regions = this.departmentHierarchy;
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
      this.dataSource.regions = [{ name: data.regionName, id: data.regionId } as OrganizationRegion];
      this.dataSource.locations = [{ name: data.locationName, id: data.locationId } as OrganizationLocation];
      this.dataSource.departments = [{ name: data.departmentName, id: data.departmentId } as OrganizationDepartment];

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
    this.saveForm$
      .pipe(
        switchMap(() => {
          const formInvalid = this.assignDepartmentForm.invalid;
          const { homeCostCenter } = this.assignDepartmentForm.getRawValue();
          const hasHomeCostCenter = true;
          if (formInvalid) {
            this.assignDepartmentForm.markAllAsTouched();
            this.cdr.markForCheck();
            return of(false);
          }
          if (hasHomeCostCenter && homeCostCenter) {
            return this.handleHomeCostCenter();
          }
          return of(true);
        }),
        switchMap((formValid) => (formValid ? this.saveAssignedDepartment() : of(formValid))),
        takeUntil(this.destroy$)
      )
      .subscribe((success) => {
        if (success) {
          this.resetAssignDepartmentForm();
          this.departmentId = null;
          this.store.dispatch(new ShowSideDialog(false));
          this.refreshGrid.emit();
        }
      });
  }

  private handleHomeCostCenter(): Observable<boolean> {
    return this.confirmService
      .confirm(ASSIGN_HOME_COST_CENTER, {
        title: WARNING_TITLE,
        okButtonLabel: 'Yes',
        okButtonClass: 'ok-button',
      })
      .pipe(filter(Boolean));
  }

  private saveAssignedDepartment(): Observable<AssignNewDepartment | EditAssignedDepartment> {
    const formData = this.assignDepartmentForm.getRawValue();

    if (this.departmentId) {
      return this.departmentService.editAssignedDepartments(formData, [this.departmentId]);
    } else {
      return this.departmentService.assignNewDepartment(formData);
    }
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
        const selectedRegion = (this.dataSource.regions as OrganizationRegion[]).find((region) => region.id === value);
        this.dataSource.locations = selectedRegion?.locations ?? [];
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
        const selectedLocation = (this.dataSource.locations as OrganizationLocation[]).find(
          (location) => location.id === value
        );
        this.dataSource.departments = selectedLocation?.departments ?? [];
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
