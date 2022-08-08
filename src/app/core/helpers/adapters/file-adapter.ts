import { FileForUpload } from '@core/interface';

import { FileInfo } from '@syncfusion/ej2-angular-inputs';

export class FileAdapter {
  static adaptRawEventFiles(rawFiles: FileInfo[]): FileForUpload[] {
    return rawFiles.map((file) => {
      return {
        blob: file.rawFile as Blob,
        fileName: file.name,
      }
    })
  }
}