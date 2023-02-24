import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Store } from '@ngxs/store';
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
  DepartmentAssigned,
  DepartmentFilterState,
  DepartmentsPage,
} from '@client/candidates/departments/departments.model';
import { ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { DELETE_MULTIPLE_RECORDS_TEXT, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, formatDate } from '@shared/constants';
import { columnDef } from '@client/candidates/departments/grid/column-def.constant';
import { AssignDepartmentComponent } from './assign-department/assign-department.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { OrganizationRegion } from '@shared/models/organization.model';
import { AbstractPermission } from '@shared/helpers/permissions';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent extends AbstractPermission implements OnInit {
  @ViewChild('assignDepartment') private assignDepartment: AssignDepartmentComponent;

  public readonly buttonType: typeof ButtonTypeEnum = ButtonTypeEnum;
  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;
  public readonly sideDialogTitleEnum: typeof SideDialogTitleEnum = SideDialogTitleEnum;
  public readonly dialogData$: BehaviorSubject<DepartmentAssigned | null> =
    new BehaviorSubject<DepartmentAssigned | null>(null);
  public readonly saveForm$: Subject<boolean> = new Subject();
  public readonly bulkActionConfig: BulkActionConfig = {
    edit: true,
    delete: true,
  };

  public columnDef: ColumnDefinitionModel[];

  public departmentsAssigned: DepartmentsPage;
  public selectedTab$: Observable<CandidateTabsEnum>;
  public sideDialogTitle$: Observable<string>;
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public selectedDepartments: number[] | null;

  public departmentHierarchy: OrganizationRegion[] = [];

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
    this.getDepartmentsAssigned();
    this.getAssignedDepartmentHierarchy();
    this.getUserPermission();
  }

  public showAssignDepartmentDialog(): void {
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.AssignDepartment);
    this.showSideDialog(true);
    this.assignDepartment?.resetAssignDepartmentForm();
    this.cdr.markForCheck();
  }

  public onSave(): void {
    this.saveForm$.next(true);
  }

  public showFilters(): void {
    this.store.dispatch(new ShowFilterDialog(true));
  }

  public onCancel(): void {
    if (this.assignDepartment?.assignDepartmentForm.dirty) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button',
        })
        .pipe(filter(Boolean), take(1))
        .subscribe(() => {
          this.showSideDialog(false);
        });
    } else {
      this.showSideDialog(false);
    }
  }

  public updateTableByFilters(filters: DepartmentFilterState): void {
    this.filters = filters;
    this.getDepartmentsAssigned(this.filters);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public resetFilters(): void {
    this.filters = null;
    this.getDepartmentsAssigned();
  }

  public handleBulkEvent(event: BulkActionDataModel): void {
    const selectedAll = this.departmentsAssigned.totalCount === event.items.length;
    this.selectedDepartments = selectedAll ? null : event.items.map((item) => item.data.id);

    if (event.type === BulkTypeAction.EDIT) {
      this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.EditBulkDepartments);
      this.showSideDialog(true);
      return;
    }
    if (event.type === BulkTypeAction.DELETE) {
      this.deleteAssignedDepartments(this.selectedDepartments, DELETE_MULTIPLE_RECORDS_TEXT);
      return;
    }
  }

  public refreshGrid(): void {
    this.getDepartmentsAssigned(this.filters);
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
  private getDepartmentsAssigned(filters?: DepartmentFilterState | null): void {
    this.candidatesService
      .getSelectedTab$()
      .pipe(
        filter((tab) => tab === CandidateTabsEnum.Departments),
        switchMap(() => this.departmentsService.getDepartmentsAssigned(filters)),
        takeUntil(this.componentDestroy())
      )
      .subscribe((departments) => {
        this.departmentsAssigned = departments;
        this.cdr.markForCheck();
      });
  }

  private editAssignedDepartment(department: DepartmentAssigned): void {
    this.showSideDialog(true);
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.EditAssignDepartment);
    this.dialogData$.next(department);
  }

  private deleteAssignedDepartments(departmentIds: number[] | null, text = DELETE_RECORD_TEXT): void {
    this.confirmService
      .confirm(text, {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: DELETE_RECORD_TITLE,
      })
      .pipe(
        filter(Boolean),
        switchMap(() => this.departmentsService.deleteAssignedDepartments(departmentIds)),
        take(1)
      )
      .subscribe(() => {
        this.getDepartmentsAssigned(this.filters);
      });
  }

  private getAssignedDepartmentHierarchy(): void {
    this.candidatesService
      .getEmployeeWorkCommitmentId()
      .pipe(
        switchMap((id) => {
          this.departmentsService.employeeWorkCommitmentId = id;
          return this.departmentsService.getAssignedDepartmentHierarchy(id);
        }),
        takeUntil(this.componentDestroy())
      )
      .subscribe((data) => {
        this.departmentHierarchy = data.regions;
        this.cdr.markForCheck();
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
}
