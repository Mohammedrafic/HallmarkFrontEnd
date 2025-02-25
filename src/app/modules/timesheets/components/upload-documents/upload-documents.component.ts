import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, takeUntil } from 'rxjs';

import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Destroyable } from '@core/helpers';
import { FileExtensionsString } from '@core/constants';
import { DialogAction, FilesClearEvent, FileSize } from '@core/enums';
import { FileForUpload } from '@core/interface';
import { ConfirmService } from '@shared/services/confirm.service';
import { ShowToast } from "src/app/store/app.actions";

import { MessageTypes } from "@shared/enums/message-types";
import { CustomFilesPropModel } from '@shared/components/file-uploader/custom-files-prop-model.interface';
import { TimesheetsState } from '../../store/state/timesheets.state';
import { Timesheets } from '../../store/actions/timesheets.actions';
import { Attachment, UploadDialogState, UploadDocumentsModel } from '../../interface';

@Component({
  selector: 'app-upload-documents',
  templateUrl: './upload-documents.component.html',
  styleUrls: ['./upload-documents.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadDocumentsComponent extends Destroyable implements OnInit {
  @Select(TimesheetsState.uploadDialogOpen)
  public readonly dialogState$: Observable<UploadDialogState>;

  @ViewChild('sideUploadDialog') protected sideUploadDialog: DialogComponent;

  @Output() fileChange: EventEmitter<UploadDocumentsModel>
    = new EventEmitter<UploadDocumentsModel>();

  public readonly allowedFileExtensions: string = FileExtensionsString;

  public readonly maxFileSize: number = FileSize.MB_20;

  public readonly targetElement: HTMLElement | null = document.body.querySelector('#main');

  public existingFiles: Attachment[] = [];

  public filesForDelete: Attachment[] = [];

  public fileForUploads: FileForUpload[] = [];

  public filesClearEvent: FilesClearEvent | null;

  constructor(
    private confirmService: ConfirmService,
    private cdr: ChangeDetectorRef,
    private store: Store,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getDialogState();
  }

  public trackByFn(index: number): number {
    return index;
  }

  public cancelChanges(): void {
    if (this.fileForUploads.length) {
      this.confirmService.confirm('Are you sure you want to exit without saving changes?', {
        title: 'Unsaved Progress',
        okButtonLabel: 'Proceed',
        okButtonClass: 'delete-button',
      }).pipe(
        filter(Boolean),
        takeUntil(this.componentDestroy())
      ).subscribe(() => {
        this.closeDialog();
      });
    } else {
      this.closeDialog();
    }
  }

  public saveRecord(): void {
    if (this.hasTooBigFile()) {
      this.store.dispatch(new ShowToast(MessageTypes.Error, 'The file should not exceed 20MB.'));
      return;
    }

    this.fileChange.emit({
      fileForUpload: this.fileForUploads,
      filesForDelete: this.filesForDelete,
    });

    this.filesForDelete = [];
    this.fileForUploads = [];

    this.closeDialog();
  }

  public clearFiles(): void {
    this.resetUploadState(true);
  }

  public deleteFile({ id }: CustomFilesPropModel): void {
    const file = this.existingFiles.find((attachment: Attachment) => attachment.id === id);

    if (file) {
      this.filesForDelete = [...this.filesForDelete, file];
    }
  }

  public selectedFiles(files: FileForUpload[]): void {
    this.fileForUploads = files;
    this.filesClearEvent = this.fileForUploads.length ? null : FilesClearEvent.ClearAll;
  }

  private getDialogState(): void {
    this.dialogState$
      .pipe(
        filter((value: UploadDialogState) => value.state),
        takeUntil(this.componentDestroy()),
      )
      .subscribe((value: UploadDialogState) => {
        this.existingFiles = value.recordAttachments || [];
        this.filesClearEvent = null;
        this.sideUploadDialog.show();
        this.cdr.detectChanges();
      });
  }

  private closeDialog(): void {
    this.resetUploadState();

    this.sideUploadDialog.hide();
    this.store.dispatch(new Timesheets.ToggleTimesheetUploadAttachmentsDialog(DialogAction.Close, null));
  }

  private hasTooBigFile(): boolean {
    return this.fileForUploads.some((file: FileForUpload) => file.blob.size > this.maxFileSize);
  }

  private resetUploadState(deleteExistingFiles = false): void {
    this.filesForDelete = deleteExistingFiles ? [...this.existingFiles] : [];
    this.fileForUploads = [];
    this.existingFiles = [];
    this.filesClearEvent = FilesClearEvent.ClearAll;

    this.cdr.detectChanges();
  }
}
