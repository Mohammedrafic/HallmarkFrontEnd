import { Injectable } from '@angular/core';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementPagerState } from '@shared/models/candidate.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class PreservedOrderService {
  private orderPagerState: OrderManagementPagerState | null = null;
  private preservedOrderId: number | null = null;
  private activeTab: OrganizationOrderManagementTabs | null;
  private preservedOrder$ = new Subject<boolean>();

  public getPreserveOrder(): Observable<boolean> {
    return this.preservedOrder$.asObservable();
  }

  public setPreservedOrder(): void {
    this.preservedOrder$.next(true);
  }

  public preserveOrder(id: number, pagerState: OrderManagementPagerState): void {
    this.preservedOrderId = id;
    this.orderPagerState = pagerState;
  }

  public setActiveTab(activeTab: OrganizationOrderManagementTabs): void {
    this.activeTab = activeTab;
  }

  public getActiveTab(): OrganizationOrderManagementTabs {
    return this.activeTab || OrganizationOrderManagementTabs.AllOrders;
  }

  public getPagerSate(): OrderManagementPagerState | null {
    return this.orderPagerState;
  }

  public resetPreservedOrder(): void {
    this.preservedOrderId = this.orderPagerState = this.activeTab = null;
  }

  public applyGridState(grid: GridComponent): void {
    if (this.preservedOrderId) {
      const rowIndex = grid.getRowIndexByPrimaryKey(this.preservedOrderId);
      if (rowIndex > -1) {
        grid.selectRow(rowIndex);
      }
      this.resetPreservedOrder();
    }
  }

  public isOrderPreserved(): boolean {
    return !!this.preservedOrderId;
  }
}
