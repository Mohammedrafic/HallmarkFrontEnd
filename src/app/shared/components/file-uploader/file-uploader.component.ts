import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, Output,
  EventEmitter, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';

import { FilesPropModel, RemovingEventArgs, SelectedEventArgs } from '@syncfusion/ej2-angular-inputs';
import { UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Actions, Store } from '@ngxs/store';

import { FileAdapter } from '@core/helpers/adapters';
import { FileForUpload } from '@core/interface';
import { AllowedFileExtensions } from './file-uploader.constant';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { FilesClearEvent } from '@core/enums';
import { Attachment } from '@shared/components/attachments';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent implements OnChanges {
  @ViewChild('droparea') protected droparea: ElementRef<HTMLDivElement>;

  @ViewChild('uploadArea') protected uploadArea: ElementRef<HTMLDivElement>;

  @ViewChild('fileUploader') protected fileUploader: UploaderComponent;

  @Input() maxFiles = 1;

  @Input() allowedFileExtensions: string = AllowedFileExtensions;

  @Input() maxFileSize: number = 5242880;

  @Input() showSelectedFiles: boolean = true;

  @Input() clearAll: FilesClearEvent | null;

  @Output() uploadFilesChanged: EventEmitter<FileForUpload[]> = new EventEmitter();

  public existingFiles: FilesPropModel[] = [];

  @Input()
  public set attachments(value: Attachment[]) {
    if (value && value.length) {
      this.existingFiles = value.map<FilesPropModel>(({ fileName}) => {
        return {
          name: fileName,
          type: '',
          size: 0,
        }
      });
    }
  }

  public files: FileForUpload[] = [];

  constructor(
    private store: Store,
    private actions$: Actions,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clearAll'] && changes['clearAll'].currentValue === FilesClearEvent.ClearAll) {
      this.fileUploader.clearAll();
    }
  }

  public browseFiles(): void {
    this.uploadArea.nativeElement
    ?.getElementsByClassName('e-file-select-wrap')[0]
    ?.querySelector('button')?.click();
  }

  public filesSelected(event: SelectedEventArgs): void {
    if (this.files.length + event.filesData.length < this.maxFiles) {
      this.setFiles(event);
    } else {
      event.filesData.splice(this.maxFiles, event.filesData.length);
      this.setFiles(event);
      this.showFileNumberExceed();
    }
  }

  public removeFile(event: RemovingEventArgs): void {
    this.files = this.files.filter((file) => file.fileName !== event.filesData[0].name);
    this.uploadFilesChanged.emit(this.files);
  }

  private showFileNumberExceed(): void {
    this.store.dispatch(new ShowToast(MessageTypes.Warning, `Maximum number of files for upload is ${this.maxFiles}`));
  }

  private setFiles(event: SelectedEventArgs): void {
    this.files = [...this.files, ...FileAdapter.adaptRawEventFiles(event.filesData)];
    this.uploadFilesChanged.emit(this.files);
  }
}
