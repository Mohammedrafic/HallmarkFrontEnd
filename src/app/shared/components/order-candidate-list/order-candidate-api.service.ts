import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IrpOrderCandidate, IrpOrderCandidateDto } from '@shared/models/order-management.model';
import { PageOfCollections } from '@shared/models/page.model';
import { map, Observable } from 'rxjs';
import { AdaptIrpCandidates } from './order-candidate-list.utils';

@Injectable()
export class OrderCandidateApiService {
  constructor(
    private http: HttpClient,
  ) {}

  getIrpCandidates(orderId: number): Observable<PageOfCollections<IrpOrderCandidate>> {
    return this.http.get<PageOfCollections<IrpOrderCandidateDto>>(`/api/IRPOrders/${orderId}/candidates`)
    .pipe(
      map((response) => AdaptIrpCandidates(response))
    );
  }
}
