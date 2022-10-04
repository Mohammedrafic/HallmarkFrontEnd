import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DestroyableDirective } from '@shared/directives/destroyable.directive';
import { SelectedEventArgs, UploaderComponent } from '@syncfusion/ej2-angular-inputs';
import { SelectEventArgs, TabComponent } from '@syncfusion/ej2-angular-navigations';
import { FileInfo } from '@syncfusion/ej2-inputs/src/uploader/uploader';
import { filter, Subject, takeUntil } from 'rxjs';
import { ConfirmService } from '@shared/services/confirm.service';
import { ImportResult } from '@shared/models/import.model';
import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE } from '@shared/constants';

@Component({
  selector: 'app-document-library-upload',
  templateUrl: './document-library-upload.component.html',
  styleUrls: ['./document-library-upload.component.scss']
})
export class DocumentLibraryUploadComponent extends DestroyableDirective implements OnInit {
  @ViewChild('previewupload') private uploadObj: UploaderComponent;
  @ViewChild('fileUploader') private fileUploader: ElementRef;
  @ViewChild('tab') tab: TabComponent;

  @Input() public selectErrorsTab: Subject<void>;
  @Input() public set importResponse(response: any) {
    this.importResult = response;
    this.firstActive = !!this.importResult?.succesfullRecords.length;
  }

  @Output() public saveImportResult: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output() public uploadImportFile: EventEmitter<Blob> = new EventEmitter<Blob>();

  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;
  public dropElement: HTMLElement;
  @Input() allowedExtensions: string = '.pdf, .doc, .docx, .xls, .xlsx, .jpg, .jpeg, .png';
  public readonly maxFileSize = 10485760; // 10 mb
  public selectedFile: FileInfo | null;
  public firstActive = true;

  public fields = {
    text: 'name',
    value: 'id',
  };
  public importResult: ImportResult<any> | null;

  get activeErrorTab(): boolean {
    return this.tab?.selectedItem === 1; // errors tab index
  }

  get enabledImportButton(): boolean {
    return (this.selectedFile?.statusCode === '1' || !!this.importResult) && !this.activeErrorTab;
  }

  constructor(private confirmService: ConfirmService) { super(); }

  ngOnInit(): void {
  }

  public browse(): void {
    this.fileUploader?.nativeElement?.getElementsByClassName('e-file-select-wrap')[0]?.querySelector('button')?.click();
  }
  public clear(): void {
    this.uploadObj.clearAll();
    this.selectedFile = null;
    this.importResult = null;
  }
  public selectFile(event: SelectedEventArgs): void {
    if (event.filesData.length) {
      this.importResult = null;
      this.selectedFile = event.filesData[0];
    }
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

  private closeDialog(): void {
    this.importResult = null;
    this.selectedFile = null;
    this.uploadObj.clearAll();
  }

  private uploadFile(): void {
    if (this.selectedFile?.statusCode === '1') {
      this.importResult = null;
      this.uploadImportFile.next(this.selectedFile.rawFile as Blob);
    }
  }
}
