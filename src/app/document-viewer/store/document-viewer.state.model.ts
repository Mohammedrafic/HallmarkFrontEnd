
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

export interface Statuses{
  orderId: number;
  jobId: number;
  nextApplicantStatus: Status;
  UserId:string;
}

export interface Status{
  applicantStatus: number;
  statusText: string;
}
