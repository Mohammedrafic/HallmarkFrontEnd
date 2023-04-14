import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GeneralNotesGridActionsRendererComponent } from './general-notes-grid-actions-renderer/general-notes-grid-actions-renderer.component';
import { Actions, Select, Store, ofActionDispatched } from '@ngxs/store';
import { ShowExportDialog, ShowSideDialog } from '../../../../store/app.actions';
import { AddEditNoteComponent } from '@client/candidates/candidate-profile/general-notes/add-edit-note/add-edit-note.component';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Observable, Subject, filter, takeUntil } from 'rxjs';
import { ICellRendererParams, ValueFormatterParams } from '@ag-grid-community/core';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GeneralNotesGridCategoryRendererComponent } from './general-notes-grid-category-renderer/general-notes-grid-category-renderer.component';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { UserState } from 'src/app/store/user.state';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';
import { ExportColumn, ExportOptions, ExportPayload } from '@shared/models/export.model';
import { ExportedFileType } from '@shared/enums/exported-file-type';
import { GeneralNoteExportCols } from './general-notes.constant';
import { GeneralNoteExportFilters } from './general-notes.model';
import { AbstractPermissionGrid } from '@shared/helpers/permissions';
import { ActivatedRoute } from '@angular/router';
import { ExportGeneralNote } from './general-notes.action';
import { CandidateProfileFormService } from '../candidate-profile-form.service';
import { GetAssignedSkillsByOrganization } from '@organization-management/store/organization-management.actions';
import { SystemType } from '@shared/enums/system-type.enum';
import { CandidateProfileService } from '../candidate-profile.service';

@Component({
  selector: 'app-general-notes',
  templateUrl: './general-notes.component.html',
  styleUrls: ['./general-notes.component.scss'],
})
export class GeneralNotesComponent extends AbstractPermissionGrid implements OnInit, OnDestroy {
  @ViewChild(AddEditNoteComponent) public addEditNoteComponent: AddEditNoteComponent;
  protected readonly destroy$: Subject<void> = new Subject();

  public rowSelection = undefined;

  @Select(UserState.userPermission)
  public readonly userPermissions$: Observable<Permission>;
  public override readonly userPermissions = UserPermissions;

  public readonly columnDef: ColumnDefinitionModel[] = [
    {
      field: '',
      headerName: '',
      cellRenderer: GeneralNotesGridActionsRendererComponent,
      maxWidth: 100,
    },
    {
      field: 'date',
      headerName: 'Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      maxWidth: 140,
    },
    {
      field: 'categoryId',
      headerName: 'Category',
      cellRenderer: GeneralNotesGridCategoryRendererComponent,
      cellRendererParams: (params: ICellRendererParams) => this.getCategoryById(params.value),
      minWidth: 185,
    },
    {
      field: 'note',
      headerName: 'Note',
      flex: 1,
      minWidth: 185,
    },
    {
      field: 'createdByName',
      headerName: 'Created By Name',
      flex: 1,
      minWidth: 185,
    },
  ];

  public sideDialogTitle$ = this.generalNotesService.sideDialogTitle$;
  public generalNotes$ = this.generalNotesService.notes$;
  public categories: CategoryModel[];
  public selectedTab$: Observable<CandidateTabsEnum>;
  public targetElement: HTMLElement | null = this.document.body;
  public filters: GeneralNoteExportFilters = {
    pageNumber: 1, pageSize: 100,
    candidateId: 0
  };
  public fileName: string;
  public defaultFileName: string;
  private unsubscribe$: Subject<void> = new Subject();

  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;
  public exportOrientation$ = new Subject<ExportedFileType>();
  public columnsToExport: ExportColumn[] = GeneralNoteExportCols;

  public constructor(
    @Inject(DOCUMENT) private document: Document,
    private datePipe: DatePipe,
    protected override store: Store,
    private generalNotesService: GeneralNotesService,
    private candidatesService: CandidatesService,
    private actions$: Actions,
    private route: ActivatedRoute,
    private candidateProfileFormService: CandidateProfileFormService,
    private candidateProfileService: CandidateProfileService,
  ) {
    super(store);
    this.watchForExportDialog();
  }

  override ngOnInit(): void {
    this.getCategories();
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
    this.watchForDefaultExport();
  }

  public ngOnDestroy(): void {
    //this.ngOnDestroy();
    this.generalNotesService.resetNoteList();
  }

  public addNote(): void {
    this.generalNotesService.setSideDialogTitle('Add Note');
    this.store.dispatch(new ShowSideDialog(true));
    this.generalNotesService.resetEditMode();
  }

  public onCancel() {
    this.toggleSideDialog(false);
  }

  public onSave() {
    this.addEditNoteComponent.saveNote();
    if (this.route.snapshot.paramMap.get('id')||this.candidatesService.employeeId||0) {
      this.candidateProfileFormService.triggerSaveEvent();
      this.candidatesService.changeTab(CandidateTabsEnum.CandidateProfile);
        this.store.dispatch(new GetAssignedSkillsByOrganization({ params: { SystemType: SystemType.IRP } })).pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.candidateProfileService
            .getCandidateById(parseInt(this.route.snapshot.paramMap.get('id') || '0')||this.candidatesService.employeeId||0)
            .pipe(takeUntil(this.destroy$))
            .subscribe((candidate) => {
              this.candidateProfileFormService.populateCandidateForm(candidate);
              this.candidatesService.setCandidateName(`${candidate.lastName}, ${candidate.firstName}`);
              this.candidatesService.setEmployeeHireDate(candidate.hireDate);
              this.generalNotesService.notes$.next(candidate.generalNotes);
            });
          });
     }
  }

  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format) ?? '';
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yyyy');
  }

  private getCategoryById(id: number): CategoryModel | null {
    return this.categories?.find((category: CategoryModel) => category.id === id) ?? null;
  }

  private toggleSideDialog(state: boolean): void {
    this.store.dispatch(new ShowSideDialog(state));
  }

  private getCategories(): void {
    this.generalNotesService
      .getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories: CategoryModel[]) => {
        this.categories = categories;
      });
  }
  public override  customExport(): void {
    this.store.dispatch(new ShowExportDialog(true));
  }

  public override defaultExport(fileType: ExportedFileType, options?: ExportOptions): void {
    this.exportOrientation$.next(fileType);
    if (this.route.snapshot.paramMap.get('id')||this.candidatesService.employeeId||0) {

      this.filters.candidateId = parseInt(this.route.snapshot.paramMap.get('id') || '0')||this.candidatesService.employeeId||0
      this.store.dispatch(new ExportGeneralNote(new ExportPayload(
        fileType,
        { ...this.filters, offset: Math.abs(new Date().getTimezoneOffset()) },
        options ? options.columns.map(val => val.column) : this.columnsToExport.map(val => val.column),
        this.selectedItems.length ? this.selectedItems.map(val => val[this.idFieldName]) : null,
        options?.fileName || this.defaultFileName
      )));
    }
  }

  public closeExport(): void {
    this.fileName = '';
    this.store.dispatch(new ShowExportDialog(false));
  }

  private watchForDefaultExport(): void {
    this.exportOrientation$.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe((event: ExportedFileType) => {
      this.defaultFileName = 'General Note' + this.generateDateTime(this.datePipe);
    });
  }


  private watchForExportDialog(): void {
    this.actions$.pipe(
      ofActionDispatched(ShowExportDialog),
      filter((value) => value.isDialogShown),
      takeUntil(this.unsubscribe$),
    ).subscribe(() => {
      this.defaultFileName = 'General Note' + this.generateDateTime(this.datePipe);
      this.fileName = this.defaultFileName;
    });
  }
  public export(event: ExportOptions): void {
    this.closeExport();
    this.defaultExport(event.fileType, event);
  }
}
