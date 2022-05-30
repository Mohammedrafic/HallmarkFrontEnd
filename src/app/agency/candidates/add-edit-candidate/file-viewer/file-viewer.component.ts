import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionSuccessful, Store } from "@ngxs/store";

import { ListBox, SelectionSettingsModel } from "@syncfusion/ej2-angular-dropdowns";
import {
  MagnificationService,
  NavigationService,
  PdfViewerComponent,
  TextSelectionService,
  ToolbarService
} from "@syncfusion/ej2-angular-pdfviewer";
import { DialogComponent } from "@syncfusion/ej2-angular-popups";
import { getInstance } from '@syncfusion/ej2-base';
import { Subject, takeUntil } from "rxjs";

import { PreviewFileData } from "@shared/models/candidate-credential.model";
import { GetCredentialFiles, GetCredentialFilesSucceeded } from "@agency/store/candidate.actions";

interface ListBoxItem {
  name: string;
  id: number;
  category: string;
}

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
  providers: [ToolbarService, NavigationService, TextSelectionService, MagnificationService]
})
export class FileViewerComponent implements OnInit, OnDestroy {
  @ViewChild('pdfViewer') pdfViewerControl: PdfViewerComponent;
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() openEvent: Subject<PreviewFileData>;

  public isFullScreen: boolean;
  public width = `${window.innerWidth * 0.6}px`;
  public targetElement: HTMLElement = document.body;
  public data: ListBoxItem[] = [];
  public fields = {
    groupBy: 'category',
    text: 'name',
    value: 'id'
  }
  public selectionSettings: SelectionSettingsModel = { mode: 'Single' };
  public previewFile: ListBoxItem | null;

  public service = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  private unsubscribe$: Subject<void> = new Subject();
  private file: Blob;

  constructor(private store: Store, private actions$: Actions) {}

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.subscribeOnPdfFileLoaded();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCancel(): void {
    this.sideDialog.hide();
    this.isFullScreen = false;
    this.pdfViewerControl.unload();
    this.previewFile = null;
    this.data = [];
  }

  public resizeDialog(): void {
    this.isFullScreen = !this.isFullScreen;
    this.sideDialog.show(this.isFullScreen);
  }

  public selectFile(event: any): void {
    this.previewFile = event.items[0];
    this.pdfViewerControl.unload();
    this.getFileById((this.previewFile as ListBoxItem).id);
  }

  downloadFile(): void {
    const a = document.createElement('a');
    const objectUrl = URL.createObjectURL(this.file);

    a.href = objectUrl
    a.download = (this.previewFile as ListBoxItem).name;
    a.click();
    URL.revokeObjectURL(objectUrl);
  }

  public onListBoxCreated(): void {
    let listBoxObj: ListBox = getInstance(document.getElementById("listBox") as HTMLElement, ListBox) as ListBox;

    listBoxObj.selectItems([(this.previewFile as ListBoxItem).name]);
    this.getFileById((this.previewFile as ListBoxItem).id);
  }

  private getFileById(id: number): void {
    this.store.dispatch(new GetCredentialFiles(id));
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((data: PreviewFileData) => {
      data.credentials.forEach(credential => {
        const dataItems = credential.credentialFiles?.map(file => {
          return { name: file.name, id: file.id, category: credential.masterName };
        });

        this.data = this.data.concat(dataItems as unknown  as ListBoxItem);
      })
      this.previewFile = this.data.find(item => item.id === data.selectedFileId) as ListBoxItem;
      this.sideDialog.show(this.isFullScreen);
    });
  }

  private subscribeOnPdfFileLoaded(): void {
    this.actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(GetCredentialFilesSucceeded)
    ).subscribe((file: { payload: Blob }) => {
      const reader = new FileReader();

      this.file = file.payload;
      reader.readAsDataURL(file.payload);
      reader.onloadend = () => {
        this.pdfViewerControl.load(reader.result as string, '');
      }
    });
  }
}
