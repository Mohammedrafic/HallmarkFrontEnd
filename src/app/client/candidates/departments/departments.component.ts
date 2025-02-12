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
import { RowNode } from '@ag-grid-community/core';

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
  BULK_RECORD_DELETE,
  DELETE_CONFIRM_TEXT,
  DELETE_CONFIRM_TITLE,
  formatDate,
  GRID_CONFIG,
  NO_ACTIVE_WORK_COMMITMET,
  RECORD_DELETE,
} from '@shared/constants';
import { columnDef } from '@client/candidates/departments/grid/column-def.constant';
import { AssignDepartmentComponent } from './assign-department/assign-department.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { OrganizationRegion } from '@shared/models/organization.model';
import { AbstractPermission } from '@shared/helpers/permissions';
import { EditDepartmentsComponent } from './edit-departments/edit-departments.component';
import { MessageTypes } from '@shared/enums/message-types';
import { CandidateWorkCommitmentShort } from '../interface/employee-work-commitments.model';
import { DateTimeHelper, allAreEqual } from '@core/helpers';
import { AppState } from 'src/app/store/app.state';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent extends AbstractPermission implements OnInit {
  @ViewChild('assignDepartment') private assignDepartment: AssignDepartmentComponent;
  @ViewChild('editDepartments') private editDepartments: EditDepartmentsComponent;

  @Select(AppState.isMobileScreen)
  public readonly isMobile$: Observable<boolean>;

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
  public bulkDateRanges: DateRanges = {};

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
  public filters: DepartmentFilterState = { pageNumber: GRID_CONFIG.initialPage, pageSize: GRID_CONFIG.initialRowsPerPage };

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
    this.filters = { ...filters, pageNumber: GRID_CONFIG.initialPage, pageSize: this.filters.pageSize };
    this.getDepartmentsWithFilters(this.filters);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public resetFilters(): void {
    this.clearFilterState();
    this.getDepartmentsWithFilters(this.filters);
  }

  public handleBulkEvent(event: BulkActionDataModel): void {
    const selectedAll = this.departmentsAssigned.totalCount === event.items.length;
    this.setBulkDateRanges(event.items);
    this.selectedDepartments = selectedAll ? null : event.items.map((item) => item.data.id);

    if (event.type === BulkTypeAction.EDIT) {
      this.editDepartments?.resetEditDepartmentForm();
      this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.EditBulkDepartments);
      this.showSideDialog(true);
      return;
    }
    if (event.type === BulkTypeAction.DELETE) {
      this.deleteAssignedDepartments(this.selectedDepartments, true);
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
    this.filters.pageNumber = GRID_CONFIG.initialPage;
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
          return this.departmentsService.getDepartmentsAssigned(this.filters);
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
    const text = isBulkAction
      ? 'Are you sure you want to remove these departments?'
      : 'Are you sure you want to remove this department?';
    const filters = isBulkAction ? this.filters : null;
    this.confirmService
      .confirm(text, {
        okButtonLabel: 'Remove',
        okButtonClass: 'delete-button',
        title: isBulkAction ? 'Remove Departments' : 'Remove Department',
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.departmentsService.deleteAssignedDepartments(departmentIds, filters)),
        switchMap(() => this.departmentsService.getDepartmentsAssigned(this.filters)),
        take(1)
      )
      .subscribe((departments) => {
        const message = isBulkAction ? BULK_RECORD_DELETE : RECORD_DELETE;
        this.updateGridState(departments);
        this.store.dispatch(new ShowToast(MessageTypes.Success, message));
      });
  }

  private getAssignedDepartmentHierarchy(): void {
    this.departmentsService
      .getAssignedDepartmentHierarchy(this.departmentsService.employeeWorkCommitmentId)
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

    this.dateRanges.max = endDate ? DateTimeHelper.setCurrentTimeZone(endDate) : undefined;
    this.dateRanges.min = startDate ? DateTimeHelper.setCurrentTimeZone(startDate) : undefined;
    this.cdr.markForCheck();
  }

  private clearFilterState(): void {
    this.filtersAmount = 0;
    this.filters = { pageNumber: GRID_CONFIG.initialPage, pageSize: this.filters.pageSize };
  }

  private setBulkDateRanges(selectedRows: RowNode[]): void {
    const startDates: string[] = [];
    const endDates: string[] = [];
    const employeeWorkCommitmentIds: number[] = [];

    selectedRows.forEach((item) => {
      const { workCommitmentStartDate, workCommitmentEndDate, employeeWorkCommitmentId } = item.data;

      if (workCommitmentStartDate) {
        startDates.push(workCommitmentStartDate);
      }
      if (workCommitmentEndDate) {
        endDates.push(workCommitmentEndDate);
      }
      if (employeeWorkCommitmentId) {
        employeeWorkCommitmentIds.push(employeeWorkCommitmentId);
      }
    });

   if (allAreEqual(employeeWorkCommitmentIds)) {
      const min = startDates[0] ? DateTimeHelper.setCurrentTimeZone(startDates[0]) : undefined;
      const max = startDates.length === endDates.length
        ? DateTimeHelper.setCurrentTimeZone(endDates[0])
        : undefined;
      this.bulkDateRanges = { min, max };
    } else {
      this.bulkDateRanges = this.dateRanges;
    }
  }

  public handleChangePage(pageNumber: number): void {
    if(pageNumber && this.filters.pageNumber !== pageNumber) {
      this.filters.pageNumber = pageNumber;
      this.refreshGrid();
    }
  }

  public handleChangePageSize(pageSize: number): void {
    if(pageSize) {
      this.filters.pageSize = pageSize;
      this.refreshGrid();
    }
  }
}
