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
  DepartmentDialogState,
  DepartmentPayload,
} from '../departments.model';
import { DepartmentsService } from '../services/departments.service';
import { OrganizationRegion, OrganizationLocation, OrganizationDepartment } from '@shared/models/organization.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { DepartmentFormService } from '../services/department-form.service';
import { OptionFields } from '@client/order-management/constants';
import { MessageTypes } from '@shared/enums/message-types';
import { EDIT_ASSIGNED_DEPARTMENTS_DATES_TEXT, RECORD_ADDED, RECORD_MODIFIED, WARNING_TITLE } from '@shared/constants';
import { CustomFormGroup } from '@core/interface';
import { departmentName } from '../helpers/department.helper';
import { DateTimeHelper, findSelectedItems } from '@core/helpers';
import { mapperSelectedItems } from '@shared/components/tiers-dialog/helper';
import { SortOrder } from '@shared/enums/sort-order-dropdown.enum';
import { ConfirmService } from '@shared/services/confirm.service';
import { getIRPOrgItems } from '@core/helpers/org-structure.helper';

@Component({
  selector: 'app-assign-department',
  templateUrl: './assign-department.component.html',
  styleUrls: ['./assign-department.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignDepartmentComponent extends DestroyableDirective implements OnInit, OnChanges {
  @Input() public dialogData$: BehaviorSubject<DepartmentDialogState>;
  @Input() public saveForm$: Subject<boolean>;
  @Input() public departmentHierarchy: OrganizationRegion[];
  @Input() public dateRanges: DateRanges;

  @Output() public refreshGrid: EventEmitter<void> = new EventEmitter();

  public assignDepartmentForm: CustomFormGroup<AssignDepartmentFormState>;
  public isOpen = false;
  public dataSource: AssignDepartmentHierarchy = {
    regions: [],
    locations: [],
    departments: [],
  };

  public minDate: Date | undefined;
  public maxDate: Date | undefined;
  public readonly departmentFields = OptionFields;
  public departmentId?: number | null = null;
  public isOriented$: Subject<boolean> = new Subject();
  public sortOrder: SortOrder = SortOrder.ASCENDING;
  public disableToggles = false;
  public allRecords: Record<string, boolean> = {
    regionIds: false,
    locationIds: false,
    departmentIds: false,
  };
  public deptdatas : any;

  public constructor(
    private readonly cdr: ChangeDetectorRef,
    private readonly departmentService: DepartmentsService,
    private readonly departmentFormService: DepartmentFormService,
    private readonly store: Store,
    private readonly confirmService: ConfirmService,
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
      this.disableToggles = !this.dataSource.regions.length;
      this.deptdatas = mapperSelectedItems(mapperSelectedItems(this.dataSource.regions, 'locations'), 'departments');
      if (this.deptdatas.length == 0) {
        this.disableToggles = true;
        this.dataSource.regions = [];
      } else {
        this.disableToggles = false;
      }
      this.cdr.markForCheck();
    }

    if (changes['dateRanges']?.currentValue) {
      this.setMinMaxDateRange(this.dateRanges);
    }
  }

  public orientedChecked(event: boolean): void {
    this.isOriented$.next(event);
    this.assignDepartmentForm.markAsDirty();
  }

  public toggleChecked(): void {
    this.assignDepartmentForm.markAsDirty();
  }

  public allRegionsChange(event: boolean): void {
    this.toggleChecked();
    this.allRecords['regionIds'] = event;
    const regionsControl = this.assignDepartmentForm.get('regionIds');
    if (this.allRecords['regionIds']) {
      this.dataSource.locations = mapperSelectedItems(this.departmentHierarchy, 'locations');
      regionsControl?.setValue(null, { emitEvent: false });
      regionsControl?.disable();
    } else {
      regionsControl?.enable();
      this.dataSource.locations = [];
      this.dataSource.departments = [];
      this.allRecords['locationIds'] = false;
      this.allRecords['departmentIds'] = false;
      const controlNames = ['locationIds', 'departmentIds'];
      this.departmentFormService.enableControls(this.assignDepartmentForm, controlNames);
      this.departmentFormService.resetControls(this.assignDepartmentForm, controlNames);
    }
  }

  public allLocationsChange(event: boolean): void {
    this.toggleChecked();
    this.allRecords['locationIds'] = event;
    if (this.allRecords['locationIds']) {
      this.dataSource.departments = mapperSelectedItems(this.dataSource.locations, 'departments');
      const locationControl = this.assignDepartmentForm.get('locationIds');
      locationControl?.setValue(null, { emitEvent: false });
      locationControl?.disable();
    } else {
      this.dataSource.departments = [];
      this.allRecords['departmentIds'] = false;
      this.departmentFormService.enableControls(this.assignDepartmentForm, ['locationIds', 'departmentIds']);
      this.departmentFormService.resetControls(this.assignDepartmentForm, ['departmentIds']);
    }
  }

  public allDepartmentsChange(event: boolean): void {
    this.toggleChecked();
    this.allRecords['departmentIds'] = event;
    const departmentControl = this.assignDepartmentForm.get('departmentIds');
    if (this.allRecords['departmentIds']) {
      departmentControl?.setValue(null, { emitEvent: false });
      departmentControl?.disable();
    } else {
      departmentControl?.enable();
    }
  }

  private initForm(): void {
    this.assignDepartmentForm = this.departmentFormService.createAssignDepartmentForm();
  }

  private subscribeOnDialogData(): void {
    this.dialogData$
      .pipe(
        debounceTime(50),
        takeUntil(this.destroy$)
      )
      .subscribe(({ data, isOpen }) => {
        this.departmentId = data?.id;
        this.isOpen = isOpen;

        if (!data && isOpen) {
          this.setMinMaxDateRange(this.dateRanges);
        } else if (data && this.departmentId) {
          this.setupDialogState(data);
          this.setDataSource(data);
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
        this.isOpen = false;
        this.departmentId = null;
        this.refreshGrid.emit();
      });
  }

  private editDepartmentHandler(): Observable<boolean> {
    return this.confirmService.confirm(EDIT_ASSIGNED_DEPARTMENTS_DATES_TEXT, {
      title: WARNING_TITLE,
      okButtonLabel: 'Yes',
      okButtonClass: 'ok-button',
    });
  }

  private saveAssignedDepartment(): Observable<DepartmentPayload> {
    const formData = this.assignDepartmentForm.getRawValue();

    if (this.departmentId) {
      // Show pop up if start | end | orientation are changed
      if (
            this.assignDepartmentForm.controls['startDate'].dirty ||
            this.assignDepartmentForm.controls['endDate'].dirty ||
            this.assignDepartmentForm.controls['orientationDate'].dirty
         ) {
              return this.editDepartmentHandler().pipe(
                filter(Boolean),
                switchMap(() => {
                  return this.departmentService.editAssignedDepartments(formData, [this.departmentId as number]);
                }));
           } else {
            return this.departmentService.editAssignedDepartments(formData, [this.departmentId]);
           }
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
        const selectedRegions: OrganizationRegion[] = value?.length
          ? findSelectedItems(value, this.departmentHierarchy)
          : [];
        this.dataSource.locations = getIRPOrgItems(mapperSelectedItems(selectedRegions, 'locations'));
        this.departmentFormService.resetControls(this.assignDepartmentForm, ['locationIds', 'departmentIds']);
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
        this.departmentFormService.resetControls(this.assignDepartmentForm, ['departmentIds']);
        const selectedLocations: OrganizationLocation[] = value?.length
          ? findSelectedItems(value, this.dataSource.locations)
          : [];
        const departments = getIRPOrgItems(
          mapperSelectedItems(selectedLocations, 'departments') as OrganizationDepartment[]
        );
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
    this.allRecords['regionIds'] = false;
    this.allRecords['locationIds'] = false;
    this.allRecords['departmentIds'] = false;
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

  private setMinMaxDateRange({ min, max }: DateRanges): void {
    this.minDate = min;
    this.maxDate = max;
  }

  private setupDialogState(data: DepartmentAssigned): void {
    const { workCommitmentStartDate, workCommitmentEndDate } = data;
    const minDate = workCommitmentStartDate
      ? DateTimeHelper.convertDateToUtc(workCommitmentStartDate)
      : undefined;
    const maxDate = workCommitmentEndDate
      ? DateTimeHelper.convertDateToUtc(workCommitmentEndDate)
      : undefined;
    this.setMinMaxDateRange({ min: minDate, max: maxDate });
  }

  private setDataSource(data: DepartmentAssigned): void {
    this.dataSource.regions = [{ name: data.regionName, id: data.regionId } as OrganizationRegion];
    this.dataSource.locations = [{ name: data.locationName, id: data.locationId } as OrganizationLocation];
    this.dataSource.departments = [
      {
        name: departmentName(data.departmentName, data.extDepartmentId),
        id: data.departmentId,
      } as OrganizationDepartment,
    ];
  }
}
