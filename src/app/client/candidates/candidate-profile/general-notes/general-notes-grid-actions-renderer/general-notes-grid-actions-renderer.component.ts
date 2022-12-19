import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../../store/app.actions';

@Component({
  selector: 'app-general-notes-grid-actions-renderer',
  templateUrl: './general-notes-grid-actions-renderer.component.html',
  styleUrls: ['./general-notes-grid-actions-renderer.component.scss']
})
export class GeneralNotesGridActionsRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;

  constructor(private generalNotesService: GeneralNotesService, private store: Store) {
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    return false;
  }

  onEdit(): void {
    this.generalNotesService.editNote({ data: this.params.data, index: this.params.rowIndex });
    this.generalNotesService.setSideDialogTitle('Edit Note');
    this.store.dispatch(new ShowSideDialog(true));
  }

  onDelete(): void {
    this.generalNotesService.deleteNote(this.params.rowIndex);
  }

}
