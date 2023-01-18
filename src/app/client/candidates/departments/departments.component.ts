import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ButtonTypeEnum } from '@shared/components/button/enums/button-type.enum';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../store/app.actions';
import { filter, Observable, switchMap } from 'rxjs';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { DepartmentsService } from '@client/candidates/departments/departments.service';
import { SideDialogTitleEnum } from '@client/candidates/departments/side-dialog-title.enum';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { DepartmentsPage } from '@client/candidates/departments/departments.model';
import { DatePipe } from '@angular/common';
import { formatDate } from '@shared/constants';
import { columnDef } from '@client/candidates/departments/grid/column-def.constant';

@Component({
  selector: 'app-departments',
  templateUrl: './departments.component.html',
  styleUrls: ['./departments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent implements OnInit {
  public readonly buttonType: typeof ButtonTypeEnum = ButtonTypeEnum;
  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;
  public readonly sideDialogTitleEnum: typeof SideDialogTitleEnum = SideDialogTitleEnum;

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
    private datePipe: DatePipe
  ) {}

  public ngOnInit(): void {
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
    this.sideDialogTitle$ = this.departmentsService.getSideDialogTitle$();
    this.departmentsAssigned$ = this.getDepartmentsAssigned();
  }

  public showAssignDepartmentDialog(): void {
    this.store.dispatch(new ShowSideDialog(true));
    this.departmentsService.setSideDialogTitle(SideDialogTitleEnum.AssignDepartment);
  }

  public onSave(): void {}

  public onCancel(): void {
    this.store.dispatch(new ShowSideDialog(false));
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, formatDate);
  }

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format, 'UTC') ?? '';
  }

  // Get new data if departments tab will be selected
  private getDepartmentsAssigned(): Observable<DepartmentsPage> {
    return this.candidatesService
      .getSelectedTab$()
      .pipe(
        filter((tab) => tab === CandidateTabsEnum.Departments),
        switchMap(() => this.departmentsService.getDepartmentsAssigned()));
  }

  private editAssignedDepartment(): void {}

  private deleteAssignedDepartment(): void {}
}
