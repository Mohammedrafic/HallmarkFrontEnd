export class FileHelper {
  public static isImage(fileName: string): boolean {
    return !!fileName.match(/.(jpg|jpeg|png|gif)$/i)?.length;
  }
}
