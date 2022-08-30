import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { FileInfo, RemovingEventArgs, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Store } from '@ngxs/store';

import { FileAdapter } from '@core/helpers/adapters';
import { FileForUpload } from '@core/interface';
import { AllowedFileExtensions } from './file-uploader.constant';
import { ShowToast } from 'src/app/store/app.actions';
import { MessageTypes } from '@shared/enums/message-types';
import { FilesClearEvent, UploaderFileStatus } from '@core/enums';
import { Attachment } from '@shared/components/attachments';
import { CustomFilesPropModel } from '@shared/components/file-uploader/custom-files-prop-model.interface';

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

  @Output() selectedFilesChanged: EventEmitter<FileForUpload[]> = new EventEmitter();

  @Output()
  public readonly existingFileDelete: EventEmitter<CustomFilesPropModel> = new EventEmitter<CustomFilesPropModel>();

  public existingFiles: CustomFilesPropModel[] = [];

  @Input()
  public set attachments(value: Attachment[]) {
    if (value && value.length) {
      this.existingFiles = value.map<CustomFilesPropModel>(({ id, fileName }: Attachment) => {
        const [name, type] = fileName.split(/\./);

        return {
          id,
          name,
          type,
          size: 0,
        }
      });
    }
  }

  public files: FileForUpload[] = [];

  constructor(
    private store: Store,
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
    if (this.files.length + event.filesData.length <= this.maxFiles) {
      this.setFiles(event);
    } else {
      event.filesData.splice(this.maxFiles, event.filesData.length);
      this.setFiles(event);
      this.showFileNumberExceed();
    }
  }

  public removeFile(removingEventArgs: RemovingEventArgs): void {
    const [ removedFile ] = removingEventArgs.filesData;

    if (removedFile.statusCode === UploaderFileStatus.UploadedSuccessfully) {
      this.handleExistingFileRemove(removedFile);
    } else {
      this.files = this.files.filter((file: FileForUpload) => file.fileName !== removedFile.name);
      this.selectedFilesChanged.emit(this.files);
    }
  }

  private showFileNumberExceed(): void {
    this.store.dispatch(new ShowToast(MessageTypes.Warning, `Maximum number of files for upload is ${this.maxFiles}`));
  }

  private setFiles(event: SelectedEventArgs): void {
    this.files = [...this.files, ...FileAdapter.adaptRawEventFiles(event.filesData)];
    this.selectedFilesChanged.emit(this.files);
  }

  private handleExistingFileRemove(file: FileInfo) {
    const existingFile = this.existingFiles.find(({ name, type }: CustomFilesPropModel) =>
      [name, type].join('.') === file.name);

    if (existingFile) {
      this.existingFileDelete.emit(existingFile);
    }
  }
}
