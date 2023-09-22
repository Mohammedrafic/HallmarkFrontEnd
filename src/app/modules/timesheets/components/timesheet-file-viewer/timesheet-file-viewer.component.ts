import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  MagnificationService,
  NavigationService,
  PdfViewerComponent,
  TextSelectionService,
  ToolbarService
} from '@syncfusion/ej2-angular-pdfviewer';

import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { Observable, of, switchMap, takeUntil, tap } from 'rxjs';
import { Destroyable } from '@core/helpers';
import { downloadBlobFile } from '@shared/utils/file.utils';
import { ObservableHelper } from '@core/helpers/observable.helper';
import { FileHelper } from '@core/helpers/file.helper';
import { FileViewer } from '@shared/modules/file-viewer/file-viewer.actions';

@Component({
  selector: 'app-timesheet-file-viewer',
  templateUrl: './timesheet-file-viewer.component.html',
  styleUrls: ['./timesheet-file-viewer.component.scss'],
  providers: [ToolbarService, NavigationService, TextSelectionService, MagnificationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetFileViewerComponent extends Destroyable implements OnInit {

  @ViewChild('PdfViewer')
  public readonly pdfViewerControl: PdfViewerComponent;


  @Output() 
  previewCloseEvent = new EventEmitter<boolean>();

  public isFullScreen: boolean;
  public width = `${window.innerWidth * 0.6}px`;
  public imageSrs = '';
  public isImage: boolean = false;
  public fileName: string;
  public getOriginalFile: (() => Observable<Blob>) | null;

  @Input() preViewDoc:boolean = false;

  public readonly service = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  constructor(
    private store: Store,
    private actions$: Actions,
    private cdr: ChangeDetectorRef,
  ) { 
    super();
  }

  ngOnInit(): void {    
    this.actions$.pipe(
      ofActionSuccessful(FileViewer.Open),
      takeUntil(this.componentDestroy()),
      switchMap(({ payload: { fileName, getPDF, getOriginal } }: FileViewer.Open) => {
        this.fileName = fileName;
        this.getOriginalFile = getOriginal;
        this.preViewDoc = true;
        const image: boolean = this.isImage = FileHelper.isImage(fileName);

        const pdfObs = getPDF?.().pipe(
          switchMap((file: Blob) => ObservableHelper.blobToBase64Observable(file)),
          tap((base64Str: string) => this.pdfViewerControl?.load(base64Str, '')),
        );

        const originalObs = getOriginal?.().pipe(
          switchMap((file: Blob) => ObservableHelper.blobToBase64Observable(file)),
          tap((base64Str: string) => this.imageSrs = base64Str),
        );

        return (image ? originalObs : pdfObs) || of(null);
      })
    ).subscribe(
      () => this.cdr.markForCheck()
    );
  }

  public onCancel(): void {
    this.preViewDoc = false;
    this.isFullScreen = false;
    this.pdfViewerControl?.unload();
    this.isImage = false;
    this.previewCloseEvent.emit(false);
  }

  public downloadFile(): void {
    this.getOriginalFile?.()
      .pipe(
        takeUntil(this.componentDestroy())
      )
      .subscribe((file: Blob) => downloadBlobFile(file, this.fileName));
  }
  

}
