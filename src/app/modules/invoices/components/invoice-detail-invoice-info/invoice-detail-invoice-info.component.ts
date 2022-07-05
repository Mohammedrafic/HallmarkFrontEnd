import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Invoice } from '../../interfaces';

interface InvoiceInfoUIItem {
  icon: string;
  value: unknown;
  title: string;
  isHide?: boolean;
  isAmount?: boolean;
}

@Component({
  selector: 'app-invoice-detail-invoice-info',
  templateUrl: './invoice-detail-invoice-info.component.html',
  styleUrls: ['./invoice-detail-invoice-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InvoiceDetailInvoiceInfoComponent implements OnChanges {
  @Input() invoiceInfo: Invoice;

  public items: InvoiceInfoUIItem[] = [];

  constructor(private datePipe: DatePipe) {
  }

  ngOnChanges(): void {
    if (this.invoiceInfo) {
      this.items = this.getUIItems(this.invoiceInfo);
    }
  }

  public trackByTitle(_: number, item: InvoiceInfoUIItem): string {
    return item.title;
  }

  private getUIItems(data: Invoice): InvoiceInfoUIItem[] {
    return [
      {
        title: 'Invoice to',
        icon: 'user',
        value: data.location,
      },
      {
        title: 'Net Payment Terms',
        icon: 'package',
        value: 45,
      },
      {
        title: 'Department',
        icon: 'folder',
        value: data.department,
      },
      {
        title: 'Invoice Amount',
        icon: '',
        value: `$${Number((data.amount * 1.05).toFixed(2))}`,
        isAmount: true,
      },
      {
        title: 'Location',
        icon: 'map-pin',
        value: data.location,
      },
      {
        title: 'Invoice Date',
        icon: 'calendar',
        value: `${this.datePipe.transform(data.issuedDate, 'MM/d/y')}`,
      },
      {
        title: 'Due Date',
        icon: 'calendar',
        value: `${this.datePipe.transform(data.dueDate, 'MM/d/y')}`,
      },
    ];
  }
}
