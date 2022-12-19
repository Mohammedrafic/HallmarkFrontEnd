import { Component, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ColumnDefinitionModel } from '@shared/components/grid/models';
import { GeneralNotesGridActionsRendererComponent } from '@client/candidates/candidate-profile/general-notes/general-notes-grid-actions-renderer/general-notes-grid-actions-renderer.component';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../store/app.actions';
import { AddEditNoteComponent } from '@client/candidates/candidate-profile/general-notes/add-edit-note/add-edit-note.component';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { ValueFormatterParams } from '@ag-grid-community/core';

@Component({
  selector: 'app-general-notes',
  templateUrl: './general-notes.component.html',
  styleUrls: ['./general-notes.component.scss']
})
export class GeneralNotesComponent {
  @ViewChild(AddEditNoteComponent) public addEditNoteComponent: AddEditNoteComponent;

  public readonly columnDef: ColumnDefinitionModel[] = [
    {
      field: '',
      headerName: '',
      cellRenderer: GeneralNotesGridActionsRendererComponent,
      maxWidth: 80,
      cellClass: 'extension-buttons'
    },
    {
      field: 'date',
      headerName: 'Date',
      valueFormatter: (params: ValueFormatterParams) => this.getFormattedDate(params.value),
      maxWidth: 140
    },
    {
      field: 'category',
      headerName: 'Category',
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

  public readonly isSideDialogOpened$: Observable<boolean> = this.isDialogOpened();


  public constructor(
    private actions: Actions,
    private datePipe: DatePipe,
    private store: Store,
    private generalNotesService: GeneralNotesService) {
  }


  public addNote(): void {
    this.generalNotesService.setSideDialogTitle('Add Note');
    this.store.dispatch(new ShowSideDialog(true));
    this.generalNotesService.resetEditMode();
  }


  private getFormattedDateWithFormat(date: string, format: string): string {
    return this.datePipe.transform(date, format, 'UTC') ?? '';
  }

  private getFormattedDate(date: string): string {
    return this.getFormattedDateWithFormat(date, 'MM/dd/yyyy');
  }

  onCancel() {
    this.toggleSideDialog(false);
  }

  onSave() {
    this.addEditNoteComponent.saveNote();
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
}
