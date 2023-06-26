import { Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { Store } from '@ngxs/store';
import { filter, takeUntil } from 'rxjs';

import { ConfirmService } from '@shared/services/confirm.service';
import { DELETE_RECORD_TEXT, DELETE_RECORD_TITLE } from '@shared/constants';
import { GeneralNotesService } from '@client/candidates/candidate-profile/general-notes/general-notes.service';
import { AbstractPermission } from '@shared/helpers/permissions';

@Component({
  selector: 'app-general-notes-grid-actions-renderer',
  templateUrl: './general-notes-grid-actions-renderer.component.html',
  styleUrls: ['./general-notes-grid-actions-renderer.component.scss'],
})
export class GeneralNotesGridActionsRendererComponent extends AbstractPermission implements ICellRendererAngularComp {
  public params: ICellRendererParams;

  constructor(
    protected override store: Store,
    private generalNotesService: GeneralNotesService,
    private confirmService: ConfirmService
  ) {
    super(store);
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(): boolean {
    return false;
  }

  onDelete(): void {
    this.confirmService
      .confirm(DELETE_RECORD_TEXT, {
        title: DELETE_RECORD_TITLE,
        okButtonLabel: 'Delete',
        okButtonClass: 'delete-button',
      })
      .pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      )
      .subscribe(() => {
        this.generalNotesService.deleteNote(this.params.rowIndex);
      });
  }
}
