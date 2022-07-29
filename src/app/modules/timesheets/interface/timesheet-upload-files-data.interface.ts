export interface TimesheetUploadFilesData {
  timesheetId: number;
  files: TimesheetFileData[];
  organizationId: number | null;
}

export interface TimesheetFileData {
  blob: Blob;
  fileName: string;
}

export interface DeleteAttachmentData {
  fileId: number;
  timesheetId: number;
  organizationId: number | null;
}

export interface DownloadAttachmentData {
  fileId: number;
  organizationId: number | null;
}
