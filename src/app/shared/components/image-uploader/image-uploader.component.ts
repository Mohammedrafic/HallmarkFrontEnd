import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { SelectedEventArgs } from "@syncfusion/ej2-angular-inputs";

@Component({
  selector: 'app-image-uploader',
  templateUrl: './image-uploader.component.html',
  styleUrls: ['./image-uploader.component.scss']
})
export class ImageUploaderComponent implements OnInit {
  @Input() uploaderTitle: string;

  @Output() selectImage = new EventEmitter<Blob | null>()

  public readonly allowedExtensions: string = '.png, .jpg, .jpeg';
  public dropElement: HTMLElement;

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  public browse() : void {
    document.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }

  public onImageSelect(event: SelectedEventArgs): void {
    this.selectImage.emit(event.filesData[0].rawFile as Blob)
  }

  public onImageRemove(): void {
    this.selectImage.emit(null);
  }
}
