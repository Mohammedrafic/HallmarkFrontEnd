import { Injectable } from '@angular/core';
import { OrganizationOrderManagementTabs } from '@shared/enums/order-management-tabs.enum';
import { OrderManagementPagerState } from '@shared/models/candidate.model';
import { GridComponent } from '@syncfusion/ej2-angular-grids';

@Injectable()
export class PreservedOrderService {
  private orderPagerState: OrderManagementPagerState | null = null;
  private preservedOrderId: number | null = null;
  private activeTab: OrganizationOrderManagementTabs;

  public preserveOrder(id: number, pagerState: OrderManagementPagerState): void {
    this.preservedOrderId = id;
    this.orderPagerState = pagerState;
  }

  public getPagerSate(): OrderManagementPagerState | null {
    return this.orderPagerState;
  }

  public resetPreservedOrder(): void {
    this.preservedOrderId = this.orderPagerState = null;
  }

  public applyGridState(grid: GridComponent): void {
    if (this.preservedOrderId && grid.dataSource) {
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
