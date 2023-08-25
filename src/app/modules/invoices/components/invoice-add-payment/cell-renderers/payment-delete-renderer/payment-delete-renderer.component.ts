import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';

import { InvoiceAddPaymentComponent } from '../../invoice-add-payment.component';
import { Permission } from '../../../../../../core/interface';
import { UserPermissions } from '../../../../../../core/enums';
import { Store } from '@ngxs/store';
import { InvoicesModel } from '../../../../store/invoices.model';
import { UserState } from '../../../../../../store/user.state';
import { filter, take } from 'rxjs';

@Component({
  selector: 'app-payment-delete-renderer',
  templateUrl: './payment-delete-renderer.component.html',
  styleUrls: ['./payment-delete-renderer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentDeleteRendererComponent implements ICellRendererAngularComp {
  private invoiceId: string;
  public isAgency: boolean;
  public userPermission: Permission = {};
  public readonly userPermissions = UserPermissions;

  private componentParent: InvoiceAddPaymentComponent;

  /**
   * TODO: rename
   */
  private invoiceDbId: number;

  constructor(
    private store: Store
  ) {    
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
    this.getuserPermission();
  }
  agInit(params: ICellRendererParams): void {
    this.componentParent = params.context.componentParent;
    this.invoiceId = params.data.invoiceNumber;
    this.invoiceDbId = params.data.id;
  }

  refresh(): boolean {
    return true;
  }

  deleteRecord(): void {
    this.componentParent.deletePayment(this.invoiceId, this.invoiceDbId);
  }
  private getuserPermission(): void {
    this.store.select(UserState.userPermission).pipe(
      filter((permissions: Permission) => !!Object.keys(permissions).length), take(1)
    ).subscribe((permissions: Permission) => {
      this.userPermission = permissions;
    });
  }
}
