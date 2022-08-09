import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PurchaseOrder, PurchaseOrderPage } from 'src/app/shared/models/purchase-order.model';

@Injectable({ providedIn: 'root' })
export class PurchaseOrderService {

  constructor(private http: HttpClient) { }

  /**
 * Get all purchase orders
 * @return list of purchase orders
 */
  public getPurchaseOrders(): Observable<PurchaseOrderPage> {
    return this.http.get<PurchaseOrderPage>(`/api/PurchaseOrders`);
  }

  /**
    * Get purchase order by id
    * @return single purchase order record
    */
  public getPurchaseOrderById(Id: number): Observable<PurchaseOrder> {
    return this.http.get<PurchaseOrder>(`/api/PurchaseOrders/${Id}`);
  }

  /**
   * Get purchase order by name
   * @return list Purchase Order record
   */
  public getPurchaseOrderByName(name: string): Observable<PurchaseOrder[]> {
    return this.http.get<PurchaseOrder[]>(`/api/PurchaseOrders/${name}`);
  }

  /**
   * insert or update a purchase order record
   * @return created/updated record
   */
  public savePurchaseOrder(specialProject: PurchaseOrder): Observable<PurchaseOrder> {
    return this.http.put<PurchaseOrder>(`/api/PurchaseOrders/`, specialProject);
  }

  /**
   * Remove special project by its id
   * @param id
   */
  public removePurchaseOrder(id: number): Observable<any> {
    return this.http.delete<PurchaseOrder>(`/api/PurchaseOrders?id=${id}`);
  }

}
