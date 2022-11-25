import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { DestroyDialog } from '@core/helpers';

@Component({
  selector: 'app-invoice-payment-details',
  templateUrl: './invoice-payment-details.component.html',
  styleUrls: ['./invoice-payment-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoicePaymentDetailsComponent extends DestroyDialog implements OnInit {

  ngOnInit(): void {
    this.watchForCloseStream();
  }

  closePaymentDialog() {}
}
