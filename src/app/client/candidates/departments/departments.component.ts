import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Select, Store } from '@ngxs/store';
import {
  BehaviorSubject,
  filter,
  Observable,
  Subject,
  switchMap,
  take,
  takeUntil,
  distinctUntilChanged,
  map,
} from 'rxjs';

import { CandidateTabsEnum } from '@client/candidates/enums';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { DepartmentsService } from '@client/candidates/departments/services/departments.service';
import { SideDialogTitleEnum } from '@client/candidates/departments/side-dialog-title.enum';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import {
  DateRanges,
  DepartmentAssigned,
  DepartmentConditions,
  DepartmentDialogState,
  DepartmentFilterState,
  DepartmentsPage,
} from '@client/candidates/departments/departments.model';
import { ShowFilterDialog, ShowSideDialog, ShowToast } from '../../../store/app.actions';
import {
  ALL_DEPARTMENTS_SELECTED,
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  DELETE_MULTIPLE_RECORDS_TEXT,
  DELETE_RECORD_TEXT,
  DELETE_RECORD_TITLE,
  formatDate,
  NO_ACTIVE_WORK_COMMITMET,
  RECORD_DELETE,
} from '@shared/constants';
import { columnDef } from '@client/candidates/departments/grid/column-def.constant';
import { AssignDepartmentComponent } from './assign-department/assign-department.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { OrganizationRegion, OrganizationStructure } from '@shared/models/organization.model';
import { AbstractPermission } from '@shared/helpers/permissions';
import { EditDepartmentsComponent } from './edit-departments/edit-departments.component';
import { MessageTypes } from '@shared/enums/message-types';
import { CandidateWorkCommitmentShort } from '../interface/employee-work-commitments.model';
import { DateTimeHelper } from '@core/helpers';
import { UserState } from 'src/app/store/user.state';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent extends AbstractPermission implements OnInit {
  @ViewChild('assignDepartment') private assignDepartment: AssignDepartmentComponent;
  @ViewChild('editDepartments') private editDepartments: EditDepartmentsComponent;

  @Select(UserState.organizationStructure)
  private readonly organizationStructure$: Observable<OrganizationStructure>;

  public readonly buttonType: typeof ButtonTypeEnum = ButtonTypeEnum;
  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;
  public readonly sideDialogTitleEnum: typeof SideDialogTitleEnum = SideDialogTitleEnum;
  public readonly dialogData$: BehaviorSubject<DepartmentDialogState> =
    new BehaviorSubject<DepartmentDialogState>({ data: null, isOpen: false });
  public readonly saveForm$: Subject<boolean> = new Subject();
  public readonly bulkActionConfig: BulkActionConfig = {
    edit: true,
    delete: true,
  };

  public columnDef: ColumnDefinitionModel[];
  public dateRanges: DateRanges = {};

  public departmentsAssigned: DepartmentsPage;
  public selectedTab$: Observable<CandidateTabsEnum>;
  public sideDialogTitle$: Observable<string>;
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public selectedDepartments: number[] | null;
  public departmentHierarchy: OrganizationRegion[] = [];
  public filtersAmount = 0;
  public assignDepTooltipMsg = ALL_DEPARTMENTS_SELECTED;
  public toggleTooltipMsg = NO_ACTIVE_WORK_COMMITMET;
  public conditions: DepartmentConditions = {
    showAllDepartments: false,
    noActiveWC: false,
    disableBulkButton: false,
  };

  private filters: DepartmentFilterState | null;

  public constructor(
    protected override store: Store,
    private candidatesService: CandidatesService,
    private departmentsService: DepartmentsService,
    private datePipe: DatePipe,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {
    super(store);
  }

  public override ngOnInit(): void {
    super.ngOnInit();
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
    this.sideDialogTitle$ = this.departmentsService.getSideDialogTitle$();
    this.getActiveEmployeeWorkCommitment();
    this.getDepartmentsAssigned();
    this.getUserPermission();
  }

  public showAssignDepartmentDialog(): void {
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.AssignDepartment);
    this.showSideDialog(true);
    this.dialogData$.next({ data: null, isOpen: true });
    this.getAssignedDepartmentHierarchy();
  }

  public onSave(): void {
    this.saveForm$.next(true);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onCancel(): void {
    if (this.assignDepartment?.assignDepartmentForm.dirty || this.editDepartments?.formGroup.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter(Boolean), take(1))
        .subscribe(() => {
          this.assignDepartment?.assignDepartmentForm.reset();
          this.editDepartments?.formGroup.reset();
          this.showSideDialog(false);
          this.dialogData$.next({ data: null, isOpen: false });
        });
    } else {
      this.showSideDialog(false);
      this.dialogData$.next({ data: null, isOpen: false });
    }
  }

  public updateTableByFilters(filters: DepartmentFilterState): void {
    this.filters = filters;
    this.getDepartmentsWithFilters(this.filters);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public resetFilters(): void {
    this.clearFilterState();
    this.getDepartmentsWithFilters(this.filters);
  }

  public handleBulkEvent(event: BulkActionDataModel): void {
    const selectedAll = this.departmentsAssigned.totalCount === event.items.length;
    this.selectedDepartments = selectedAll ? null : event.items.map((item) => item.data.id);

    if (event.type === BulkTypeAction.EDIT) {
      this.editDepartments?.resetEditDepartmentForm();
      this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.EditBulkDepartments);
      this.showSideDialog(true);
      return;
    }
    if (event.type === BulkTypeAction.DELETE) {
      this.deleteAssignedDepartments(this.selectedDepartments, true);
      return;
    }
  }

  public refreshGrid(): void {
    this.getDepartmentsWithFilters(this.filters);
  }

  public applyFiltersAmount(event: number): void {
    this.filtersAmount = event;
  }

  public showHideActiveDepartments(event: boolean): void {
    this.conditions.showAllDepartments = event;
    this.departmentsService.showAllDepartments = this.conditions.showAllDepartments;
    this.getDepartmentsWithFilters(this.filters);
  }

  private showSideDialog(isOpen: boolean): void {
    this.store.dispatch(new ShowSideDialog(isOpen));
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, formatDate);
  }

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format, 'UTC') ?? '';
  }

  // Get new data if departments tab will be selected
  private getDepartmentsAssigned(): void {
    this.candidatesService
      .getSelectedTab$()
      .pipe(
        filter((tab) => tab === CandidateTabsEnum.Departments),
        switchMap(() => this.candidatesService.getEmployeeWorkCommitments()),
        switchMap((commitment) => {
          this.conditions.showAllDepartments = !(commitment && commitment.id);
          this.conditions.noActiveWC = this.conditions.showAllDepartments;
          this.departmentsService.showAllDepartments = this.conditions.showAllDepartments;
          return this.departmentsService.getDepartmentsAssigned();
        }),
        takeUntil(this.componentDestroy())
      )
      .subscribe((departments) => {
        this.clearFilterState();
        this.updateGridState(departments);
      });
  }

  private getDepartmentsWithFilters(filters: DepartmentFilterState | null): void {
    this.departmentsService
      .getDepartmentsAssigned(filters)
      .pipe(take(1))
      .subscribe((departments) => {
        this.updateGridState(departments);
      });
  }

  private updateGridState(departments: DepartmentsPage): void {
    this.departmentsAssigned = departments;
    this.cdr.markForCheck();
  }

  private editAssignedDepartment(department: DepartmentAssigned): void {
    this.showSideDialog(true);
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.EditAssignDepartment);
    this.dialogData$.next({ data: department, isOpen: true });
  }

  private deleteAssignedDepartments(departmentIds: number[] | null, isBulkAction?: boolean): void {
    const text = isBulkAction ? DELETE_MULTIPLE_RECORDS_TEXT : DELETE_RECORD_TEXT;
    const filters = isBulkAction ? this.filters : null;
    this.confirmService
      .confirm(text, {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: DELETE_RECORD_TITLE,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.departmentsService.deleteAssignedDepartments(departmentIds, filters)),
        switchMap(() => this.departmentsService.getDepartmentsAssigned(this.filters)),
        take(1)
      )
      .subscribe((departments) => {
        this.updateGridState(departments);
        this.store.dispatch(new ShowToast(MessageTypes.Success, RECORD_DELETE));
      });
  }

  private getAssignedDepartmentHierarchy(): void {
    this.organizationStructure$
      .pipe(takeUntil(this.componentDestroy()))
      .subscribe((data) => {
        this.departmentHierarchy = data.regions;
        this.cdr.markForCheck();
      });
  }

  private getActiveEmployeeWorkCommitment(): void {
    this.candidatesService
      .getActiveWorkCommitmentStream()
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((employeeWorkCommitment) => {
        this.departmentsService.employeeWorkCommitmentId = employeeWorkCommitment.id;
        this.setDateRanges(employeeWorkCommitment);
      });
  }

  private getUserPermission(): void {
    this.getPermissionStream()
      .pipe(
        map((permission) => permission[this.userPermissions.ManageIrpCandidateProfile]),
        distinctUntilChanged(),
        takeUntil(this.componentDestroy())
      )
      .subscribe((canManageIrpCandidateProfile) => {
        this.conditions.disableBulkButton = !canManageIrpCandidateProfile;
        this.initColumnDefinitions(!canManageIrpCandidateProfile);
      });
  }

  private initColumnDefinitions(disableActions: boolean): void {
    this.columnDef = columnDef({
      editHandler: this.editAssignedDepartment.bind(this),
      deleteHandler: this.deleteAssignedDepartments.bind(this),
      dateFormatter: this.getFormattedDate.bind(this),
      disable: disableActions,
    });
  }

  private setDateRanges(employeeWorkCommitment: CandidateWorkCommitmentShort): void {
    const { startDate, endDate } = employeeWorkCommitment;

    this.dateRanges.max = endDate ? DateTimeHelper.convertDateToUtc(endDate) : undefined;
    this.dateRanges.min = startDate ? DateTimeHelper.convertDateToUtc(startDate) : undefined;
    this.cdr.markForCheck();
  }

  private clearFilterState(): void {
    this.filtersAmount = 0;
    this.filters = null;
  }
}
