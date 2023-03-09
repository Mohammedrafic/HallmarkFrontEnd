import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-failed-document-viewer',
  templateUrl: './failed-document-viewer.component.html',
  styleUrls: ['./failed-document-viewer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FailedDocumentViewerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
