import { ChangeDetectorRef, Component, Input, OnInit, ViewChild } from '@angular/core';
import { PdfViewerComponent } from '@syncfusion/ej2-angular-pdfviewer';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { FileViewer } from './file-viewer.actions';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html',
  styleUrls: ['./file-viewer.component.scss']
})
export class FileViewerComponent implements OnInit {
  private _fileData: unknown;

  @ViewChild('pdfViewer')
  public readonly pdfViewerControl: PdfViewerComponent;

  @ViewChild('sideDialog')
  public readonly sideDialog: DialogComponent;

  @Input()
  public visible: boolean = false;

  public isFullScreen: boolean;
  public width = `${window.innerWidth * 0.6}px`;
  public imageSrs = '';
  public imageMode = false;
  public isDownloading: boolean = false;
  public base64Data: string;
  public openEvent: FileViewer.Open | null = null;

  public readonly service = 'https://ej2services.syncfusion.com/production/web-services/api/pdfviewer';

  constructor(
    private store: Store,
    private actions$: Actions,
    private cdr: ChangeDetectorRef,
  ) {
  }

  public ngOnInit(): void {
    this.actions$.pipe(
      ofActionSuccessful(FileViewer.Open),
    ).subscribe((openEvent: FileViewer.Open) => {
      const reader = new FileReader();

      this.sideDialog.show();
      this.imageMode = isBlobImage(openEvent.blob);
      this.openEvent = openEvent;

      reader.onloadend = () => {
        this.base64Data = reader.result as string;
        this.pdfViewerControl?.load(this.base64Data, '');
      }

      reader.readAsDataURL(openEvent.blob);
    });
  }

  public resizeDialog(): void {
    this.isFullScreen = !this.isFullScreen;
    this.sideDialog.show(this.isFullScreen);
  }

  public onCancel(): void {
    this.sideDialog.hide();
    this.isFullScreen = false;
    // this.pdfViewerControl?.unload();
    // this.previewFile = null;
    // this.data = [];
  }

  public downloadFile(): void {
    this.isDownloading = true;
    // this.getOriginalFileById((this.previewFile as ListBoxItem).id);
  }
}

function isBlobImage(file: Blob): boolean {
  return file?.type ? file.type.includes('image/') : false;
}
