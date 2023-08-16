import { Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges } from '@angular/core';

import { SelectedEventArgs, UploaderComponent, RemovingEventArgs } from '@syncfusion/ej2-angular-inputs';
import { FileInfo } from '@syncfusion/ej2-inputs/src/uploader/uploader';

import { FileSize } from "@core/enums";
import { FileStatusCode } from "@shared/enums/file.enum";
import { Document } from '@shared/models/document.model';

@Component({
  selector: 'app-document-uploader',
  templateUrl: './document-uploader.component.html',
  styleUrls: ['./document-uploader.component.scss'],
})
export class DocumentUploaderComponent implements OnInit, OnChanges {
  @Input() uploaderTitle: string;
  @Input() allowedExtensions = '.pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png';
  @Input() maxFileSize = FileSize.MB_5;
  @Input() documents: Document[] | undefined | null;
  @Input() disabled = false;
  @Input() maxFileAmount = 500;

  @Output() selectDocuments = new EventEmitter<Blob[]>();
  @Output() deleteDocument = new EventEmitter<Document>();

  @ViewChild('previewupload')
  public uploadObj: UploaderComponent;
  public uploaderErrorMessageElement: HTMLElement;
  public dropElement: HTMLElement;
  public isMaxFilesReached = false;

  ngOnInit(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  ngOnChanges(simple: SimpleChanges): void {
    if (simple['documents'].currentValue) {
      this.checkMaxFilesReached(this.documents?.length ?? 0);
    }
  }

  public browse(): void {
    if(this.disabled) {
      return;
    }

    document
      .getElementById('documents-uploader')
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')
      ?.click();
  }

  public onFileSelected(args: SelectedEventArgs): void {
    const filesData: FileInfo[] = this.uploadObj.getFilesData();
    const allFiles: FileInfo[] = filesData.concat(args.filesData);

    args.isModified = true;
    this.emitSelectedDocuments(allFiles);
  }

  public onDelete(document: Document): void {
    if (!Array.isArray(this.documents)) {
      return;
    }

    const index = this.documents.findIndex((d) => d.documentId === document.documentId);

    if (index < 0) {
      return;
    }

    this.documents.splice(index, 1);
    this.documents = [...this.documents];
    this.deleteDocument.emit(document);

    const uploadedFiles = this.uploadObj.getFilesData();
    this.emitSelectedDocuments(uploadedFiles);
  }

  public removeUplodedFile(args: RemovingEventArgs): void {
    const filesData: FileInfo[] = this.uploadObj.getFilesData();
    const allFiles: FileInfo[] = filesData.filter((file) => file.id !== args.filesData[0].id);

    this.emitSelectedDocuments(allFiles);
  }

  private addFilesValidationMessage(file: FileInfo, fileIndex: number) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document
        .getElementsByClassName('e-upload-file-list')
        [fileIndex]?.getElementsByClassName('e-validation-fails')[0] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText =
          file.size > this.maxFileSize
            ? 'The file exceeds the limitation, max allowed 5 MB.'
            : 'The file should be in pdf, doc, docx, xls, xlsx, jpg, jpeg, png format.';
      }
    });
  }

  private emitSelectedDocuments(allFiles: FileInfo[]): void {
    allFiles.forEach((file, index) => this.addFilesValidationMessage(file, index));
    const allFilesReadyToUpload: Blob[] = this.validateFileAmount(allFiles)
      .filter((f) => f.statusCode === FileStatusCode.Valid)
      .map((f) => f.rawFile as Blob);
    
    this.selectDocuments.emit(allFilesReadyToUpload);
  }

  private validateFileAmount(uplodedFiles: FileInfo[]): FileInfo[] {
    const fileAmount = uplodedFiles.length + (this.documents?.length ?? 0);
    this.checkMaxFilesReached(fileAmount);

    if (fileAmount > this.maxFileAmount) {
      const spliceIndex = this.maxFileAmount - fileAmount;
      return [...uplodedFiles].slice(0, spliceIndex);
    } else {
      return uplodedFiles;
    }
  }

  private checkMaxFilesReached(fileAmount: number): void {
    this.isMaxFilesReached = fileAmount >= this.maxFileAmount;
  }
}
