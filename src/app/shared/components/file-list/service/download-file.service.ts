import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

@Injectable()
export class OrderFileService {

  constructor(private http: HttpClient) { }

  public downloadFile(orderId: number, documentId: string): Observable<Blob> {
    return this.http.get(`/api/orders/${orderId}/document/${documentId}`, {
      responseType: 'blob',
    });
  }
}
