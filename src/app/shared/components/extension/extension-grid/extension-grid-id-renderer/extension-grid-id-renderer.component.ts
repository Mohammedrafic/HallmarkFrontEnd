import { Component } from '@angular/core';
import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { OrderManagementService } from '@client/order-management/order-management-content/order-management.service';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';

@Component({
  selector: 'app-extension-grid-id-renderer',
  templateUrl: './extension-grid-id-renderer.component.html',
  styleUrls: ['./extension-grid-id-renderer.component.scss'],
})
export class ExtensionGridIdRendererComponent implements ICellRendererAngularComp {
  public params: ICellRendererParams;

  public constructor(private orderManagementService: OrderManagementService, private orderManagementAgencyService: OrderManagementAgencyService) {}

  public agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  public refresh(params: ICellRendererParams): boolean {
    return false;
  }

  public redirectAndSelectExtension(): void {
    this.orderManagementService.orderId$.next({id: this.params.data?.publicId, prefix: this.params.data?.organizationPrefix});
    this.orderManagementAgencyService.orderId$.next({id: this.params.data?.publicId, prefix: this.params.data?.organizationPrefix});
  }
}
