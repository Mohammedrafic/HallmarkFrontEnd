/* eslint-disable no-plusplus */
import { DEFAULT_ZOOM } from '@shared/components/credential-file-viewer/file-viewer.constant';

import { getInstance } from '@syncfusion/ej2-base';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  AfterViewInit,
  ChangeDetectorRef,
  Input,
  OnDestroy,
  ViewEncapsulation,
  AfterContentInit,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Actions, Select, Store, ofActionSuccessful } from '@ngxs/store';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { SelectionSettingsModel, ListBox } from '@syncfusion/ej2-angular-dropdowns';
import { Subject, Observable, Subscription, fromEvent, debounceTime, takeUntil, filter } from 'rxjs';
import { ToolbarService } from '@syncfusion/ej2-angular-grids';
import { TextSelectionService, MagnificationService, NavigationService } from '@syncfusion/ej2-angular-pdfviewer';
import { DocumentViewerState } from 'src/app/document-viewer/store/document-viewer.state';
import { FileGroup } from 'src/app/document-viewer/store/document-viewer.state.model';
import {
  GetFiles,
  GetFilesSucceeded,
  GetGroupedFiles,
  GetPdfFiles,
  GetPdfFilesSucceeded,
} from 'src/app/document-viewer/store/document-viewer.actions';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-document-viewer',
  templateUrl: './document-viewer.component.html',
  styleUrls: ['./document-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [ToolbarService, NavigationService, TextSelectionService, MagnificationService],
})
export class DocumentViewerComponent implements OnInit, OnDestroy, AfterContentInit {
  public isFullScreen: boolean;
  public isSidebarOpen = true;
  public keepSidebarOpen = true;
  public hideSidebarKeepOpenButton: boolean;
  public targetElement: HTMLElement = document.body;
  public data: ListBoxItem<string>[] = [];
  public fields = {
    groupBy: 'category',
    text: 'name',
    value: 'id',
  };
  public selectionSettings: SelectionSettingsModel = { mode: 'Single' };
  public previewFile: ListBoxItem<string> | null;
  public imageSrs = '';
  public imageMode = false;
  public loadedFileUrl = '';
  public zoom = 1.0;
  public originalSize = true;
  public page = 1;
  public totalPages = 0;
  public pageSelection: FormControl = new FormControl('');
  public initialFileId: string;

  public service = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  private fileHash: string;
  private unsubscribe$: Subject<void> = new Subject();
  private isDownloading = false;
  private resizeObservable$: Observable<Event>;
  private resizeSubscription$: Subscription;
  sidebarType = 'Over';

  @Select(DocumentViewerState.groupedFiles)
  public files$: Observable<FileGroup[]>;

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router,
    private store: Store,
    private actions$: Actions,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscribeOnOpenEvent();
    this.subscribeOnPdfFileLoaded();
    this.subscribeOnFileLoaded();
    this.subscribeOnGroupedCandidateCredentialsFiles();

    this.pageSelection.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe((x) => {
      this.page = x;
    });

    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSubscription$ = this.resizeObservable$
      .pipe(debounceTime(500), takeUntil(this.unsubscribe$))
      .subscribe(() => this.setResponsiveWidths());
  }

  ngAfterContentInit(): void {
    this.setResponsiveWidths();
  }

  private setResponsiveWidths() {
    if (window.innerWidth < 1130) {
      this.keepSidebarOpen = false;
      this.hideSidebarKeepOpenButton = false;
    } else {
      this.isSidebarOpen = true;
      this.keepSidebarOpen = true;
      this.hideSidebarKeepOpenButton = true;
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public onCancel(): void {
    this.isFullScreen = false;
    this.previewFile = null;
    this.data = [];
  }

  public resizeDialog(): void {
    this.zoom = DEFAULT_ZOOM;
    this.isFullScreen = !this.isFullScreen;
  }

  public selectFile(event: any): void {
    this.previewFile = event.items[0];
    this.setMode();
    if (this.imageMode) {
      this.getOriginalFileById((this.previewFile as ListBoxItem<string>).id);
    } else {
      this.getPdfFileById((this.previewFile as ListBoxItem<string>).id);
    }
    this.isSidebarOpen = this.keepSidebarOpen ? this.isSidebarOpen : false;
  }

  public downloadFile(): void {
    this.isDownloading = true;
    this.getOriginalFileById((this.previewFile as ListBoxItem<string>).id);
  }

  public onListBoxCreated(): void {
    const listBoxObj: ListBox = getInstance(document.getElementById('listBox') as HTMLElement, ListBox) as ListBox;

    listBoxObj.selectItems([(this.previewFile as ListBoxItem<string>).name]);
    if (this.imageMode) {
      this.getOriginalFileById((this.previewFile as ListBoxItem<string>).id);
    } else {
      this.getPdfFileById((this.previewFile as ListBoxItem<string>).id);
    }
  }

  private getPdfFileById(id: string): void {
    this.store.dispatch(new GetPdfFiles(this.fileHash, id));
  }

  private getOriginalFileById(id: string): void {
    this.store.dispatch(new GetFiles(this.fileHash, id));
  }

  private subscribeOnOpenEvent(): void {
    this.activeRoute.params.pipe(takeUntil(this.unsubscribe$)).subscribe((params) => {
      if (params['id']) {
        this.fileHash = params['id'];
        this.store.dispatch(new GetGroupedFiles(this.fileHash));
        this.initialFileId = params['initialId'];
      }
    });
  }

  private subscribeOnPdfFileLoaded(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetPdfFilesSucceeded))
      .subscribe((file: { payload: Blob }) => {
        const reader = new FileReader();
        //  file.payload.
        reader.readAsDataURL(file.payload);
        // Convert blob to url
        this.loadedFileUrl = URL.createObjectURL(file.payload);
        this.cdr.markForCheck();
      });
  }

  private subscribeOnFileLoaded(): void {
    this.actions$
      .pipe(takeUntil(this.unsubscribe$), ofActionSuccessful(GetFilesSucceeded))
      .subscribe((file: { payload: Blob }) => {
        if (this.isDownloading) {
          this.isDownloading = false;
          downloadBlobFile(file.payload, (this.previewFile as ListBoxItem<string>).name);
          // Convert blob to url
          this.loadedFileUrl = URL.createObjectURL(file.payload);
        } else {
          this.setImage(file.payload);
        }
        this.cdr.markForCheck();
      });
  }

  private subscribeOnGroupedCandidateCredentialsFiles(): void {
    this.files$
      .pipe(
        filter((x: FileGroup[]) => x !== null && x !== undefined),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((groupedFiles: FileGroup[]) => {
        this.data = [];
        groupedFiles.forEach((category) => {
          const dataItems = category.files.map((file) => {
            return { name: file.name, id: file.fileId, category: category.groupName } as ListBoxItem<string>;
          });
          this.data = this.data.concat(dataItems);
        });

        if (this.data.length > 0) {
          this.previewFile =
            (this.data.find((item) => item.id === this.initialFileId) as ListBoxItem<string>) || this.data[0];
        } else {
          // this.router.navigate(['/', 'document-viewer']);
        }
        this.cdr.markForCheck();
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
    };
  }

  incrementZoom(amount: number) {
    const zoom = this.zoom + amount;
    if (zoom < 0.1) return;
    this.zoom = zoom;
  }

  resetZoom() {
    this.zoom = DEFAULT_ZOOM;
  }

  nextPage() {
    if (this.page == this.totalPages) return;
    this.page++;
  }

  prevPage() {
    if (this.page == 1) return;
    this.page--;
  }

  firstPage() {
    this.page = 1;
  }

  lastPage() {
    this.page = this.totalPages;
  }

  pagechanging(e: { pageNumber: number } | any) {
    this.page = e.pageNumber;
    this.pageSelection.setValue(e.pageNumber);
  }

  afterLoadComplete(pdfData: { numPages: number } | any) {
    this.totalPages = pdfData.numPages;
    this.pageSelection.setValidators([Validators.min(1), Validators.max(this.totalPages)]);
    this.page = 1;
    this.pageSelection.setValue(1);
  }
}
export interface ListBoxItem<T> {
  name: string;
  id: T;
  category: string;
}
