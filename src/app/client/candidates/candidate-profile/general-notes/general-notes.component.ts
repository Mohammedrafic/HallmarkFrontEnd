import { Component, OnInit, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GeneralNotesGridActionsRendererComponent } from '@client/candidates/candidate-profile/general-notes/general-notes-grid-actions-renderer/general-notes-grid-actions-renderer.component';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../store/app.actions';
import { AddEditNoteComponent } from '@client/candidates/candidate-profile/general-notes/add-edit-note/add-edit-note.component';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { distinctUntilChanged, map, Observable, takeUntil } from 'rxjs';
import { ICellRendererParams, ValueFormatterParams } from '@ag-grid-community/core';
import { CategoryModel } from '@client/candidates/candidate-profile/general-notes/models/category.model';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { GeneralNotesGridCategoryRendererComponent } from '@client/candidates/candidate-profile/general-notes/general-notes-grid-category-renderer/general-notes-grid-category-renderer.component';

@Component({
  selector: 'app-general-notes',
  templateUrl: './general-notes.component.html',
  styleUrls: ['./general-notes.component.scss'],
})
export class GeneralNotesComponent extends DestroyableDirective implements OnInit {
  @ViewChild(AddEditNoteComponent) public addEditNoteComponent: AddEditNoteComponent;

  public readonly columnDef: ColumnDefinitionModel[] = [
    {
      field: '',
      headerName: '',
      cellRenderer: GeneralNotesGridActionsRendererComponent,
      maxWidth: 80
    },
    {
      field: 'date',
      headerName: 'Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      maxWidth: 140
    },
    {
      field: 'categoryId',
      headerName: 'Category',
      cellRenderer: GeneralNotesGridCategoryRendererComponent,
      cellRendererParams: (params: ICellRendererParams) => this.getCategoryById(params.value),
      minWidth: 185
    },
    {
      field: 'note',
      headerName: 'Note',
      flex: 1,
      minWidth: 185
    }
  ];


  public sideDialogTitle$ = this.generalNotesService.sideDialogTitle$;
  public generalNotes$ = this.generalNotesService.notes$;
  public categories: CategoryModel[];

  public readonly isSideDialogOpened$: Observable<boolean> = this.isDialogOpened();

  public constructor(
    private actions: Actions,
    private datePipe: DatePipe,
    private store: Store,
    private generalNotesService: GeneralNotesService
  ) {
    super();
  }

  public ngOnInit(): void {
    this.getCategories();
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
    return this.datePipe.transform(date, format, 'UTC') ?? '';
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yyyy');
  }

  private getCategoryById(id: number): CategoryModel | null {
    return this.categories.find((category: CategoryModel) => category.id === id) ?? null;
  }

  private isDialogOpened(): Observable<boolean> {
    return this.actions.pipe(ofActionDispatched(ShowSideDialog)).pipe(
      map((payload: ShowSideDialog) => payload.isDialogShown),
      distinctUntilChanged()
    );
  }

  private toggleSideDialog(state: boolean): void {
    this.store.dispatch(new ShowSideDialog(state));
  }

  private getCategories(): void {
    this.generalNotesService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe((categories: CategoryModel[]) => {
        this.categories = categories;
      });
  }
}
