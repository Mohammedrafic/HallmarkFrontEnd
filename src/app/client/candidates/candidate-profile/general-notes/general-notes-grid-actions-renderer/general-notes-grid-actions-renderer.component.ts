import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { Store } from '@ngxs/store';
import { ShowSideDialog } from '../../../../../store/app.actions';
import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { filter, takeUntil } from 'rxjs';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';

@Component({
  selector: 'app-general-notes-grid-actions-renderer',
  templateUrl: './general-notes-grid-actions-renderer.component.html',
  styleUrls: ['./general-notes-grid-actions-renderer.component.scss'],
})
export class GeneralNotesGridActionsRendererComponent extends DestroyableDirective implements ICellRendererAngularComp {
  public params: ICellRendererParams;

  constructor(
    private generalNotesService: GeneralNotesService,
    private store: Store,
    private confirmService: ConfirmService
  ) {
    super();
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
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(filter(Boolean), takeUntil(this.destroy$))
      .subscribe(() => {
        this.generalNotesService.deleteNote(this.params.rowIndex);
      });
  }
}
