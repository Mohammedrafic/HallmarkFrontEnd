import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ExportPayload } from '@shared/models/export.model';

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

  public rejectTimesheet(id: number): Observable<null> {
    return of(null);
  }

  // public uploadFile(data: ProfileUploadedFile): Observable<ProfileUploadedFile> {
  //   return of(data);
  // }

  // public deleteFile(data: ProfileUploadedFile): Observable<boolean> {
  //   return of(true);
  // }
}
