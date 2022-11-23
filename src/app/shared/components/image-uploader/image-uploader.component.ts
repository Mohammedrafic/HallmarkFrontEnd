import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { FileSize } from "@core/enums";
import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { FileInfo } from "@syncfusion/ej2-inputs/src/uploader/uploader";

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  @Input() uploaderTitle: string;
  @Input() disabled = false;
  @Input() set logo(value: Blob | null) {
    if (value) {
      const reader = new FileReader();
      reader.readAsDataURL(value as Blob);
      reader.onloadend = () => {
        this.logoSrc = reader.result as string;
      }
    }
  }

  @Output() selectImage = new EventEmitter<Blob | null>()

  @ViewChild('previewupload')
  public uploadObj: UploaderComponent;

  public logoSrc = '';
  public isImageSelected = false;
  public uploaderErrorMessageElement: HTMLElement;
  public readonly allowedExtensions: string = '.png, .jpg';
  public readonly maxFileSize = FileSize.MB_20;
  public dropElement: HTMLElement;

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  public browse() : void {
    document.getElementById('image-uploader')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
  }

  public onImageSelect(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode === '1') {
      this.selectImage.emit(event.filesData[0].rawFile as Blob)
      this.isImageSelected = true;
    } else {
     this.addValidationMessage(event.filesData[0]);
    }
  }

  public onImageRemove(): void {
    this.isImageSelected = false;
    this.uploadObj.clearAll();
    this.logo = null;
    this.logoSrc = '';
    this.selectImage.emit(null);
  }

  private addValidationMessage(file: FileInfo) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document.getElementsByClassName('e-validation-fails')[0] ?
        document.getElementsByClassName('e-validation-fails')[0] as HTMLElement :
        document.getElementsByClassName('e-file-status e-file-invalid')[0] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText = file.size > this.maxFileSize
          ? 'The file should not exceed 20MB.'
          : 'The file should be in png, jpg format.';
      }
    });
  }
}
