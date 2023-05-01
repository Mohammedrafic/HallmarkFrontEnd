import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Store } from '@ngxs/store';
import { VendorScorePayload, VendorScorecardresponse } from '@shared/models/vendorscorecard.model';
import { Observable } from 'rxjs';

@Injectable()
export class VendorscorecardService {
constructor(
    private store: Store,
    private http: HttpClient,
  ) {}


public VendorscorecardFilter(filters: VendorScorePayload): Observable<VendorScorecardresponse> {
    debugger;
    if (filters) {
        return this.http.post<VendorScorecardresponse>(`/api/Reports/Vendorpost`, filters);
    }
    return this.http.post<VendorScorecardresponse>(`/api/Reports/Vendorpost`, filters);
  }
}