import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { Timesheet } from '../../../interface';
import { TimesheetsTableColumns } from '../../../enums';
import { OrderManagementAgencyService } from '@agency/order-management/order-management-agency.service';
import {
  OrderManagementService,
} from '@client/order-management/components/order-management-content/order-management.service';

@Component({
  selector: 'app-timesheet-table-link',
  templateUrl: './timesheet-table-link.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimesheetTableLinkComponent implements ICellRendererAngularComp {
  public displayValue = '';

  private cellValue: Timesheet;
  private isAgency = false;
  private params: ICellRendererParams;

  constructor(private router: Router, private orderManagementAgencyService: OrderManagementAgencyService, private orderManagementService: OrderManagementService) {
    this.isAgency = this.router.url.includes('agency');
  }

  // gets called once before the renderer is used
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.cellValue = params.data;
    this.displayValue = params.valueFormatted || params.value;
  }

  // gets called whenever the cell refreshes
  refresh(params: ICellRendererParams): boolean {
    return true;
  }

  public navigateTo(event: MouseEvent): void {
    event.stopImmediatePropagation();
    if (this.isAgency) {
      if (this.params.colDef?.field === TimesheetsTableColumns.Name) {
        this.router.navigate(['agency/candidates/edit', this.cellValue.candidateId]);
      } else if (this.params.colDef?.field === TimesheetsTableColumns.OrderId) {
        this.orderManagementAgencyService.selectedOrderAfterRedirect$.next({
          orderId: this.cellValue.orderPublicId,
          candidateId: this.cellValue.candidateId,
          orderType: null,
          prefix: this.params.data.orgPrefix,
        });
        this.router.navigate(['agency/order-management'], {
          state: { publicId: this.cellValue.orderPublicId, prefix: this.params.data.orgPrefix }
        });
      }
    } else {
      if (this.params.colDef?.field === TimesheetsTableColumns.OrderId) {
        this.orderManagementService.selectedOrderAfterRedirect$.next({
          orderId: this.cellValue.orderPublicId,
          candidateId: this.cellValue.candidateId,
          orderType: null,
          prefix: this.params.data.orgPrefix,
        });
        this.router.navigate(['client/order-management'], {
          state: { publicId: this.cellValue.orderPublicId, timesheetRedirect: true, prefix: this.cellValue.orgPrefix }
        });
      }
    }
  }
}
