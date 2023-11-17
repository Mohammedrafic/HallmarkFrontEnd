
export interface DocumentViewerModel {
  groupedFiles: FileGroup[];
  fileHash: string;
}

export interface FileGroup {
  groupName: string;
  files: DocumentViewerFile[];
}

export interface DocumentViewerFile {
  id: number;
  name: string;
  fileId: string;
}

export interface Status{
  orderId: number;
  statusText: string;
  jobId: number;
}
