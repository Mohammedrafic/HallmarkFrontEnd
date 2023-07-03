import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EmployeeImportResult, ImportedEmployee } from '@shared/models/imported-employee';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeImportService {

  constructor(private http: HttpClient) {}

  public getImportEmployeeTemplate(): Observable<any> {
    return this.http.post('/api/Employee/template', [], { responseType: 'blob' });
  }

  public getImportEmployeeErrors(errorRecords: ImportedEmployee[]): Observable<any> {
    return this.http.post('/api/Employee/template', errorRecords, { responseType: 'blob' });
  }

  public uploadImportEmployeeFile(file: Blob): Observable<EmployeeImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<EmployeeImportResult>('/api/Employee/import', formData);
  }

  public saveImportEmployeeResult(successfullRecords: ImportedEmployee[]): Observable<EmployeeImportResult> {
    return this.http.post<EmployeeImportResult>('/api/Employee/saveimport', successfullRecords);
  }

}
