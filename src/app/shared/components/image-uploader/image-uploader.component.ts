import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  @Input() uploaderTitle: string;
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
  public readonly allowedExtensions: string = '.png, .jpg, .jpeg';
  public dropElement: HTMLElement;

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  public browse() : void {
    document.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }

  public onImageSelect(event: SelectedEventArgs): void {
    if (event.filesData[0].statusCode === '1') {
      this.selectImage.emit(event.filesData[0].rawFile as Blob)
      this.isImageSelected = true;
    }
  }

  public onImageRemove(): void {
    this.isImageSelected = false;
    this.uploadObj.clearAll();
    this.logo = null;
    this.logoSrc = '';
    this.selectImage.emit(null);
  }
}
