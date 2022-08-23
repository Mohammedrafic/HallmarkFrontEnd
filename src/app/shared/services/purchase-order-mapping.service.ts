import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrderMapping, PurchaseOrderMappingPage, SavePurchaseOrderMappingDto, PurchaseOrderNames, PurchaseOrderMappingFilters } from 'src/app/shared/models/purchase-order-mapping.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderMappingService {

  constructor(private http: HttpClient) { }

  /**
 * Get all purchase order mappings
 * @return list of purchase order maapings
 */
  public getPurchaseOrderMappings(filter: PurchaseOrderMappingFilters): Observable<PurchaseOrderMappingPage> {
    return this.http.post<PurchaseOrderMappingPage>(`/api/PurchaseOrdersSettings/setup/getFiltered`, filter);
  }

  /**
   * insert or update a purchase order mapping record
   * @return created/updated record
   */
  public savePurchaseOrderMapping(purchaseOrderMapping: SavePurchaseOrderMappingDto): Observable<SavePurchaseOrderMappingDto> {
    return this.http.post<SavePurchaseOrderMappingDto>(`/api/PurchaseOrdersSettings/setup`, purchaseOrderMapping);
  }

  /**
   * Remove purchase order mapping by its id
   * @param id
   */
  public removePurchaseOrderMapping(id: number): Observable<any> {
    return this.http.delete<PurchaseOrderMapping>(`/api/PurchaseOrdersSettings/setup/${id}`);
  }
  
}

