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
import { Validators } from '@angular/forms';

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

import { ShowSideDialog, ShowToast } from 'src/app/store/app.actions';
import {
  AssignDepartmentFormState,
  AssignDepartmentHierarchy,
  DateRanges,
  DepartmentAssigned,
  DepartmentPayload,
} from '../departments.model';
import { DepartmentsService } from '../services/departments.service';
import { OrganizationRegion, OrganizationLocation, OrganizationDepartment } from '@shared/models/organization.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFormService } from '../services/department-form.service';
import { OptionFields } from '@client/order-management/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { RECORD_ADDED, RECORD_MODIFIED } from '@shared/constants';
import { CustomFormGroup } from '@core/interface';
import { departmentName } from '../helpers/department.helper';
import { findSelectedItems } from '@core/helpers';
import { mapperSelectedItems } from '@shared/components/tiers-dialog/helper';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';

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
  @Input() public dateRanges: DateRanges;

  @Output() public refreshGrid: EventEmitter<void> = new EventEmitter();

  public assignDepartmentForm: CustomFormGroup<AssignDepartmentFormState>;
  public dataSource: AssignDepartmentHierarchy = {
    regions: [],
    locations: [],
    departments: [],
  };

  public readonly departmentFields = OptionFields;
  public departmentId?: number | null = null;
  public isOriented$: Subject<boolean> = new Subject();
  public sortOrder: SortOrder = SortOrder.ASCENDING;

  public constructor(
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
    this.adjustOrientationDateField();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['departmentHierarchy']?.currentValue) {
      this.dataSource.regions = this.departmentHierarchy;
    }
  }

  public orientedChecked(event: boolean): void {
    this.isOriented$.next(event);
    this.assignDepartmentForm.markAsDirty();
  }

  public toggleChecked(): void {
    this.assignDepartmentForm.markAsDirty();
  }

  private initForm(): void {
    this.assignDepartmentForm = this.departmentFormService.createAssignDepartmentForm();
  }

  private subscribeOnDialogData(): void {
    this.dialogData$.pipe(debounceTime(200), takeUntil(this.destroy$)).subscribe((data) => {
      this.departmentId = data?.id;

      if (data && this.departmentId) {
        this.dataSource.regions = [{ name: data.regionName, id: data.regionId } as OrganizationRegion];
        this.dataSource.locations = [{ name: data.locationName, id: data.locationId } as OrganizationLocation];
        this.dataSource.departments = [
          {
            name: departmentName(data.departmentName, data.extDepartmentId),
            id: data.departmentId,
          } as OrganizationDepartment,
        ];
        this.isOriented$.next(data.isOriented);
        this.departmentFormService.patchForm(this.assignDepartmentForm, data);
        this.disableControls();
      } else {
        this.resetAssignDepartmentForm();
      }
      this.cdr.markForCheck();
    });
  }

  private disableControls(): void {
    const controlNames = ['regionIds', 'locationIds', 'departmentIds'];
    this.departmentFormService.disableControls(this.assignDepartmentForm, controlNames);
  }

  private saveFormData(): void {
    this.saveForm$
      .pipe(
        switchMap(() => {
          const formValid = this.assignDepartmentForm.valid;
          if (!formValid) {
            this.assignDepartmentForm.markAllAsTouched();
            this.cdr.markForCheck();
          }
          return formValid ? this.saveAssignedDepartment() : of(formValid);
        }),
        filter(Boolean),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.resetAssignDepartmentForm();
        const MESSAGE = this.departmentId ? RECORD_MODIFIED : RECORD_ADDED;
        this.store.dispatch([new ShowSideDialog(false), new ShowToast(MessageTypes.Success, MESSAGE)]);
        this.departmentId = null;
        this.refreshGrid.emit();
      });
  }

  private saveAssignedDepartment(): Observable<DepartmentPayload> {
    const formData = this.assignDepartmentForm.getRawValue();

    if (this.departmentId) {
      return this.departmentService.editAssignedDepartments(formData, [this.departmentId]);
    } else {
      return this.departmentService.assignNewDepartment(formData);
    }
  }

  private watchForControlsValueChanges(): void {
    this.assignDepartmentForm
      .get('regionIds')
      ?.valueChanges.pipe(
        filter(() => !this.departmentId),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        const selectedRegions: OrganizationRegion[] = value?.length ? findSelectedItems(value, this.departmentHierarchy) : [];
        this.dataSource.locations = mapperSelectedItems(selectedRegions, 'locations');
        this.departmentFormService.resetControls(this.assignDepartmentForm, ['locationId', 'departmentId']);
        this.cdr.markForCheck();
      });

    this.assignDepartmentForm
      .get('locationIds')
      ?.valueChanges.pipe(
        filter(() => !this.departmentId),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((value) => {
        this.departmentFormService.resetControls(this.assignDepartmentForm, ['departmentId']);
        const selectedLocations: OrganizationLocation[] = value?.length ? findSelectedItems(value, this.dataSource.locations) : [];
        const departments = mapperSelectedItems(selectedLocations, 'departments') as OrganizationDepartment[];
        this.dataSource.departments = departments.map((department) => ({
          ...department,
          name: departmentName(department.name, department.extDepartmentId ?? ''),
        }));
        this.cdr.markForCheck();
      });

    this.assignDepartmentForm
      .get('departmentIds')
      ?.valueChanges.pipe(
        filter(() => !this.departmentId),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.cdr.markForCheck());
  }

  private resetAssignDepartmentForm(): void {
    this.assignDepartmentForm.reset();
    this.assignDepartmentForm.enable();
    this.assignDepartmentForm.get('startDate')?.setValue(new Date());
    this.isOriented$.next(false);
    this.departmentId = null;
    this.cdr.markForCheck();
  }

  private adjustOrientationDateField(): void {
    this.isOriented$.pipe(takeUntil(this.destroy$)).subscribe((isOriented) => {
      const orientationDateControl = this.assignDepartmentForm.get('orientationDate');
      this.departmentFormService.addRemoveValidator(orientationDateControl, isOriented);
      this.cdr.markForCheck();
    });
  }
}
