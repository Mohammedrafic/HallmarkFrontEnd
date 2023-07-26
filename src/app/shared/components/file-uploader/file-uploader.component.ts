import { DOCUMENT } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { FileInfo, RemovingEventArgs, SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { Store } from '@ngxs/store';

import { FileSizeValueMap } from "@core/constants/file-size.constant";
import { OutsideZone } from "@core/decorators";
import { FilesClearEvent, FileSize, UploaderFileStatus } from '@core/enums';
import { FileAdapter } from '@core/helpers/adapters';
import { FileForUpload } from '@core/interface';
import { Attachment } from '@shared/components/attachments';
import { CustomFilesPropModel } from '@shared/components/file-uploader/custom-files-prop-model.interface';
import { MessageTypes } from '@shared/enums/message-types';
import { ShowToast } from 'src/app/store/app.actions';
import { AllowedFileExtensions } from './file-uploader.constant';

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

  @Input() maxFileSize: FileSize = FileSize.MB_5;

  @Input() showSelectedFiles = true;

  @Input() clearAll: FilesClearEvent | null;

  @Input() useRedTrashBin = false;

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
        };
      });
    }
  }

  public files: FileForUpload[] = [];

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private store: Store,
    private readonly ngZone: NgZone,
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
    this.validateFiles(event);
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

  private validateFiles(event: SelectedEventArgs): void {
    const filesData : FileInfo[] = this.fileUploader.getFilesData();
    const allFiles : FileInfo[] = filesData.concat(event.filesData);
    allFiles.forEach((file, index) => this.addFilesValidationMessage(file, index));
  }

  @OutsideZone
  private addFilesValidationMessage(file: FileInfo, fileIndex: number) {
    requestAnimationFrame(() => {
      const uploaderErrorMessageElement = this.document.getElementsByClassName('e-file-status')[fileIndex] as HTMLElement;
      if (uploaderErrorMessageElement && file.statusCode === '0') {
        uploaderErrorMessageElement.innerText = file.size > this.maxFileSize
          ? this.getMaxSizeErrorMessage()
          : this.getExtensionErrorMessage();
      }
    });
  }

  private getMaxSizeErrorMessage(): string {
    return `The file should not exceed ${FileSizeValueMap[this.maxFileSize]}MB.`;
  }

  private getExtensionErrorMessage(): string {
    return `The file should be in ${this.allowedFileExtensions} format.`;
  }
}
