import { FileViewerData } from './file-viewer-data.interface';

export namespace FileViewer {
  export class Open {
    public static readonly type = '[file viewer] show file';

    public constructor(
      public payload: FileViewerData,
    ) {
    }
  }
}
