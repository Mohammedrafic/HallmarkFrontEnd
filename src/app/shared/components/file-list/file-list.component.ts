import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { Document } from '@shared/models/document.model';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent {
  @Input() public fileList: Document[] = [];

  @Output() public download: EventEmitter<number> = new EventEmitter();

  public downloadFile(fileId: number): void {
    this.download.emit(fileId);
  }
}
