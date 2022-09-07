import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ImportResult } from "@shared/models/import.model";
import { ImportedLocation } from "@shared/models/location.model";

import { SelectedEventArgs, UploaderComponent } from "@syncfusion/ej2-angular-inputs";
import { SelectEventArgs, TabComponent } from "@syncfusion/ej2-angular-navigations";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { FileInfo } from "@syncfusion/ej2-inputs/src/uploader/uploader";
import { filter, Subject, takeUntil } from "rxjs";

import { DELETE_CONFIRM_TEXT, DELETE_CONFIRM_TITLE, IMPORT_CONFIRM_TEXT, IMPORT_CONFIRM_TITLE } from "@shared/constants";
import { DestroyableDirective } from "@shared/directives/destroyable.directive";
import { ConfirmService } from "@shared/services/confirm.service";

@Component({
  selector: 'app-import-dialog-content',
  templateUrl: './import-dialog-content.component.html',
  styleUrls: ['./import-dialog-content.component.scss']
})
export class ImportDialogContentComponent extends DestroyableDirective implements OnInit {
  @ViewChild('sideDialog') private sideDialog: DialogComponent;
  @ViewChild('previewupload') private uploadObj: UploaderComponent;
  @ViewChild('fileUploader') private fileUploader: ElementRef;
  @ViewChild('tab') tab: TabComponent;

  @Output() public downloadTemplateEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output() public downloadErrorsEvent: EventEmitter<ImportedLocation[]> = new EventEmitter<ImportedLocation[]>();
  @Output() public saveImportResult: EventEmitter<any> = new EventEmitter<any>(); // TODO
  @Output() public uploadImportFile: EventEmitter<any> = new EventEmitter<any>(); // TODO

  @Input() public dialogEvent: Subject<boolean>;
  @Input() public selectErrorsTab: Subject<void>;
  @Input() public set importResponse(response: any) {
    this.importResult = response;
    this.firstActive = !!this.importResult?.succesfullRecords.length;
  };

  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;
  public dropElement: HTMLElement;
  public readonly allowedExtensions: string = '.xlsx';
  public readonly maxFileSize = 10485760; // 10 mb
  public selectedFile: FileInfo | null;
  public firstActive = true;

  public fields = {
    text: 'name',
    value: 'id'
  }
  public importResult: ImportResult<any> | null;

  get activeErrorTab(): boolean {
    return this.tab?.selectedItem === 1; // errors tab index
  }

  get enabledImportButton(): boolean {
    return (this.selectedFile?.statusCode === '1' || !!this.importResult) && !this.activeErrorTab;
  }

  constructor(private confirmService: ConfirmService) {
    super();
  }

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.subscribeOnSelectErrorsTab();
  }

  public browse() : void {
    this.fileUploader?.nativeElement
      ?.getElementsByClassName('e-file-select-wrap')[0]
      ?.querySelector('button')?.click();
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

  public onCancel(): void {
    if (this.importResult) {
      this.confirmService
        .confirm(DELETE_CONFIRM_TEXT, {
          title: DELETE_CONFIRM_TITLE,
          okButtonLabel: 'Leave',
          okButtonClass: 'delete-button'
        })
        .pipe(filter((confirm) => confirm))
        .subscribe(() => {
          this.closeDialog();
        });
    } else {
      this.closeDialog();
    }
  }

  public downloadTemplate(): void {
    this.downloadTemplateEvent.next();
  }

  public downloadErrors(): void {
    this.downloadErrorsEvent.next(this.importResult?.errorRecords || []);
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

  public onImport(): void {
    if (this.importResult) {
      this.saveImportedItems();
    } else {
      this.uploadFile()
    }
  }

  private setDropElement(): void {
    this.dropElement = document.getElementById('droparea') as HTMLElement;
  }

  private subscribeOnOpenEvent(): void {
    this.dialogEvent.pipe(takeUntil(this.destroy$)).subscribe((value: boolean) => {
      if (value) {
        this.sideDialog.show();
        this.setDropElement();
      } else {
        this.closeDialog();
      }
    });
  }

  private closeDialog(): void {
    this.sideDialog.hide();
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

  private saveImportedItems(): void {
    if (this.importResult?.errorRecords.length) {
      this.confirmService
        .confirm(IMPORT_CONFIRM_TEXT, {
          title: IMPORT_CONFIRM_TITLE,
          okButtonLabel: 'Import',
          okButtonClass: ''
        })
        .pipe(filter((confirm) => confirm))
        .subscribe(() => {
          this.saveImportResult.next(this.importResult?.succesfullRecords || []);
        });
    } else {
      this.saveImportResult.next(this.importResult?.succesfullRecords || []);
    }
  }

  private subscribeOnSelectErrorsTab(): void {
    this.selectErrorsTab.pipe(takeUntil(this.destroy$)).subscribe(() => this.tab.select(1));
  }
}
