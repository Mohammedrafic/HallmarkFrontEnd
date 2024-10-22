import { Inject, Injectable } from '@angular/core';

import { GridComponent } from '@syncfusion/ej2-angular-grids';
import { Observable, Subject } from 'rxjs';

import { OrderManagementIRPSystemId, OrderManagementIRPTabs,
  OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementPagerState } from '@shared/models/candidate.model';
import { OrderSystem } from '@client/order-management/enums';
import { GlobalWindow } from '@core/tokens';

@Injectable()
export class PreservedOrderService {
  private orderPagerState: OrderManagementPagerState | null = null;
  private preservedOrderId: number | null = null;
  private activeTab: OrganizationOrderManagementTabs | null;
  private preservedOrder$ = new Subject<boolean>();
  private irpActiveTab: OrderManagementIRPTabs;

  constructor(@Inject(GlobalWindow) protected readonly globalWindow: WindowProxy & typeof globalThis) {}

  public getPreserveOrderStream(): Observable<boolean> {
    return this.preservedOrder$.asObservable();
  }

  public setPreservedOrder(): void {
    this.preservedOrder$.next(true);
  }

  public getPreservedOrderId(): number | null {
    return this.preservedOrderId;
  }

  public preserveOrder(id: number, pagerState: OrderManagementPagerState): void {
    this.preservedOrderId = id;
    this.orderPagerState = pagerState;
  }

  public setActiveTab(activeTab: OrganizationOrderManagementTabs): void {
    this.activeTab = activeTab;
  }

  public setIrpActiveTab(activeTab: OrderManagementIRPTabs): void {
    this.irpActiveTab = activeTab;
  }

  public getIrpActiveTab(): OrderManagementIRPTabs {
    return this.irpActiveTab || OrderManagementIRPTabs.AllOrders;
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

  public saveSelectedOrderSystem(system: OrderSystem): void {
    if(system === OrderSystem.VMS) {
      this.globalWindow.localStorage.setItem('selectedOrderManagementSystem', OrderManagementIRPSystemId.VMS.toString());
      return;
    }

    this.globalWindow.localStorage.setItem('selectedOrderManagementSystem', OrderManagementIRPSystemId.IRP.toString());
  }

  public findIrpTabIndex(tab: OrderManagementIRPTabs): number {
    return Object.values(OrderManagementIRPTabs).indexOf(tab);
  }
}
