import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FileExtensionsString } from '@core/constants';
import { FileSize } from '@core/enums';
import { TooltipComponent } from '@syncfusion/ej2-angular-popups';
import { FileForUpload } from '@core/interface';

@Component({
  selector: 'app-upload-button',
  templateUrl: './upload-button.component.html',
  styleUrls: ['./upload-button.component.scss']
})
export class UploadButtonComponent {
  @Input()
  public container: HTMLElement;

  @Input()
  public disabled: boolean = false;

  @Output()
  public readonly filesSelected: EventEmitter<FileForUpload[]> = new EventEmitter<FileForUpload[]>();

  @ViewChild('uploadTooltip')
  public readonly uploadTooltip: TooltipComponent;

  public readonly allowedFileExtensions: string = FileExtensionsString;
  public readonly maxFileSize: number = FileSize.MB_20;

  public emitSelectedFiles(files: FileForUpload[]): void {
    this.uploadTooltip.close();
    this.filesSelected.emit(files);
  }
}
