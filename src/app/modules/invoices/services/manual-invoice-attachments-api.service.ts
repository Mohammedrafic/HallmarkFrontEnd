import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, forkJoin, map, Observable, of } from 'rxjs';

@Injectable()
export class ManualInvoiceAttachmentsApiService {
  constructor(
    private readonly http: HttpClient,
  ) { }

  public downloadAttachment(fileId: number, organizationId: number | null): Observable<Blob> {
    return organizationId === null ?
      this.organizationDownloadAttachment(fileId) :
      this.agencyDownloadAttachment(fileId, organizationId);
  }

  public downloadPDFAttachment(fileId: number, organizationId: number | null): Observable<Blob> {
    return organizationId === null ?
      this.organizationDownloadPDFAttachment(fileId) :
      this.agencyDownloadPDFAttachment(fileId, organizationId);
  }

  public deleteAttachment(fileId: number, invoiceId: number, organizationId: number | null): Observable<number> {
    return organizationId === null ?
      this.organizationDeleteAttachment(fileId, invoiceId) :
      this.agencyDeleteAttachment(fileId, invoiceId, organizationId)
  }

  public deleteAttachments(fileIds: number[], invoiceId: number, organizationId: number | null): Observable<number[]> {
    if (!fileIds?.length) {
      return of([]);
    }

    const getDeleteObs = (fileId: number) => organizationId ?
      this.agencyDeleteAttachment(fileId, invoiceId, organizationId) :
      this.organizationDeleteAttachment(fileId, invoiceId);

    return forkJoin(
      fileIds.map(getDeleteObs)
    );
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

  private organizationDeleteAttachment(fileId: number, timesheetId: number): Observable<number> {
    return this.http.delete<void>(`/api/Timesheets/${timesheetId}/files/${fileId}`)
      .pipe(
        map(() => fileId),
      );
  }

  private agencyDeleteAttachment(fileId: number, timesheetId: number, organizationId: number): Observable<number> {
    return this.http.delete<void>(`/api/Timesheets/${timesheetId}/organization/${organizationId}/files/${fileId}`)
      .pipe(
        map(() => fileId),
      );
  }
}
