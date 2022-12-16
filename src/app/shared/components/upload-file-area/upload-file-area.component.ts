import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';

import { TooltipComponent } from '@syncfusion/ej2-angular-popups';

import { FileSize } from '@core/enums';
import { FileForUpload } from '@core/interface';

@Component({
  selector: 'app-upload-file-area',
  templateUrl: './upload-file-area.component.html',
  styleUrls: ['./upload-file-area.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadFileAreaComponent {
  @Input() public container: HTMLElement;
  @Input() public excludeElement: HTMLElement | HTMLElement[];
  @Input() public maxFileSize: FileSize;
  @Input() public allowedFileExtensions: string;
  @Input() public maxFiles: number = 5;

  @Output() private readonly filesSelected: EventEmitter<FileForUpload[]> = new EventEmitter<FileForUpload[]>();
  
  @ViewChild('uploadTooltip') private readonly uploadTooltip: TooltipComponent;

  public open(): void {
    this.uploadTooltip.open();
  }

  public close(): void {
    this.uploadTooltip.close();
  }

  public emitSelectedFiles(files: FileForUpload[]): void {
    this.uploadTooltip.close();
    this.filesSelected.emit(files);
  }
}
