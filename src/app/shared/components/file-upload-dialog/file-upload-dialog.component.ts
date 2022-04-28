import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionDispatched, Store } from '@ngxs/store';

import { SetImportFileDialogState } from '../../../admin/store/admin.actions';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss']
})
export class FileUploadDialogComponent implements OnInit {
  @ViewChild('importDialog') importDialog: DialogComponent;
  @ViewChild('file') file: ElementRef;

  constructor(private store: Store,
              private actions$: Actions) { }

  ngOnInit(): void {
    this.actions$.pipe(ofActionDispatched(SetImportFileDialogState)).subscribe(isDialogShown => {
      if (isDialogShown) {
        this.importDialog.show();
      }
    });
  }

  hideImportDialog(): void {
    this.importDialog.hide();
  }

  onUploadFileClick(): void {
    this.file.nativeElement.click();
    // TODO: need implementation after BE be ready
  }

  onFilesAdded(): void {
    // TODO: need implementation after BE be ready
  }
}
