import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';

import { ExportPayload } from '@shared/models/export.model';
import {
  TimesheetInvoice,
  TimesheetAttachment,
  TimesheetDetailsModel,
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

  public agencySubmitTimesheet(id: number): Observable<{}> {
    return of({});
  }

  public organizationApproveTimesheet(id: number): Observable<{}> {
    return of({});
  }

  public rejectTimesheet(id: number, rejectReason: string | null): Observable<null> {
    return of(null);
  }

  public getCandidateInvoices(id: number): Observable<TimesheetInvoice[]> {
    return of([
      {
        id: 1,
        fileName: 'Example',
        url: 'http://www.africau.edu/images/default/sample.pdf',
      }
    ]);
  }

  public loadInvoiceBlob(url: string): Observable<Blob> {
    return this.http.get(url, { responseType: 'blob' });
  }

  public uploadCandidateFiles(candidateId: number, files: Blob[]): Observable<TimesheetAttachment[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file))

    return of([]);
    // return this.http.post<TimesheetUploadedFile[]>('', formData);
  }

  public deleteCandidateFile(id: number): Observable<null> {
    return of(null);
  }

  public getTimesheetDetails(
    id: number,
    orgId: number,
    isAgency: boolean,
    ): Observable<TimesheetDetailsModel> {
    const endpoint = !isAgency ? `/api/Timesheets/${id}` : `/api/Timesheets/${id}/organization/${orgId}`
    return this.http.get<TimesheetDetailsModel>(endpoint);
  }
}
