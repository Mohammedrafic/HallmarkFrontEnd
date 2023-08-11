import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { take } from 'rxjs';   

import { Document } from '@shared/models/document.model';
import { OrderFileService } from './service/download-file.service';
import { downloadBlobFile } from '@shared/utils/file.utils';

@Component({
  selector: 'app-file-list',
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileListComponent {
  @Input() public fileList: Document[] = [];
  @Input() public orderId: number;

  constructor(private orderFileService: OrderFileService) {}

  public downloadFile(document: Document): void {
    this.orderFileService.downloadFile(this.orderId, document.documentId)
    .pipe(take(1))
    .subscribe((file: Blob) => {
        downloadBlobFile(file, document.documentName);
    });
  }
}
