import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Select, Store } from '@ngxs/store';
import { filter, Observable, switchMap, takeUntil, tap } from 'rxjs';

import { DestroyDialog } from '@core/helpers';
import { InvoiceDetail, InvoicePaymentGetParams, PaymentMeta } from '../../interfaces';
import { InvoicesState } from '../../store/state/invoices.state';
import { Invoices } from '../../store/actions/invoices.actions';
import { InvoicesModel } from '../../store/invoices.model';

@Component({
  selector: 'app-invoice-payment-details',
  templateUrl: './invoice-payment-details.component.html',
  styleUrls: ['./invoice-payment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentDetailsComponent extends DestroyDialog implements OnInit {
  @Select(InvoicesState.invoiceDetails)
  private readonly invoiceDetail$: Observable<InvoiceDetail>;

  private isAgency = false;

  private currentOrgId: number;

  public readonly invoiceData: PaymentMeta = {
    invoiceNumber: null,
    amount: null,
  };

  constructor(
    private store: Store,
  ) {
    super();
    this.isAgency = (this.store.snapshot().invoices as InvoicesModel).isAgencyArea;
    this.currentOrgId = (this.store.snapshot().invoices as InvoicesModel).selectedOrganizationId;
  }

  ngOnInit(): void {
    this.watchForCloseStream();
    this.watchForInvoiceDetails();
  }

  private watchForInvoiceDetails(): void {
    this.invoiceDetail$.pipe(
      filter(Boolean),
      tap((invoice) => {
        this.invoiceData.invoiceNumber = invoice.meta.formattedInvoiceNumber;
        this.invoiceData.amount = invoice.totals.amount;
      }),
      switchMap((details) => {
        const dto: InvoicePaymentGetParams =  {
          InvoiceId: details.meta.invoiceId,
          OrganizationId: this.currentOrgId,
          ...this.isAgency ? { AgencySuffix: details.meta.agencySuffix } : {},
        };

        return this.store.dispatch(new Invoices.GetPaymentDetails(dto));
      }),
      takeUntil(this.componentDestroy()),
    )
    .subscribe();
  }
}
