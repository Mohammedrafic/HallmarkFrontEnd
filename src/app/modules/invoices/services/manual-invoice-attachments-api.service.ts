import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
}
