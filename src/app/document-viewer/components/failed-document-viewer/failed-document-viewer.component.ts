import { Component, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-failed-document-viewer',
  templateUrl: './failed-document-viewer.component.html',
  styleUrls: ['./failed-document-viewer.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FailedDocumentViewerComponent {
}
