import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
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
}
