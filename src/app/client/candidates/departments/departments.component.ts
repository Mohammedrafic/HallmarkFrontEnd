import { ChangeDetectionStrategy, Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';

import { Store } from '@ngxs/store';
import { BehaviorSubject, filter, Observable, Subject, switchMap, take, takeUntil } from 'rxjs';

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
import { DatePipe } from '@angular/common';
import { ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { DELETE_MULTIPLE_RECORDS_TEXT, DELETE_RECORD_TEXT, DELETE_RECORD_TITLE, formatDate } from '@shared/constants';
import { columnDef } from '@client/candidates/departments/grid/column-def.constant';
import { AssignDepartmentComponent } from './assign-department/assign-department.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';
import { BulkActionConfig, BulkActionDataModel } from '@shared/models/bulk-action-data.model';
import { BulkTypeAction } from '@shared/enums/bulk-type-action.enum';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { EditDepartmentsComponent } from './edit-departments/edit-departments.component';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent extends DestroyableDirective implements OnInit {
  @ViewChild('assignDepartment') private assignDepartment: AssignDepartmentComponent;
  @ViewChild('editDepartments') private editDepartments: EditDepartmentsComponent;

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

  public readonly columnDef: ColumnDefinitionModel[] = columnDef({
    editHandler: this.editAssignedDepartment.bind(this),
    deleteHandler: this.deleteAssignedDepartments.bind(this),
    dateFormatter: this.getFormattedDate.bind(this),
  });

  public departmentsAssigned: DepartmentsPage;
  public selectedTab$: Observable<CandidateTabsEnum>;
  public sideDialogTitle$: Observable<string>;
  public rowSelection: 'single' | 'multiple' = 'multiple';
  public selectedDepartments: number[];

  private filters: DepartmentFilterState | null;
  employeeWorkCommitmentId: number;

  public constructor(
    private store: Store,
    private candidatesService: CandidatesService,
    private departmentsService: DepartmentsService,
    private datePipe: DatePipe,
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  public ngOnInit(): void {
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
    this.sideDialogTitle$ = this.departmentsService.getSideDialogTitle$();
    this.getDepartmentsAssigned();
    this.getEmployeeWorkCommitmentId();
  }

  public showAssignDepartmentDialog(): void {
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.AssignDepartment);
    this.showSideDialog(true);
    this.assignDepartment?.resetAssignDepartmentForm();
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
    this.selectedDepartments = selectedAll ? [null] : event.items.map((item) => item.data.id);

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
        takeUntil(this.destroy$)
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

  private deleteAssignedDepartments(departmentIds: number[], text = DELETE_RECORD_TEXT): void {
    this.confirmService
      .confirm(text, {
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
        title: DELETE_RECORD_TITLE,
      })
      .pipe(filter(Boolean), take(1))
      .subscribe(() => {
        this.departmentsService.deleteAssignedDepartments(departmentIds);
      });
  }

  private getEmployeeWorkCommitmentId(): void {
    this.candidatesService.getEmployeeWorkCommitmentId().pipe(takeUntil(this.destroy$)).subscribe((id) => {
      this.employeeWorkCommitmentId = id;
      this.cdr.markForCheck();
    })
  }

  private getAssignedDepartmentHierarchy(): void {
    this.departmentsService.getAssignedDepartmentHierarchy(this.employeeWorkCommitmentId).pipe(takeUntil(this.destroy$)).subscribe((data) => {
      //TODO provide functionality
    })
  }
}
