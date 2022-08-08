import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ManualInvoiceReason } from '../interfaces';

@Injectable()
export class InvoiceApiService {
  constructor(
    private http: HttpClient,
  ) {}

  public getInvoiceReasons(): Observable<ManualInvoiceReason[]> {
    return this.http.get<ManualInvoiceReason[]>('api/ManualInvoiceReasons');
  }
}
