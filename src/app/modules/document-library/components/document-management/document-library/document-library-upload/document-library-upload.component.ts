import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FileSize } from "@core/enums";
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { FileStatusCode } from "@shared/enums/file.enum";
import { SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { FileInfo } from '@syncfusion/ej2-inputs/src/uploader/uploader';
import { Subject, takeUntil } from 'rxjs';
import { ImportResult } from '@shared/models/import.model';

@Component({
  selector: 'app-document-library-upload',
  templateUrl: './document-library-upload.component.html',
  styleUrls: ['./document-library-upload.component.scss'],
})
export class DocumentLibraryUploadComponent extends DestroyableDirective implements OnInit {
  @ViewChild('previewupload') private uploadObj: UploaderComponent;
  @ViewChild('fileUploader') private fileUploader: ElementRef;
  @ViewChild('tab') tab: TabComponent;

  @Input() allowedExtensions = '.pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png';
  @Input() public selectErrorsTab: Subject<void>;
  @Input() public set importResponse(response: any) {
    this.importResult = response;
    this.firstActive = !!this.importResult?.succesfullRecords.length;
  }

  @Output() public saveImportResult: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public uploadToFile: EventEmitter<Blob | null> = new EventEmitter<Blob | null>();

  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;
  public dropElement: HTMLElement;
  public readonly maxFileSize = FileSize.MB_15;
  public selectedFile: FileInfo | null;
  public firstActive = true;
  public uploaderErrorMessageElement: HTMLElement;

  public fields = {
    text: 'name',
    value: 'id',
  };
  public importResult: ImportResult<any> | null;

  get activeErrorTab(): boolean {
    return this.tab?.selectedItem === 1; // errors tab index
  }

  get enabledImportButton(): boolean {
    return (this.selectedFile?.statusCode === FileStatusCode.Valid || !!this.importResult) && !this.activeErrorTab;
  }

  constructor() { super(); }

  ngOnInit(): void {
    this.setDropElement();
  }

  public browse(): void {
    this.fileUploader?.nativeElement?.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }
  public clear(): void {
    this.uploadObj.clearAll();
    this.selectedFile = null;
    this.importResult = null;
    this.uploadToFile.next(null);
  }
  public selectFile(event: SelectedEventArgs): void {
    if (event.filesData.length) {
      this.importResult = null;
      if (event.filesData[0].statusCode === FileStatusCode.Valid) {
        this.selectedFile = event.filesData[0];
        this.uploadToFile.next(this.selectedFile.rawFile as Blob);
      }
      else {
        this.addValidationMessage(event.filesData[0]);
      }
    }
  }
  private addValidationMessage(file: FileInfo) {
    requestAnimationFrame(() => {
      this.uploaderErrorMessageElement = document.getElementsByClassName('e-validation-fails')[0] ?
        document.getElementsByClassName('e-validation-fails')[0] as HTMLElement :
        document.getElementsByClassName('e-file-status e-file-invalid')[0] as HTMLElement;
      if (this.uploaderErrorMessageElement) {
        this.uploaderErrorMessageElement.innerText = file.size > this.maxFileSize
          ? 'The file should not exceed 15MB.'
          : 'The file should be in .pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png format.';
      }
    });
  }
  public onTabSelecting(event: SelectEventArgs): void {
    if (event.isSwiped) {
      event.cancel = true;
    }
  }

  public onTabCreated(): void {
    this.tab.selected.pipe(takeUntil(this.destroy$)).subscribe((event: SelectEventArgs) => {
      this.firstActive = event.selectedIndex === 0;
    });
  }

  private setDropElement(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }
}
