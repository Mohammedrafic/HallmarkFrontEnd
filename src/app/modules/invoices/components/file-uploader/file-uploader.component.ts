import { Component, ChangeDetectionStrategy, ViewChild, ElementRef, Input, Output, EventEmitter } from '@angular/core';

import { RemovingEventArgs, SelectedEventArgs } from '@syncfusion/ej2-angular-inputs';

import { FileAdapter } from '@core/helpers/adapters';
import { FileForUpload } from '@core/interface';
import { AllowedFileExtensions } from './file-uploader.constant';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploaderComponent {
  @ViewChild('droparea') protected droparea: ElementRef<HTMLDivElement>;

  @ViewChild('uploadArea') protected uploadArea: ElementRef<HTMLDivElement>;

  @Input() maxFiles = 1;

  @Input() allowedFileExtensions: string = AllowedFileExtensions;

  @Input() maxFileSize: number = 5242880;

  @Output() uploadFilesChanged: EventEmitter<FileForUpload[]> = new EventEmitter();

  public files: FileForUpload[] = [];

  public browseFiles(): void {
    this.uploadArea.nativeElement
    ?.getElementsByClassName('e-file-select-wrap')[0]
    ?.querySelector('button')?.click();
  }

  public filesSelected(event: SelectedEventArgs): void {
    this.files = [...this.files, ...FileAdapter.adaptRawEventFiles(event.filesData)];
  }

  public removeFile(event: RemovingEventArgs): void {
    this.files = this.files.filter((file) => file.fileName !== event.filesData[0].name);
  }
}
