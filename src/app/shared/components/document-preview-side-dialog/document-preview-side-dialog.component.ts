import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Actions, ofActionDispatched } from '@ngxs/store';
import { DialogComponent } from '@syncfusion/ej2-angular-popups';
import { takeUntil } from 'rxjs';
import { ShowDocPreviewSideDialog } from '../../../store/app.actions';
import { DestroyableDirective } from '../../directives/destroyable.directive';

@Component({
  selector: 'app-document-preview-side-dialog',
  templateUrl: './document-preview-side-dialog.component.html',
  styleUrls: ['./document-preview-side-dialog.component.scss']
})
export class DocumentPreviewSideDialogComponent extends DestroyableDirective implements OnInit {
  @ViewChild('documentPreviewSideDialog') documentPreviewSideDialog: DialogComponent;
  targetElement: HTMLElement = document.body;

  @Input() header: string | null;
  @Input() width: string = '1000px';

  @Output() previewCloseClick = new EventEmitter();
  constructor(private action$: Actions) {
    super();
  }

  ngOnInit(): void {
    this.action$.pipe(ofActionDispatched(ShowDocPreviewSideDialog), takeUntil(this.destroy$)).subscribe((payload) => {
      if (payload.isDocPreviewDialogShown) {
        this.documentPreviewSideDialog.show();
      } else {
        this.documentPreviewSideDialog.hide();
      }
    });
  }

  onClosePreviewClick(): void {
    this.previewCloseClick.emit();
  }
}
