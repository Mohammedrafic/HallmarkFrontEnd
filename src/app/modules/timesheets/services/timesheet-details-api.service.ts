import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ExportPayload } from '@shared/models/export.model';
import {
  ChangeStatusData,
  DeleteAttachmentData,
  DownloadAttachmentData,
  TimesheetDetailsModel,
  TimesheetFileData
} from '../interface';

@Injectable()
export class TimesheetDetailsApiService {
  constructor(private http: HttpClient) { }

  public export(data: ExportPayload): Observable<Blob>  {
    const testData = {field1: 'Field1Value', field2: 'Field2Value'};
    return of(
      new Blob([JSON.stringify(testData, null, 2)], {type: 'application/text'})
    );
  }

  public loadInvoiceBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  public getTimesheetDetails(
    id: number,
    orgId: number,
    isAgency: boolean,
  ): Observable<TimesheetDetailsModel> {
    const endpoint = !isAgency ? `/api/Timesheets/${id}` : `/api/Timesheets/${id}/organization/${orgId}`
    return this.http.get<TimesheetDetailsModel>(endpoint);
  }

  public organizationUploadFiles(timesheetId: number, files: TimesheetFileData[]): Observable<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file.blob, file.fileName))

    return this.http.post<void>(`/api/Timesheets/${timesheetId}/files`, formData);
  }

  public agencyUploadFiles(timesheetId: number, organizationId: number, files: TimesheetFileData[]): Observable<void> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file.blob, file.fileName))

    return this.http.post<void>(`/api/Timesheets/${timesheetId}/organization/${organizationId}/files`, formData);
  }

  public deleteAttachment({fileId, timesheetId, organizationId}: DeleteAttachmentData): Observable<void> {
    return organizationId === null ?
      this.organizationDeleteAttachment(fileId, timesheetId) :
      this.agencyDeleteAttachment(fileId, timesheetId, organizationId)
  }

  public downloadAttachment({fileId, organizationId}: DownloadAttachmentData): Observable<Blob> {
    return organizationId === null ?
      this.organizationDownloadAttachment(fileId) :
      this.agencyDownloadAttachment(fileId, organizationId);
  }

  public downloadPDFAttachment({fileId, organizationId}: DownloadAttachmentData): Observable<Blob> {
    return organizationId === null ?
      this.organizationDownloadPDFAttachment(fileId) :
      this.agencyDownloadPDFAttachment(fileId, organizationId);
  }

  public changeTimesheetStatus(data: ChangeStatusData): Observable<void> {
    return this.http.post<void>(`/api/TimesheetState/setstatus`, data);
  }

  public noWorkPerformed(timesheetId: number, organizationId: number | null): Observable<void> {
    return this.http.post<void>(`/api/Timesheets/noworkperformed`, {
      timesheetId,
      organizationId,
      noWorkPerformed: true,
    });
  }

  private organizationDownloadAttachment(fileId: number): Observable<Blob> {
    return this.http.get(`/api/Timesheets/files/${fileId}`, {
      responseType: 'blob',
    });
  }

  private organizationDownloadPDFAttachment(fileId: number): Observable<Blob> {
    return this.http.get(`/api/Timesheets/files/${fileId}/pdf`, {
      responseType: 'blob'
    });
  }

  private agencyDownloadAttachment(fileId: number, organizationId: number): Observable<Blob> {
    return this.http.get(`/api/Timesheets/organization/${organizationId}/files/${fileId}`, {
      responseType: 'blob'
    });
  }

  private agencyDownloadPDFAttachment(fileId: number, organizationId: number): Observable<Blob> {
    return this.http.get(`/api/Timesheets/organization/${organizationId}/files/${fileId}/pdf`, {
      responseType: 'blob',
    });
  }

  private organizationDeleteAttachment(fileId: number, timesheetId: number): Observable<void> {
    return this.http.delete<void>(`/api/Timesheets/${timesheetId}/files/${fileId}`);
  }

  private agencyDeleteAttachment(fileId: number, timesheetId: number, organizationId: number): Observable<void> {
    return this.http.delete<void>(`/api/Timesheets/${timesheetId}/organization/${organizationId}/files/${fileId}`);
  }
}
