import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { Store } from '@ngxs/store';
import { ShowFilterDialog, ShowSideDialog } from '../../../store/app.actions';
import { filter, Observable, Subject, switchMap } from 'rxjs';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { DepartmentsService } from '@client/candidates/departments/services/departments.service';
import { SideDialogTitleEnum } from '@client/candidates/departments/side-dialog-title.enum';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DepartmentAssigned, DepartmentFilterState, DepartmentsPage } from '@client/candidates/departments/departments.model';
import { DatePipe } from '@angular/common';
import { formatDate } from '@shared/constants';
import { columnDef } from '@client/candidates/departments/grid/column-def.constant';
import { AssignDepartmentComponent } from './assign-department/assign-department.component';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent implements OnInit {
  @ViewChild('assignDepartment') private assignDepartment: AssignDepartmentComponent;

  public readonly buttonType: typeof ButtonTypeEnum = ButtonTypeEnum;
  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;
  public readonly sideDialogTitleEnum: typeof SideDialogTitleEnum = SideDialogTitleEnum;
  public readonly dialogData$: Subject<DepartmentAssigned> = new Subject();
  public readonly saveForm$: Subject<boolean> = new Subject();

  public readonly columnDef: ColumnDefinitionModel[] = columnDef({
    editHandler: this.editAssignedDepartment.bind(this),
    deleteHandler: this.deleteAssignedDepartment.bind(this),
    dateFormatter: this.getFormattedDate.bind(this),
  });

  public selectedTab$: Observable<CandidateTabsEnum>;
  public sideDialogTitle$: Observable<string>;
  public departmentsAssigned$: Observable<DepartmentsPage>;

  public constructor(
    private store: Store,
    private candidatesService: CandidatesService,
    private departmentsService: DepartmentsService,
    private datePipe: DatePipe,
    private confirmService: ConfirmService,
  ) {}

  public ngOnInit(): void {
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
    this.sideDialogTitle$ = this.departmentsService.getSideDialogTitle$();
    this.getDepartmentsAssigned();
  }

  public showAssignDepartmentDialog(): void {
    this.assignDepartment.resetAssignDepartmentForm();
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.AssignDepartment);
    this.showSideDialog(true);
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
        .pipe(filter(Boolean))
        .subscribe(() => {
          this.showSideDialog(false);
        });
    } else {
      this.showSideDialog(false);
    }
  }

  public updateTableByFilters(filters: DepartmentFilterState): void {
    this.getDepartmentsAssigned(filters);
    this.store.dispatch(new ShowFilterDialog(false));
  }

  public resetFilters(): void {
    this.getDepartmentsAssigned();
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
  private getDepartmentsAssigned(filters?: DepartmentFilterState): void {
    this.departmentsAssigned$ = this.candidatesService.getSelectedTab$().pipe(
      filter((tab) => tab === CandidateTabsEnum.Departments),
      switchMap(() => this.departmentsService.getDepartmentsAssigned(filters))
    );
  }

  private editAssignedDepartment(department: DepartmentAssigned): void {
    this.showSideDialog(true);
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.EditAssignDepartment);
    this.dialogData$.next(department);
  }

  private deleteAssignedDepartment(): void {}
}
