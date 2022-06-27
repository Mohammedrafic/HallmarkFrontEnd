import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { ExportPayload } from "@shared/models/export.model";

@Injectable()
export class TimesheetDetailsService {
  constructor(private http: HttpClient) { }

  public exportDetails(data: ExportPayload): Observable<Blob>  {
    const testData = {field1: 'Field1Value', field2: 'Field2Value'};
    return of(new Blob([JSON.stringify(testData, null, 2)], {type: 'application/csv'}));
  }
}
