export namespace FileViewer {
  export class Open {
    public static readonly type = '[file viewer] show file';

    public constructor(
      public name: string,
      public blob: Blob,
    ) {
    }
  }
}
