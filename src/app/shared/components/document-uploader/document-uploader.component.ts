import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { FileInfo } from "@syncfusion/ej2-inputs/src/uploader/uploader";

@Component({
  selector: 'app-document-uploader',
  templateUrl: './document-uploader.component.html',
  styleUrls: ['./document-uploader.component.scss']
})
export class DocumentUploaderComponent implements OnInit {
  @Input() uploaderTitle: string;
  @Input() allowedExtensions: string = '.pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png';
  @Input() maxFileSize: number = 10485760; // 10 mb

  @Output() selectDocuments = new EventEmitter<Blob[]>();

  @ViewChild('previewupload')
  public uploadObj: UploaderComponent;
  public uploaderErrorMessageElement: HTMLElement;
  public dropElement: HTMLElement;

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  public browse() : void {
    document.getElementById('documents-uploader')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
  }

  public onFileSelected(args : SelectedEventArgs) : void {
    const filesData : FileInfo[] = this.uploadObj.getFilesData();
    const allFiles : FileInfo[] = filesData.concat(args.filesData);

    args.isModified = true;
    allFiles.forEach((file, index) => this.addFilesValidationMessage(file, index));

    const allFilesReadyToUpload: Blob[] = allFiles
      .filter(f => f.statusCode === '1')
      .map(f => f.rawFile as Blob);

    this.selectDocuments.emit(allFilesReadyToUpload);
  }

  public onDocumentRemove(): void {
    this.uploadObj.clearAll();
    this.selectDocuments.emit([]);
  }

  private addFilesValidationMessage(file: FileInfo, fileIndex: number) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document.getElementsByClassName('e-validation-fails')[fileIndex] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText = file.size > this.maxFileSize
          ? 'The file exceeds the limitation, max allowed 10 MB.'
          : 'The file should be in pdf, doc, docx, xls, xlsx, jpg, jpeg, png format.';
      }
    });
  }
}
