export interface TimesheetAttachment {
  id: number;
  fileName: string;
  // TODO: Remove after connection with API
  blob?: Blob;
}
