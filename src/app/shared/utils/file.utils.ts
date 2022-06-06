import { ExportedFileType } from "@shared/enums/exported-file-type";

export const saveSpreadSheetDocument = (url: string, name: string, ext: ExportedFileType) => {
  const anchor = document.createElement('a');
  anchor.download = name + (ext === ExportedFileType.csv ? '.csv' : '.xlsx');
  anchor.href = url;
  anchor.click();
}

export const downloadBlobFile = (file: Blob, nameWithExt: string) => {
  const anchor = document.createElement('a');
  const objectUrl = URL.createObjectURL(file);

  anchor.href = objectUrl
  anchor.download = nameWithExt;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}
