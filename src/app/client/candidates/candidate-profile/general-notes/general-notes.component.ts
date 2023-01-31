import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GeneralNotesGridActionsRendererComponent } from './general-notes-grid-actions-renderer/general-notes-grid-actions-renderer.component';
import { Actions, Select, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../store/app.actions';
import { AddEditNoteComponent } from '@client/candidates/candidate-profile/general-notes/add-edit-note/add-edit-note.component';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Observable, takeUntil } from 'rxjs';
import { ICellRendererParams, ValueFormatterParams } from '@ag-grid-community/core';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GeneralNotesGridCategoryRendererComponent } from './general-notes-grid-category-renderer/general-notes-grid-category-renderer.component';
import { CandidatesService } from '@client/candidates/services/candidates.service';
import { CandidateTabsEnum } from '@client/candidates/enums';
import { UserState } from 'src/app/store/user.state';
import { Permission } from '@core/interface';
import { UserPermissions } from '@core/enums';

@Component({
  selector: 'app-general-notes',
  templateUrl: './general-notes.component.html',
  styleUrls: ['./general-notes.component.scss'],
})
export class GeneralNotesComponent extends DestroyableDirective implements OnInit, OnDestroy {
  @ViewChild(AddEditNoteComponent) public addEditNoteComponent: AddEditNoteComponent;
  public rowSelection = undefined;

  @Select(UserState.userPermission)
  public readonly userPermissions$: Observable<Permission>;
  public readonly userPermissions = UserPermissions;

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
  ];

  public sideDialogTitle$ = this.generalNotesService.sideDialogTitle$;
  public generalNotes$ = this.generalNotesService.notes$;
  public categories: CategoryModel[];
  public selectedTab$: Observable<CandidateTabsEnum>;

  public readonly candidateTabsEnum: typeof CandidateTabsEnum = CandidateTabsEnum;

  public constructor(
    private actions: Actions,
    private datePipe: DatePipe,
    private store: Store,
    private generalNotesService: GeneralNotesService,
    private candidatesService: CandidatesService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getCategories();
    this.selectedTab$ = this.candidatesService.getSelectedTab$();
  }

  public override ngOnDestroy(): void {
    super.ngOnDestroy();
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
}
