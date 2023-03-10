import { CandidateState } from '@agency/store/candidate.state';
import { AfterViewInit, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { Observable, Subject, Subscription, debounceTime, fromEvent, takeUntil } from 'rxjs';

import { ListBox, SelectionSettingsModel } from '@syncfusion/ej2-angular-dropdowns';
import {
  MagnificationService,
  NavigationService,
  TextSelectionService,
  ToolbarService,
} from '@syncfusion/ej2-angular-pdfviewer';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { getInstance } from '@syncfusion/ej2-base';

import { CredentialGroupedFiles } from '@shared/models/candidate-credential.model';
import {
  GetCredentialFiles,
  GetCredentialFilesSucceeded,
  GetCredentialPdfFiles,
  GetCredentialPdfFilesSucceeded
} from '@agency/store/candidate.actions';

import { FormControl, Validators } from '@angular/forms';
import { DEFAULT_ZOOM } from './file-viewer.constant';

interface ListBoxItem {
  name: string;
  id: number;
  category: string;
}

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss'],
  providers: [ToolbarService, NavigationService, TextSelectionService, MagnificationService],
})
export class FileViewerComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('sideDialog') sideDialog: DialogComponent;

  @Input() openEvent: Subject<number>;

  public isFullScreen: boolean;
  public isSidebarOpen = true;
  public keepSidebarOpen = true;
  public hideSidebarKeepOpenButton: boolean;
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
  public imageSrs = '';
  public imageMode = false;
  public loadedFileUrl = '';
  public zoom: number = 1.0;
  public originalSize: boolean = true;
  public page: number = 1;
  public totalPages: number = 0;
  public pageSelection: FormControl = new FormControl('');

  public service = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  private unsubscribe$: Subject<void> = new Subject();
  private isDownloading = false;
  private resizeObservable$: Observable<Event>;
  private resizeSubscription$: Subscription;
  sidebarType = 'Over';

  @Select(CandidateState.groupedCandidateCredentialsFiles)
  public groupedCandidateCredentialsFiles$: Observable<CredentialGroupedFiles[]>;

  constructor(private store: Store, private actions$: Actions, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.subscribeOnPdfFileLoaded();
    this.subscribeOnFileLoaded();
    this.subscribeOnGroupedCandidateCredentialsFiles();

    this.pageSelection.valueChanges.subscribe(x => {
      this.page = x;
    });

    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription$ = this.resizeObservable$
      .pipe(debounceTime(500), takeUntil(this.unsubscribe$))
      .subscribe(() => this.setResponsiveWidths());
  }

  ngAfterViewInit(): void {
    this.setResponsiveWidths();
  }

  private setResponsiveWidths() {
      if (window.innerWidth < 1130) {
        this.keepSidebarOpen = false;
        this.hideSidebarKeepOpenButton = false;
        this.width = `${window.innerWidth - 66}px`;
    } else {
      this.width = `${window.innerWidth * 0.6}px`;
      this.isSidebarOpen = true;
      this.keepSidebarOpen = true;
      this.hideSidebarKeepOpenButton = true;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCancel(): void {
    this.sideDialog.hide();
    this.isFullScreen = false;
    this.previewFile = null;
    this.data = [];
  }

  public resizeDialog(): void {
    this.zoom = DEFAULT_ZOOM;
    this.isFullScreen = !this.isFullScreen;
    this.sideDialog.show(this.isFullScreen);
  }

  public selectFile(event: any): void {
    this.previewFile = event.items[0];
    this.setMode();
    if (this.imageMode) {
      this.getOriginalFileById((this.previewFile as ListBoxItem).id);
    } else {
      this.getPdfFileById((this.previewFile as ListBoxItem).id);
    }
    this.isSidebarOpen = this.keepSidebarOpen ? this.isSidebarOpen : false;
  }

  public downloadFile(): void {
    this.isDownloading = true;
    this.getOriginalFileById((this.previewFile as ListBoxItem).id);
  }

  public onListBoxCreated(): void {
    let listBoxObj: ListBox = getInstance(document.getElementById("listBox") as HTMLElement, ListBox) as ListBox;

    listBoxObj.selectItems([(this.previewFile as ListBoxItem).name]);
    if (this.imageMode) {
      this.getOriginalFileById((this.previewFile as ListBoxItem).id);
    } else {
      this.getPdfFileById((this.previewFile as ListBoxItem).id);
    }
  }

  private getPdfFileById(id: number): void {
    this.store.dispatch(new GetCredentialPdfFiles(id));
  }

  private getOriginalFileById(id: number): void {
    this.store.dispatch(new GetCredentialFiles(id));
  }

  private subscribeOnOpenEvent(): void {
    this.openEvent.pipe(takeUntil(this.unsubscribe$)).subscribe((fileId: number) => {
      this.previewFile = this.data.find(item => item.id === fileId) as ListBoxItem;
      this.setMode();
      this.sideDialog.show(this.isFullScreen);
    });
  }

  private subscribeOnPdfFileLoaded(): void {
    this.actions$.pipe(
      takeUntil(this.unsubscribe$),
      ofActionSuccessful(GetCredentialPdfFilesSucceeded)
    ).subscribe((file: { payload: Blob }) => {
      const reader = new FileReader();
      //  file.payload.
      reader.readAsDataURL(file.payload);
      // Convert blob to url
      this.loadedFileUrl = URL.createObjectURL(file.payload);
      this.cdr.markForCheck();
    });
  }

  private subscribeOnFileLoaded(): void {
    this.actions$.pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetCredentialFilesSucceeded))
      .subscribe((file: { payload: Blob }) => {
        if (this.isDownloading) {
          this.isDownloading = false;
          downloadBlobFile(file.payload, (this.previewFile as ListBoxItem).name);
          // Convert blob to url
          this.loadedFileUrl = URL.createObjectURL(file.payload);
          this.cdr.markForCheck();
        } else {
          this.setImage(file.payload);
        }
      });
  }

  private subscribeOnGroupedCandidateCredentialsFiles(): void {
    this.groupedCandidateCredentialsFiles$.pipe(takeUntil(this.unsubscribe$))
      .subscribe((groupedFiles: CredentialGroupedFiles[]) => {
        this.data = [];
        groupedFiles.forEach(category => {
          const dataItems = category.files.map(file => {
            return { name: file.name, id: file.id, category: category.credentialTypeName };
          });

          this.data = this.data.concat(dataItems as unknown  as ListBoxItem);
        });
      });
  }

  private setMode(): void {
    const imageExtensions = ['jpg', 'jpeg', 'png'];
    const extension = this.getExtension(this.previewFile?.name as string);
    this.imageMode = imageExtensions.includes(extension);
  }

  private getExtension(fileName: string): string {
    return fileName.split('.').pop() || '';
  }

  private setImage(file: Blob): void {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      this.imageSrs = reader.result as string;
      this.cdr.markForCheck();
    }
  }

  incrementZoom(amount: number) {
    var zoom = this.zoom + amount;
    if(zoom < 0.1) return;
    this.zoom = zoom;
  }

  resetZoom() {
    this.zoom = DEFAULT_ZOOM;
  }

  nextPage() {
    if(this.page == this.totalPages) return;
    this.page++;
  }

  prevPage() {
    if(this.page == 1) return;
    this.page--;
  }

  firstPage() {
    this.page = 1;
  }

  lastPage() {
    this.page = this.totalPages;
  }

  pagechanging(e: any){
    this.page = e.pageNumber;
    this.pageSelection.setValue(e.pageNumber);
  }

  afterLoadComplete(pdfData: any) {
    this.totalPages = pdfData.numPages;
    this.pageSelection.setValidators([Validators.min(1), Validators.max(this.totalPages)]);
    this.page = 1;
    this.pageSelection.setValue(1);
  }
}
