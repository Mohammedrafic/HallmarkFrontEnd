import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { filter, tap } from 'rxjs';

import { downloadBlobFile } from '@shared/utils/file.utils';
import { ConfirmService } from '@shared/services/confirm.service';
import { TimesheetAttachment } from '../../interface';
import { TimesheetDetails } from '../../store/actions/timesheet-details.actions';
import { TimesheetDetailsApiService } from '../../services/timesheet-details-api.service';
import { FileViewer } from '../../modules/file-viewer/file-viewer.actions';
import FileLoaded = TimesheetDetails.FileLoaded;

@Component({
  selector: 'app-attachments-uploads',
  templateUrl: './timesheet-attachments.component.html',
  styleUrls: ['./timesheet-attachments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetAttachmentsComponent {
  @Input()
  public attachments: TimesheetAttachment[] | null = [];

  @Input()
  public organizationId: number | null;

  @Input()
  public timesheetId: number;

  public downloadFileName: string;

  constructor(
    private store: Store,
    private confirmService: ConfirmService,
    private timesheetDetailsApiService: TimesheetDetailsApiService,
    private actions$: Actions,
  ) {
    this.actions$.pipe(
      ofActionSuccessful(FileLoaded)
    ).subscribe((f: FileLoaded) => {
      downloadBlobFile(f.file, this.downloadFileName);
    })
  }

  public trackById(_: number, item: TimesheetAttachment): number {
    return item.id;
  }

  public deleteAttachment(item: TimesheetAttachment): void {
    this.confirmService.confirm(`Are you sure you want to delete an attachment "${item.fileName}"?`, {
      title: 'Delete Attachment',
      okButtonLabel: 'Proceed',
      okButtonClass: 'delete-button',
    })
      .pipe(
        filter(Boolean)
      )
      .subscribe(() => this.store.dispatch(new TimesheetDetails.DeleteAttachment({
        fileId: item.id,
        organizationId: this.organizationId,
        timesheetId: this.timesheetId,
      })));
  }

  public downloadFile(item: TimesheetAttachment): void {
    this.downloadFileName = item.fileName;

    this.store.dispatch(new TimesheetDetails.DownloadAttachment({
      fileId: item.id,
      organizationId: this.organizationId,
    }));
  }

  public preview(item: TimesheetAttachment): void {
    this.timesheetDetailsApiService.downloadPDFAttachment({
      fileId: item.id,
      organizationId: this.organizationId,
    })
      .pipe(
        tap((file: Blob) => this.store.dispatch(
          new FileViewer.Open(item.fileName, file))
        ),
      )
      .subscribe();
  }
}
