import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';

import { InvoiceDetail, InvoiceInfoUIItem } from '../../interfaces';
import { InvoicesContainerService } from '../../services/invoices-container/invoices-container.service';

@Component({
  selector: 'app-invoice-detail-invoice-info',
  templateUrl: './invoice-detail-invoice-info.component.html',
  styleUrls: ['./invoice-detail-invoice-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailInvoiceInfoComponent implements OnChanges {
  @Input() invoiceInfo: InvoiceDetail;

  @Output() detailsOpen: EventEmitter<void> = new EventEmitter();

  public items: InvoiceInfoUIItem[] = [];

  constructor(
    private invoicesContainerService: InvoicesContainerService
  ) {
  }

  ngOnChanges(): void {
    if (this.invoiceInfo) {
      this.items = this.invoicesContainerService.getDetailsUIItems(this.invoiceInfo);
    }
  }

  public trackByTitle(_: number, item: InvoiceInfoUIItem): string {
    return item.title;
  }

  public openPaymentDetails(): void {
    this.detailsOpen.emit();
  }
}
