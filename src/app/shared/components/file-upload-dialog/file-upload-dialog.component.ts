import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Observable } from 'rxjs';
import { AdminState } from '../../../admin/store/admin.state';
import { Select, Store } from '@ngxs/store';
import { SetImportFileDialogState } from '../../../admin/store/admin.actions';

@Component({
  selector: 'app-file-upload-dialog',
  templateUrl: './file-upload-dialog.component.html',
  styleUrls: ['./file-upload-dialog.component.scss']
})
export class FileUploadDialogComponent implements OnInit {
  @ViewChild('importDialog') importDialog: DialogComponent;
  @ViewChild('file') file: ElementRef;

  @Select(AdminState.importFileDialogState)
  importFileDialogState$: Observable<boolean>;

  constructor(private store: Store,) { }

  ngOnInit(): void {
    this.importFileDialogState$.subscribe(isDialogShown => {
      if (isDialogShown) {
        this.importDialog.show();
      }
    });
  }

  hideImportDialog(): void {
    this.importDialog.hide();
  }

  closeDialog(): void {
    this.store.dispatch(new SetImportFileDialogState(false));
  }

  onUploadFileClick(): void {
    this.file.nativeElement.click();
    // TODO: need implementation after BE be ready
  }

  onFilesAdded(): void {
    // TODO: need implementation after BE be ready
  }
}
